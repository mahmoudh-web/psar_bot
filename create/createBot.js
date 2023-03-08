import * as dotenv from "dotenv"
dotenv.config()

import { database, connect, disconnect } from "../func/db.js"

import fs from "fs"
import csv from "fast-csv"

import tokens from "./detailed_test.js"

const { client, db } = database()

// const getTokens = async () => {
// 	return new Promise((resolve, reject) => {
// 		const tokens = []
// 		fs.createReadStream("./create/newCoins.csv")
// 			.pipe(csv.parse({ headers: true }))
// 			.on("error", error => reject(error))
// 			.on("data", row => {
// 				const settings = {
// 					symbol: row.symbol,
// 					token: row.symbol.replace("USDT", ""),
// 					interval: row.interval,
// 					bollinger_deviation: Number(row.bollinger_deviation),
// 					bollinger_period: Number(row.bollinger_period),
// 					psar_increment: Number(row.psar_increment),
// 					psar_max: Number(row.psar_max),
// 				}
// 				tokens.push(settings)
// 			})
// 			.on("end", () => {
// 				resolve(tokens)
// 			})
// 	})
// }

// console.log(tokens)
const data = tokens.map(token => {
	return {
		symbol: token.symbol,
		interval: token.interval,
		settings: token.settings,
	}
})
console.log(data)

if (data.length) {
	await connect(client)
	const tokensCollection = db.collection("bot_tokens")
	for await (let token of data) {
		await tokensCollection
			.insertOne(token)
			.then(res => console.log(res))
			.catch(err => console.log(err))
		console.log(`Created bot settings for ${token.symbol}`)
	}
	await disconnect(client)
}
