import { DateTime } from "luxon"

import { marketBuy, marketSell } from "../func/binance.js"
import * as indicators from "../indicators/indicators.js"
import { addIndicatorData } from "../func/candles.js"
import { storeTrade } from "../func/storeTrade.js"
import {
	macdDifferentBuy,
	macdDifferentSell,
} from "./signals/macdDifferentSignals.js"
const amount = process.env.AMOUNT

const macdDifferentBot = async (instrument, balance) => {
	const { symbol, token, settings, type } = instrument
	const candleInfo = JSON.parse(JSON.stringify(instrument.candles))
	console.log(`Looking for signal on ${symbol} - (${type})`)

	// apply indicators
	const macdIn = await indicators.macd(candleInfo, settings.macd_in)
	const macdOut = await indicators.macd(candleInfo, settings.macd_out)

	const candleData = addIndicatorData(
		JSON.parse(JSON.stringify(candleInfo)),
		{ name: "macd_line_in", data: macdIn.macdLine },
		{ name: "macd_signal_in", data: macdIn.macdSignal },
		{ name: "macd_histogram_in", data: macdIn.histogram },
		{ name: "macd_line_out", data: macdOut.macdLine },
		{ name: "macd_signal_out", data: macdOut.macdSignal },
		{ name: "macd_histogram_out", data: macdOut.histogram }
	)

	// console.log(symbol, candleData)

	// check for buy and sell signals
	const sellSignal = macdDifferentSell(candleData.at(-1))
	const buySignal = macdDifferentBuy(candleData.at(-1))

	// check balances
	const usdt = balance["USDT"]
	const tokenBalance = balance[token]
	const tokenValue = tokenBalance * candleData.at(-1).open

	if (sellSignal && tokenValue > 10) {
		// const trade = await marketSell(symbol, tokenBalance)
		// await storeTrade(trade, candleData.at(-1))
		console.log(
			`${DateTime.now().toISO()}: SELL ${token}:` // ${trade.info.status}`
		)
	} else if (buySignal && tokenValue < 10 && usdt > amount) {
		// const trade = await marketBuy(symbol)
		// await storeTrade(trade, candleData.at(-1))
		console.log(
			`${DateTime.now().toISO()}: BUY ${token}:` // ${trade.info.status}`
		)
	} else {
		console.log(`${DateTime.now().toISO()}: NO SIGNAL ${symbol}`)
	}
}

export default macdDifferentBot
