import { DateTime } from "luxon"
import { marketBuy, marketSell } from "../func/binance.js"
import * as indicators from "../indicators/indicators.js"
import { addIndicatorData } from "../func/candles.js"
import { storeTrade } from "../func/storeTrade.js"

const amount = process.env.AMOUNT

const psarMacd = async (instrument, balance) => {
	const { symbol, token, settings } = instrument
	const candleInfo = [...instrument.candles]
	// console.log(`Looking for signal on ${symbol} - (${token})`)

	// apply indicators
	const psar = indicators.psar(candleInfo, settings.psar)
	const macd = indicators.macd(candleInfo, settings.macd)
	const bollinger = indicators.bollinger(candleInfo, settings.bollinger)

	const candleData = addIndicatorData(
		candleInfo,
		{ name: "psar", data: psar },
		{ name: "bollinger_lower", data: bollinger.lower },
		{ name: "bollinger_middle", data: bollinger.middle },
		{ name: "bollinger_upper", data: bollinger.upper },
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

function buy(candle) {
	const { psar, bollinger_lower, low, open } = candle
	return open < bollinger_lower && psar < low
	// return macd_line < 0 && macd_signal < 0 && macd_histogram > 0 && psar < low
}

function sell(candle) {
	const { psar, macd_line, macd_signal, macd_histogram, high } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0 && psar > high
}

export { psarMacd }
