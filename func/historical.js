import axios from "axios"

const historical = async (instrument, interval, limit) => {
	const url = `https://api.binance.com/api/v3/klines?symbol=${instrument}&interval=${interval}&limit=${
		limit * 2
	}`

	const candles = await axios({
		method: "get",
		url,
	}).then(res => res.data)

	return candles
}

export { historical }
