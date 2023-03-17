function macdDifferentBuy(candle) {
	const { macd_line_in, macd_signal_in, macd_histogram_in } = candle
	return macd_line_in < 0 && macd_signal_in < 0 && macd_histogram_in > 0
}

function macdDifferentSell(candle) {
	const { macd_line_out, macd_signal_out, macd_histogram_out } = candle
	return macd_line_out > 0 && macd_signal_out > 0 && macd_histogram_out < 0
}

export { macdDifferentBuy, macdDifferentSell }
