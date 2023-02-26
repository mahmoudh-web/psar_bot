import { getBalance, marketBuy, marketSell } from "./binance.js"
import * as indicators from "./indicators.js"
import { addIndicatorData } from "./candles.js"
import { DateTime } from "luxon"

const psar_settings = {
	increment: process.env.PSAR_INCREMENT,
	max: process.env.PSAR_MAX,
}

const bollinger_settings = {
	period: process.env.BOLLINGER_PERIOD,
	deviation: process.env.BOLLINGER_DEVIATION,
}

const amount = process.env.AMOUNT

const signal = async (symbol, token, candles) => {
	// console.log(`Looking for signal on ${symbol} - (${token})`)

	// apply indicators
	const PSAR = indicators.psar(candles, psar_settings)
	const bollinger = indicators.bollinger(candles, bollinger_settings)

	const candleData = addIndicatorData(
		candles,
		{ name: "psar", data: PSAR },
		{ name: "bollinger_lower", data: bollinger.lower },
		{ name: "bollinger_middle", data: bollinger.middle },
		{ name: "bollinger_upper", data: bollinger.upper }
	)

	const balances = await getBalance()
	const usdt = balances["USDT"].free
	const tokenBalance = balances[token].free
	const tokenValue = tokenBalance * candleData.at(-1).close
	// console.log(`BALANCES: USDT -> ${usdt}, ${token} -> ${tokenBalance}`)

	// if token balance, look for sell, otherwise look for buy
	if (tokenValue > 10 && sell(candleData.at(-1))) {
		// console.log(
		// 	`SELL ${symbol} - ${DateTime.fromMillis(
		// 		candleData.at(-1).startTime
		// 	).toISO()}`
		// )
		const trade = await marketSell(symbol, tokenBalance)
		// console.log(`SELL ${token}: ${trade.info.status}`)
	} else if (usdt > amount + 1 && buy(candleData.at(-1))) {
		// console.log(
		// 	`BUY ${symbol} - ${DateTime.fromMillis(
		// 		candleData.at(-1).startTime
		// 	).toISO()}`
		// )
		const trade = await marketBuy(symbol)
		// console.log(`BUY ${token}: ${trade.info.status}`)
	} //else {
	// console.log(
	// 	`NO SIGNAL ${symbol} - ${DateTime.fromMillis(
	// 		candleData.at(-1).startTime
	// 	).toISO()}`
	// )
	//}
}

function buy(candle) {
	return candle.open < candle.bollinger_lower && candle.psar < candle.low
}

function sell(candle) {
	return candle.open > candle.bollinger_upper && candle.psar > candle.high
}

export { signal }
