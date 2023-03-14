import supabase from "../func/supabase.js"
import { round } from "lodash-es"
import axios from "axios"
import * as indicators from "../indicators.js"
import { addIndicatorData } from "../candles.js"

const getSignals = async () => {
	const { data, error } = await supabase.from("signals").select()
	if (error) console.log(error)
	return data
}

const signals = await getSignals()

signals.forEach(signal => {
	const data = {
		...signal,

		macdLine: signal.macd_line < 0,
		macdSignal: signal.macd_signal < 0,
		macdHistogram: signal.macd_histogram > 0,
	}
	console.log(data)
})
