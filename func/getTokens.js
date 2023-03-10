import * as dotenv from "dotenv"
dotenv.config()

import { database } from "./db.js"
import { max } from "lodash-es"
const { client, db } = database()

const getTokens = async page => {
	const tokenList = []

	const botTokensCollection = db.collection("bot_tokens")

	const tokensPointer = botTokensCollection
		.find({})
		.skip(page * 10)
		.limit(10)

	await tokensPointer.forEach(token => {
		tokenList.push({
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
				macd: {
					short: token.settings.macd.short,
					long: token.settings.macd.long,
					signal: token.settings.macd.signal,
				},
			},
			limit:
				max([
					token.settings.bollinger.period,
					token.settings.macd.long,
				]) + 1,
			candles: [],
		})
	})

	return tokenList
}

export { getTokens }
