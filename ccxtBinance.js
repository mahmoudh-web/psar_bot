import * as dotenv from "dotenv"
dotenv.config()
import ccxt from "ccxt"

const binanceClient = new ccxt.binance({
	apiKey: process.env.BINANCE_API_KEY,
	secret: process.env.BINANCE_API_SECRET,
})

const getTokenBalance = async token => {
	const all = await binanceClient.fetchBalance()
	return all[token].free
}

export { getTokenBalance }
