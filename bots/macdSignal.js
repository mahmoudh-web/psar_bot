import * as indicators from "../indicators/indicators.js"
import { addIndicatorData } from "../func/candles.js"
import supabase from "../func/supabase.js"
import { macdBuy, macdSell } from "./signals/macdSignals.js"

const amount = process.env.AMOUNT
let activeTrade = false

const macdSignal = async (instrument, balance) => {
	const { symbol, token, settings, interval } = instrument
	const candleInfo = JSON.parse(JSON.stringify(instrument.candles))
	console.log(`Looking for signal on ${symbol} - (${token})`)

	// apply indicators
	const macd = await indicators.macd(candleInfo, settings.macd)

	const candleData = addIndicatorData(
		JSON.parse(JSON.stringify(candleInfo)),
		{ name: "macd_line", data: macd.macdLine },
		{ name: "macd_signal", data: macd.macdSignal },
		{ name: "macd_histogram", data: macd.histogram }
	)

	// check for buy and sell signals
	const sellSignal = macdSell(candleData.at(-1))
	const buySignal = macdBuy(candleData.at(-1))

	// check balances
	const usdt = balance["USDT"]
	const tokenBalance = balance[token]
	const tokenValue = tokenBalance * candleData.at(-1).open

	// console.log(symbol, tokenValue)
	if (sellSignal) {
		// console.log(`sell`, candleData.at(-1))
		const signalData = {
			symbol,
			interval,
			settings,
			direction: "sell",
			candle: candleData.at(-1),
		}

		const { data, error } = await supabase
			.from("signals")
			.insert(signalData)
		activeTrade = false
	} else if (buySignal) {
		// console.log(`buy`, candleData.at(-1))

		const signalData = {
			symbol,
			interval,
			settings,
			direction: "buy",
			candle: candleData.at(-1),
		}

		const { data, error } = await supabase
			.from("signals")
			.insert(signalData)
		activeTrade = true
	} //else {
	// 	console.log(`${DateTime.now().toISO()}: NO SIGNAL ${symbol}`)
	// }
}

export default macdSignal
