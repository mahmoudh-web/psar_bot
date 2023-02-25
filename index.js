import * as dotenv from "dotenv"
dotenv.config()

import WebSocket from "ws"
import { connect, disconnect, database } from "./func/db.js"
import { getTokens } from "./func/getTokens.js"
import { connectionString } from "./func/stream.js"
import { extractCandleData } from "./candles.js"

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
	console.log("Connected")
})

stream.on("message", async data => {
	const msg = JSON.parse(data)
	const candle = extractCandleData(msg)

	const index = tokens.findIndex(obj => obj.symbol === candle.symbol)
	console.log(
		`New tick data for ${tokens[index].symbol} = Have ${tokens[index].candles.length} candles`
	)
	if (!tokens[index].candles.length) {
		tokens[index].candles.push(candle)
	} else if (tokens[index].candles.at(-1).startTime === candle.startTime) {
		tokens[index].candles.pop()
		tokens[index].candles.push(candle)
	} else {
		tokens[index].candles.push(candle)
		if (tokens[index].candles.length > tokens[index].limit) {
			tokens[index].candles.shift()
			// process candle
			console.log(
				`Looking for signal on ${tokens[index].symbol}, ${tokens[index].candles.length} candles stored`
			)
		}
	}

	// console.log(JSON.stringify(tokens, null, 2))
})
