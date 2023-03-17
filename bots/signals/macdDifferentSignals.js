function macdDifferentBuy(candle) {
	const { macd_line_in, macd_signal_in, macd_histogram_in } = candle
	console.log(macd_line_in, macd_signal_in, macd_histogram_in)
	console.log(
		`line: ${macd_line_in < 0}, signal: ${macd_signal_in < 0}, histo: ${
			macd_histogram_in > 0
		}`
	)
	// return open < bollinger_lower && psar < low
	return macd_line_in < 0 && macd_signal_in < 0 && macd_histogram_in > 0
}

function macdDifferentSell(candle) {
	const { macd_line_out, macd_signal_out, macd_histogram_out } = candle
	console.log(macd_line_out, macd_signal_out, macd_histogram_out)
	return macd_line_out > 0 && macd_signal_out > 0 && macd_histogram_out < 0
}

export { macdDifferentBuy, macdDifferentSell }
