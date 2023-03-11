import * as dotenv from "dotenv"
dotenv.config()

import WebSocket from "ws"
import { connect, disconnect, database } from "./func/db.js"
import { getTokens } from "./func/getTokens.js"
import { connectionString } from "./func/stream.js"
import { extractCandleData } from "./candles.js"
import { psarMacd } from "./psar_macd.js"
import { getBalance } from "./binance.js"

// get tokens from db
const page = Number(process.env.TOKEN_SET) - 1
const { client } = database()
await connect(client)

// const tokens = []
const tokens = await getTokens(page)

// const tokens = [tokensTemp[8]]
// console.log(tokens)
if (!tokens.length) {
	console.log("No Tokens to trade. Exiting")
	await disconnect(client)
	process.exit(0)
}

// add array to capture candle data
// tokens.forEach(token => (token.candles = []))

let tokensList = ""
for (let i = 0; i < tokens.length; i++) {
	tokensList += tokens[i].symbol
	if (i < tokens.length - 1) tokensList += ", "
}

console.log(`Retreieved settings for: ${tokensList}`)
//TODO: get candledata to match limit for each token

let balances = []
const updateBalances = async () => {
	console.log("updating balances")
	balances = await getBalance()
}

await updateBalances()
setInterval(updateBalances, 60000)

// set up stream
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
		// console.log(`${tokens[index].symbol}: first candle`)
		// tokens[index].candles.push(candle)
		tokens[index].candles = [...tokens[index].candles, candle]
	} else if (tokens[index].candles.at(-1).startTime === candle.startTime) {
		// console.log(`${tokens[index].symbol}: same candle`)
		tokens[index].candles.pop()
		// tokens[index].candles.push(candle)
		tokens[index].candles = [...tokens[index].candles, candle]
	} else {
		// console.log(`${tokens[index].symbol}: new candle`)
		// tokens[index].candles.push(candle)
		tokens[index].candles = [...tokens[index].candles, candle]
		if (tokens[index].candles.length > tokens[index].limit) {
			tokens[index].candles.shift()

			// process candle
			psarMacd(
				tokens[index],
				balances
				// .symbol,
				// tokens[index].token,
				// tokens[index].candles,
				// indicatorSettings
			)

			// add symbol to queue
			// const data = tokens[index]
			// queue.push(data)
			// console.log(data)
			// console.log(tokens[index].candles.length)
		}
	}

	// console.log(
	// 	`${tokens[index].symbol}, ${tokens[index].interval} (${tokens[index].token}): ${tokens[index].candles.length} candles, need ${tokens[index].limit}`
	// )
})

stream.on("ping", () => stream.pong())
stream.on("close", () => stream.open())
