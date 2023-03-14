function macdBuy(candle) {
	const { macd_line, macd_signal, macd_histogram } = candle
	// return open < bollinger_lower && psar < low
	return macd_line < 0 && macd_signal < 0 && macd_histogram > 0
}

function macdSell(candle) {
	const { macd_line, macd_signal, macd_histogram } = candle
	return macd_line > 0 && macd_signal > 0 && macd_histogram < 0
}

export { macdBuy, macdSell }
