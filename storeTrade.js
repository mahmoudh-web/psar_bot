import { connect, disconnect, database } from "./func/db.js"

const storeTrade = async trade => {
	const { client, db } = database()
	const tradesCollection = db.collection("trades")

	await tradesCollection.insertOne(trade)
}

export { storeTrade }
