import { reverse, min } from "lodash-es"

const extractCandleData = candle => {
	const data = {
		startTime: candle.k.t,
		endTime: candle.k.T,
		open: candle.k.o,
		high: candle.k.h,
		low: candle.k.l,
		close: candle.k.c,
		volume: candle.k.v,
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
