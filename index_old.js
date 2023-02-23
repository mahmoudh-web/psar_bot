import * as dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config()

import WebSocket from "ws"

import { connectDb } from "./mongo/connection.js"
import { instruments } from "./mongo/schema.js"

await connectDb()

// get instruments
const instrumentsList = await instruments.find({}).limit(10)
mongoose.disconnect()

if (!instrumentsList.length) process.exit(0)

console.log("found items")

// set up array with instruments and their received data
const data = []

instrumentsList.forEach(instrument => {
	const limit =
		instrument.sma > instrument.macd.long
			? instrument.sma
			: instrument.macd.long
	data.push({
		instrument: instrument.instrument,
		limit: 2,
		candles: [],
	})
})

// set stream url
let streamUrl = ""
for (let i = 0; i < instrumentsList.length; i++) {
	streamUrl += `${instrumentsList[i].instrument.toLowerCase()}@${
		instrumentsList[i].timeframe
	}`
	if (i < instrumentsList.length - 1) {
		streamUrl += "/"
	}
}

const url = `wss://stream.binance.com:9443/stream?streams=${streamUrl}`

const stream = new WebSocket(url)

stream.on("error", console.error)

stream.on("open", function open() {
	console.log("Connected")
})

stream.on("message", data => {
	const msg = JSON.parse(data)
	const instrument = storeCandle(msg.data)
	console.log(
		`processed candle for ${instrument.instrument}, ${instrument.new}`
	)
})

function storeCandle(candle) {
	const instrument = data.find(element => element.instrument === candle.s)
	let newCandle = false

	if (!instrument.candles.length) {
		instrument.candles.push(setCandleData(candle))
	} else if (instrument.candles.at(-1).openTime === candle.k.t) {
		const index = instrument.candles.findIndex(
			storeCandle => storeCandle.openTime === candle.k.t
		)
		instrument.candles[index] = setCandleData(candle)
	} else {
		instrument.candles.push(setCandleData(candle))
		if (instrument.candles.length > instrument.limit)
			instrument.candles.shift()
		newCandle = true
	}
	return { instrument: instrument.instrument, new: newCandle }
}

function setCandleData(candle) {
	return {
		open: candle.k.o,
		close: candle.k.c,
		high: candle.k.h,
		low: candle.k.l,
		volume: candle.k.v,
		openTime: candle.k.t,
		closeTime: candle.k.T,
	}
}
