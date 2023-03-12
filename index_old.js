import * as dotenv from "dotenv"
dotenv.config()

import WebSocket from "ws"
import supabase from "./func/supabase.js"
import { getActiveTokens } from "./func/getTokens.js"
import { connectionString } from "./func/stream.js"
import { getBalance } from "./binance.js"
import { extractCandleData } from "./candles.js"
import { psarMacd } from "./bots/psar_macd.js"

// get tokens from db
let tokens = await getActiveTokens()

// settings for socket stream
let { socketQuery, tokensList } = connectionString(tokens)
const updateStream = () => {
	;({ socketQuery, tokensList } = connectionString(tokens))
}

let balances = []
const updateBalances = async () => {
	// console.log("updating balances")
	balances = await getBalance()
}

await updateBalances()
setInterval(updateBalances, 20000)

// start stream
const dataStream = (url, tokenList) => {
	const stream = new WebSocket(url)

	stream.on("error", console.error)

	stream.on("open", function open() {
		console.log(`Connected to Stream for ${tokenList}`)
	})

	stream.on("message", data => {
		const msg = JSON.parse(data)
		const candle = extractCandleData(msg)

		const index = tokens.findIndex(obj => obj.symbol === candle.symbol)
		// console.log(
		// 	`${tokens[index].symbol}, ${tokens[index].interval} (${tokens[index].token}): ${tokens[index].candles.length} candles, need ${tokens[index].limit}`
		// )

		if (!tokens[index].candles.length) {
			// console.log(`${tokens[index].symbol}: first candle`)
			// tokens[index].candles.push(candle)
			tokens[index].candles = [...tokens[index].candles, candle]
		} else if (
			tokens[index].candles.at(-1).startTime === candle.startTime
		) {
			// console.log(`${tokens[index].symbol}: same candle`)
			tokens[index].candles.pop()
			// tokens[index].candles.push(candle)
			tokens[index].candles = [...tokens[index].candles, candle]
		} else {
			// console.log(`${tokens[index].symbol}: new candle`)
			// tokens[index].candles.push(candle)
			tokens[index].candles = [...tokens[index].candles, candle]
			if (tokens[index].candles.length > tokens[index].limit) {
				// console.log(
				// 	`${tokens[index].symbol}: processing candle, total candles ${tokens[index].candles.length}`
				// )
				tokens[index].candles.shift()

				// process candle
				psarMacd(tokens[index], balances)
			}
		}
	})

	stream.on("ping", () => stream.pong())
	stream.on("close", async () => {
		console.log("stream closed")
		tokens = await getActiveTokens()
		updateStream()
		candleData = dataStream(socketQuery, tokensList)
	})

	return {
		quit() {
			console.log("closing connection")
			stream.close()
		},
	}
}

let candleData = dataStream(socketQuery, tokensList)

// watch db for changes
const tokenChanges = supabase
	.channel("custom-all-channel")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "tokens" },
		async payload => {
			console.log("Change received!")
			candleData.quit()
		}
	)
	.subscribe()
