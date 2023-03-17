import * as dotenv from "dotenv"
dotenv.config()

import supabase from "./supabase.js"
import { max } from "lodash-es"
import { historical } from "./historical.js"
import { DateTime } from "luxon"

const getActiveTokens = async () => {
	const { data: tokens, error: tokenError } = await supabase
		.from("tokens")
		.select()
		.eq("active", true)

	if (tokenError) {
		console.log(tokenError)
		return []
	}

	const tokenList = []

	tokens.forEach(token => {
		tokenList.push({
			type: token.type,
			symbol: token.symbol,
			token: token.token,
			interval: token.interval,
			settings: {
				psar: {
					increment: token.settings.psar.increment,
					max: token.settings.psar.max,
				},
				bollinger: {
					period: token.settings.bollinger.period,
					deviation: token.settings.bollinger.deviation,
				},
				macd_in: {
					short: token.settings.macd_in.short,
					long: token.settings.macd_in.long,
					signal: token.settings.macd_in.signal,
				},
				macd_out: {
					short: token.settings.macd_out.short,
					long: token.settings.macd_out.long,
					signal: token.settings.macd_out.signal,
				},
			},
			limit:
				max([
					token.settings.bollinger.period,
					token.settings.macd_in.long,
					token.settings.macd_out ? token.settings.macd_out.long : 0,
				]) + 1,
			candles: [],
		})
	})

	// populate tokens with historical candle data
	for await (let token of tokenList) {
		const candles = await historical(
			token.symbol,
			token.interval,
			token.limit
		)
		if (candles.length) {
			const index = tokenList.findIndex(
				obj => obj.symbol === token.symbol
			)

			candles.forEach(candle => {
				const candleData = {
					symbol: token.symbol,
					startTime: candle[0],
					startISO: DateTime.fromMillis(candle[0]).toISO(),
					endTime: candle[6],
					endISO: DateTime.fromMillis(candle[6]).toISO(),
					open: candle[1],
					high: candle[2],
					low: candle[3],
					close: candle[4],
					volume: candle[5],
				}

				tokenList[index].candles.push(candleData)
			})
		}
	}

	return tokenList
}

export { getActiveTokens }
