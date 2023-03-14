import { DateTime } from "luxon"
import axios from "axios"
import tulind from "tulind"
import ta from "ta.js"
import { extractCandleData } from "./candles.js"
import { formatCandles } from "./candles.js"
import * as indicators from "./indicators.js"
const candles = await axios({
	method: "get",
	url: "https://api.binance.com/api/v3/klines?symbol=ACHUSDT&interval=1m&limit=35",
}).then(res => res.data)

const candleData = []
candles.forEach(candle => {
	const data = {
		symbol: "ACHUSDT",
		startTime: candle[0],
		endTime: candle[6],
		open: candle[1],
		high: candle[2],
		low: candle[3],
		close: candle[4],
		volume: candle[5],
	}

	candleData.push(data)
})

// get close prices
const closePrices = []
candleData.forEach(candle => closePrices.push(Number(candle.close)))

const short = 2
const long = 23
const signal = 9

// tulind
const tulindRes = indicators.macd(candleData, { short, long, signal })

// ta.js
const macd_line = await ta.macd(closePrices, short, long)
const macd_signal = await ta.macd_signal(closePrices, short, long, signal)
const macd_bars = await ta.macd_bars(closePrices, short, long, signal)

console.log(tulindRes.histogram.at(-1))
console.log(macd_bars.at(-1))
