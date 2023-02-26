import * as dotenv from "dotenv"
dotenv.config()
import Binance from "node-binance-api"
import ccxt from "ccxt"

// const binance = new Binance().options({
// 	APIKEY: process.env.BINANCE_API_KEY,
// 	APISECRET: process.env.BINANCE_API_SECRET,
// })
const amount = process.env.AMOUNT

const binance = new ccxt.binance({
	apiKey: process.env.BINANCE_API_KEY,
	secret: process.env.BINANCE_API_SECRET,
})

const getBalance = async () => {
	return await binance.fetchBalance()
}

const marketBuy = async symbol => {
	const trade = await binance.createMarketBuyOrder(symbol, 0, {
		quoteOrderQty: amount,
	})
	return trade
}

const marketSell = async (symbol, balance) => {
	const trade = await binance.createMarketSellOrder(symbol, balance)
	return trade
}

// binance.balance((error, balances) => {
// 	if (error) return console.error(error.body)
// 	// console.info("balances()", balances)
// 	console.info(balances)
// })

export { getBalance, marketBuy, marketSell }
