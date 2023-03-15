import * as indicators from "../indicators/indicators.js"
import { addIndicatorData } from "../func/candles.js"
import supabase from "../func/supabase.js"
import { macdBuy, macdSell } from "./signals/macdSignals.js"

const amount = process.env.AMOUNT

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

	console.log(candleData)
	// check for buy and sell signals
	const sellSignal = macdSell(candleData.at(-1))
	const buySignal = macdBuy(candleData.at(-1))

	if (sellSignal) {
		const signalData = {
			symbol,
			// interval,
			// settings,
			direction: "sell",
			candle: candleData.at(-1),
		}

		console.log(`sell`, signalData)
		const { data, error } = await supabase
			.from("signals")
			.insert(signalData)
	} else if (buySignal) {
		// console.log(`buy`, candleData.at(-1))

		const signalData = {
			symbol,
			// interval,
			// settings,
			direction: "buy",
			candle: candleData.at(-1),
		}

		console.log(`buy`, signalData)
		const { data, error } = await supabase
			.from("signals")
			.insert(signalData)
	} //else {
	// 	console.log(`${DateTime.now().toISO()}: NO SIGNAL ${symbol}`)
	// }
}

export default macdSignal
