import supabase from "./supabase.js"

const storeTrade = async (trade, candle) => {
	const info = {
		trade,
		candle,
		cost: trade.cost,
	}
	const { data, error } = await supabase
		.from("trades")
		.insert([{ data: info }])
}

export { storeTrade }
