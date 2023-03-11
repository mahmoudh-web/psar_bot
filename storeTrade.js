import supabase from "./func/supabase.js"

const storeTrade = async trade => {
	const { data, error } = await supabase
		.from("trades")
		.insert([{ data: trade }])
}

export { storeTrade }
