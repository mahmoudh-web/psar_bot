import * as dotenv from "dotenv"
dotenv.config()

import { database, connect, disconnect } from "../func/db.js"
const { client, db } = database()

const data = {
	symbol: "ASTRUSDT",
	token: "ASTR",
	interval: "1m",
	bollinger_period: 2,
	bollinger_deviation: 0.5,
	psar_increment: 0.1,
	psar_max: 0.5,
}
await connect(client)
const tokensCollection = db.collection("bot_tokens")
await tokensCollection
	.insertOne(data)
	.then(res => console.log(res))
	.catch(err => console.log(err))
// console.log(`Created bot settings for ${data.symbol}`)
await disconnect(client)
