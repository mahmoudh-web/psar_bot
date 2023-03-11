import { DateTime } from "luxon"
import axios from "axios"

const candles = await axios({
	method: "get",
	url: "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=21",
}).then(res => res.data)
const date = DateTime.fromMillis(1678548060000).toISO()

candles.forEach(candle => console.log(DateTime.fromMillis(candle[0]).toISO()))
