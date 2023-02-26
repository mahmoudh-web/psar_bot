import * as dotenv from "dotenv"
dotenv.config()
import ccxt from "ccxt"

const binanceClient = new ccxt.binance({
	apiKey: process.env.BINANCE_API_KEY,
	secret: process.env.BINANCE_API_SECRET,
})

const buyToken = async symbol => {
	const amount = Number(process.env.AMOUNT)
	console.log(amount)
	const buyBTC = await binanceClient.createOrder(
		symbol,
		"market",
		"buy",
		0,
		null,
		{ quoteOrderQty: amount }
	)
	console.log(JSON.stringify(buyBTC, null, 2))
}

const sellToken = async symbol => {
	// const token = symbol.replace("USDT", "")
	const allBalance = await binanceClient.fetchBalance()
	const tokenBalance = allBalance[symbol].free
	console.log(tokenBalance)

	const sellToken = await binanceClient.createMarketSellOrder(
		`${symbol}USDT`,
		tokenBalance
	)
	console.log(sellToken)
}

await sellToken("FET")
// await buyToken("FETUSDT")
