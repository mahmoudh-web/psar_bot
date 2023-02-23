import * as indicators from "./indicators.js"
import { addIndicatorData } from "./candles.js"
import { getTokenBalance } from "./ccxtBinance.js"

const psar_settings = {
	increment: process.env.PSAR_INCREMENT,
	max: process.env.PSAR_MAX,
}

const bollinger_settings = {
	period: process.env.BOLLINGER_PERIOD,
	deviation: process.env.BOLLINGER_DEVIATION,
}

const checkSignal = async candles => {
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

	// get token balance
	const tokenBalance = await getTokenBalance(process.env.TOKEN)
	if (/*tokenBalance > 0 &&*/ sell(candleData.at(-1))) {
		console.log("sell")
		return "sell"
	} else {
		if (buy(candleData.at(-1))) {
			console.log("buy")
			return "buy"
		} else {
			console.log("no signal")
			return "no signal"
		}
	}
}

function buy(candle) {
	if (candle.open < candle.bollinger_lower && candle.psar < candle.low)
		return true
	return false
}

function sell(candle) {
	if (candle.open > candle.bollinger_upper && candle.psar > candle.high)
		return true
	return false
}

export { checkSignal }
