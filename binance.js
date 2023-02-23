import * as dotenv from "dotenv"
dotenv.config()
import Binance from "node-binance-api"

const binance = new Binance().options({
	APIKEY: process.env.BINANCE_API_KEY,
	APISECRET: process.env.BINANCE_API_SECRET,
})

const getBalance = async symbol => {
	return new Promise((resolve, reject) => {
		binance.balance((error, balances) => {
			if (error) reject(err => console.log(err))
			console.info("balances()", balances)
			resolve(balances)
		})
	})
}

binance.balance((error, balances) => {
	if (error) return console.error(error.body)
	// console.info("balances()", balances)
	console.info("ETH balance: ", balances.ETH.available)
})

export { getBalance }
