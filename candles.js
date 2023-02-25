import { reverse, min } from "lodash-es"

const extractCandleData = candle => {
	const data = {
		symbol: candle.data.s,
		startTime: candle.data.k.t,
		endTime: candle.data.k.T,
		open: candle.data.k.o,
		high: candle.data.k.h,
		low: candle.data.k.l,
		close: candle.data.k.c,
		volume: candle.data.k.v,
	}

	return data
}

const formatCandles = candles => {
	const open = []
	const high = []
	const low = []
	const close = []
	const volume = []

	candles.forEach(candle => {
		open.push(candle.open)
		high.push(candle.high)
		low.push(candle.low)
		close.push(candle.close)
		volume.push(candle.volume)
	})

	return { open, high, low, close, volume }
}

const addIndicatorData = (candles, ...data) => {
	const candleData = reverse(candles)
	const lengths = []

	data.forEach(indicator => {
		const indicatorData = reverse(indicator.data)
		const name = indicator.name

		lengths.push(indicatorData.length)

		for (let i = 0; i < indicatorData.length; i++) {
			candleData[i][name] = indicatorData[i]
		}
	})

	const trimTo = min(lengths)

	do {
		candleData.pop()
	} while (candleData.length > trimTo)

	return reverse(candleData)
}

export { extractCandleData, formatCandles, addIndicatorData }
