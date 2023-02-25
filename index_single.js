import * as dotenv from "dotenv"
dotenv.config()

import WebSocket from "ws"
import { extractCandleData } from "./candles.js"
import { DateTime } from "luxon"
import { getTokenBalance } from "./ccxtBinance.js"
import { checkSignal } from "./checkSignal.js"

const token = process.env.SYMBOL
const timeframe = process.env.INTERVAL

const limit = Number(process.env.BOLLINGER_PERIOD) + 1

// get candles
const candles = []

const url = `wss://stream.binance.com:9443/ws/${token.toLowerCase()}@kline_${timeframe}`
const stream = new WebSocket(url)

stream.on("error", console.error)

stream.on("open", function open() {
	console.log("Connected")
})

stream.on("message", async data => {
	const msg = JSON.parse(data)
	const candle = extractCandleData(msg)

	let newCandle = false

	if (!candles.length) {
		candles.push(candle)
	} else if (candles.at(-1).startTime === candle.startTime) {
		candles.pop()
		candles.push(candle)
	} else {
		candles.push(candle)
		if (candles.length > limit) {
			candles.shift()
		}
		newCandle = true
	}

	console.log(`${DateTime.now().toISO()}: New Tick Data`)

	if (candles.length < limit)
		console.log(`Have ${candles.length} candles, waiting for ${limit}`)

	if (newCandle) {
		console.log(`${DateTime.now().toISO()}: New Candle`)
		if (candles.length >= limit) {
			// const candleData = await checkSignal(candles)
			await checkSignal(candles)
			// console.log(candleData)
		}
	}
})
