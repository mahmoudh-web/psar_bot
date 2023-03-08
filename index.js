import * as dotenv from "dotenv"
dotenv.config()

import WebSocket from "ws"
import { connect, disconnect, database } from "./func/db.js"
import { getTokens } from "./func/getTokens.js"
import { connectionString } from "./func/stream.js"
import { extractCandleData } from "./candles.js"
import { signal } from "./signal.js"
import { psarMacd } from "./psar_macd.js"

// get tokens from db
const page = Number(process.env.TOKEN_SET) - 1
const { client } = database()
await connect(client)

const tokens = await getTokens(page)

if (!tokens.length) {
	console.log("No Tokens to trade. Exiting")
	await disconnect(client)
	process.exit(0)
}

let tokensList = ""
for (let i = 0; i < tokens.length; i++) {
	tokensList += tokens[i].symbol
	if (i < tokens.length - 1) tokensList += ", "
}

console.log(`Retreieved settings for: ${tokensList}`)

const socketQuery = `wss://stream.binance.com:9443/stream?streams=${connectionString(
	tokens
)}`

const stream = new WebSocket(socketQuery)
stream.on("error", console.error)

stream.on("open", function open() {
	console.log("Connected to Stream")
})

stream.on("message", async data => {
	const msg = JSON.parse(data)
	const candle = extractCandleData(msg)

	const index = tokens.findIndex(obj => obj.symbol === candle.symbol)

	if (!tokens[index].candles.length) {
		console.log(`${tokens[index].symbol}: first candle`)
		tokens[index].candles.push(candle)
	} else if (tokens[index].candles.at(-1).startTime === candle.startTime) {
		console.log(`${tokens[index].symbol}: same candle`)
		tokens[index].candles.pop()
		tokens[index].candles.push(candle)
	} else {
		console.log(`${tokens[index].symbol}: new candle`)
		tokens[index].candles.push(candle)
		if (tokens[index].candles.length > tokens[index].limit) {
			tokens[index].candles.shift()
			// process candle
			await psarMacd(
				tokens[index]
				// .symbol,
				// tokens[index].token,
				// tokens[index].candles,
				// indicatorSettings
			)
		}
	}
	console.log(
		`${tokens[index].symbol}: ${tokens[index].candles.length} candles, need ${tokens[index].limit}`
	)
})
