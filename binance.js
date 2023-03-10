import * as dotenv from "dotenv"
dotenv.config()
import ccxt from "ccxt"

const key = process.env.APIKEY
const amount = process.env.AMOUNT

const binance = new ccxt.binance({
	apiKey: process.env.BINANCE_API_KEY,
	secret: process.env.BINANCE_API_SECRET,
})

const getBalance = async () => {
	const balances = await binance.fetchBalance().catch(err => console.log(err))
	return balances.free
}

const marketBuy = async symbol => {
	const trade = await binance
		.createMarketBuyOrder(symbol, 0, {
			quoteOrderQty: amount,
		})
		.catch(err => console.log(err))

	return trade
}

const marketSell = async (symbol, balance) => {
	const trade = await binance
		.createMarketSellOrder(symbol, balance)
		.catch(err => console.log(err))
	return trade
}

export { getBalance, marketBuy, marketSell }
