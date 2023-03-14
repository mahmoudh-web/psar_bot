import { DateTime } from "luxon"

import { marketBuy, marketSell } from "../func/binance.js"
import * as indicators from "../indicators/indicators.js"
import { addIndicatorData } from "../func/candles.js"
import { storeTrade } from "../func/storeTrade.js"
import { macdBuy, macdSell } from "./signals/macdSignals.js"

const amount = process.env.AMOUNT

const MacdBot = async (instrument, balance) => {
	const { symbol, token, settings } = instrument
	const candleInfo = [...instrument.candles]
	// console.log(`Looking for signal on ${symbol} - (${token})`)

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
	const sellSignal = macdSell(candleData.at(-1))
	const buySignal = macdBuy(candleData.at(-1))

	// check balances
	const usdt = balance["USDT"]
	const tokenBalance = balance[token]
	const tokenValue = tokenBalance * candleData.at(-1).open

	// console.log(symbol, tokenValue)
	if (sellSignal && tokenValue > 10) {
		const trade = await marketSell(symbol, tokenBalance)
		console.log(
			`${DateTime.now().toISO()}: SELL ${token}:` // ${trade.info.status}`
		)
		await storeTrade(trade)
	} else if (buySignal && tokenValue < 10 && usdt > amount) {
		const trade = await marketBuy(symbol)
		console.log(
			`${DateTime.now().toISO()}: BUY ${token}:` // ${trade.info.status}`
		)
		await storeTrade(trade)
	} //else {
	// 	console.log(`${DateTime.now().toISO()}: NO SIGNAL ${symbol}`)
	// }
}

export default MacdBot
