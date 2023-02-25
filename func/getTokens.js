import * as dotenv from "dotenv"
dotenv.config()

import { database } from "./db.js"

const { client, db } = database()

const getTokens = async page => {
	const tokenList = []

	const botTokensCollection = db.collection("bot_tokens")

	const tokensPointer = botTokensCollection.find({}).skip(page).limit(10)

	await tokensPointer.forEach(token => {
		tokenList.push({
			symbol: token.symbol,
			interval: token.interval,
			settings: {
				psar: {
					psar_increment: token.psar_increment,
					psar_max: token.psar_max,
				},
				bollinger: {
					bollinger_period: token.bollinger_period,
					bollinger_deviation: token.bollinger_deviation,
				},
			},
			limit: token.bollinger_period + 1,
			candles: [],
			processed: false,
		})
	})

	return tokenList
}

export { getTokens }
