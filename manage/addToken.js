import * as dotenv from "dotenv"
dotenv.config()

import supabase from "../func/supabase.js"

const token = {
	symbol: "VGXUSDT",
	token: "VGX",
	interval: "3m",
	settings: {
		macd: {
			short: 2,
			long: 7,
			signal: 9,
		},
		psar: {},
		bollinger: {},
	},
	type: "macd",
}

const { data, error } = await supabase.from("tokens").insert(token)
