import * as indicators from "../indicators.js"
import { addIndicatorData } from "../candles.js"
import supabase from "../func/supabase.js"

const amount = process.env.AMOUNT
let activeTrade = false

const macdSignal = async (instrument, balance) => {
	const { symbol, token, settings } = instrument
	const candleInfo = [...instrument.candles]
	console.log(`Looking for signal on ${symbol} - (${token})`)

	// apply indicators
	const macd = indicators.macd(candleInfo, settings.macd)

	const candleData = addIndicatorData(
		candleInfo,
		{ name: "macd_line", data: macd.macdLine },
		{ name: "macd_signal", data: macd.macdSignal },
		{ name: "macd_histogram", data: macd.histogram }
	)

	// console.log(symbol, candleData)

	// check for buy and sell signals
	const sellSignal = sell(candleData.at(-1))
	const buySignal = buy(candleData.at(-1))

	// check balances
	const usdt = balance["USDT"]
	const tokenBalance = balance[token]
	const tokenValue = tokenBalance * candleData.at(-1).open

	// console.log(symbol, tokenValue)
	if (sellSignal) {
		console.log(`sell`, candleData.at(-1))
		const signalData = {
			symbol,
			direction: "sell",
			candle: candleData.at(-1),
		}

		const { data, error } = await supabase
			.from("signals")
			.insert(signalData)
		activeTrade = false
	} else if (buySignal) {
		console.log(`buy`, candleData.at(-1))

		const signalData = {
			symbol,
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

function buy(candle) {
	const { macd_line, macd_signal, macd_histogram } = candle
	// return open < bollinger_lower && psar < low
	return macd_line < 0 && macd_signal < 0 && macd_histogram > 0
}

function sell(candle) {
	const { macd_line, macd_signal, macd_histogram } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0
}

export default macdSignal
