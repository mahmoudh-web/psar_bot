import axios from "axios"
import { DateTime } from "luxon"
import tulind from "tulind"
import * as indicators from "./indicators/indicators.js"

const candles = await axios({
	method: "get",
	url: "https://api.binance.com/api/v3/klines?symbol=ACHUSDT&interval=1m&limit=50",
}).then(res => res.data)

const candleData = candles.map(candle => {
	return {
		symbol: "ACHUSDT",
		startTime: candle[0],
		startISO: DateTime.fromMillis(candle[0]).toISO(),
		endTime: candle[6],
		endISO: DateTime.fromMillis(candle[6]).toISO(),
		open: Number(candle[1]),
		high: Number(candle[2]),
		low: Number(candle[3]),
		close: Number(candle[4]),
		volume: Number(candle[5]),
	}
})
const close = candleData.map(d => d.close)
// console.log(close)

const macdLine = []
const macdSignal = []
const histogram = []

const macd = await tulind.indicators.macd.indicator(
	[close],
	[2, 23, 9],
	(err, results) => {
		results[0].forEach(res => macdLine.push(res))
		results[1].forEach(res => macdSignal.push(res))
		results[2].forEach(res => histogram.push(res))

		return { macdLine, macdSignal, histogram }
	}
)
console.log(candleData.at(-2).startISO)
console.log("line", macdLine.at(-2))
console.log("signal", macdSignal.at(-2))
console.log("histogram", histogram.at(-2))
