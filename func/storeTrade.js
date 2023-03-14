import supabase from "./supabase.js"

const storeTrade = async trade => {
	const { data, error } = await supabase
		.from("trades")
		.insert([{ data: trade }])
}

export { storeTrade }
