import * as dotenv from "dotenv"
dotenv.config()
import crypto from "crypto"
import axios from "axios"
import { DateTime } from "luxon"
// const url = `${process.env.PROXY_SERVER}balance`
const key = process.env.APIKEY
const timeStamp = `timestamp=${DateTime.now().toMillis()}`

function createSignature(query_string) {
	return crypto
		.createHmac("sha256", process.env.BINANCE_API_SECRET)
		.update(query_string)
		.digest("hex")
}

const signature = createSignature(timeStamp)
const url = `https://api.binance.com/api/v3/order?signature=${signature}&${timeStamp}`

await axios({
	method: "post",
	url,
	headers: {
		"X-MBX-APIKEY": process.env.BINANCE_API_KEY,
		// "signature": process.env.BINANCE_API_SECRET,
		// signature,
		"Content-Type": "application/x-www-form-urlencoded",
	},
	data: {
		"symbol": "BTCUSDT",
		"side": "buy",
		"type": "MARKET",
		"quoteOrderQty": 15,
	},
})
