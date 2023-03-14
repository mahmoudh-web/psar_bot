const connectionString = data => {
	let socketQuery = "wss://stream.binance.com:9443/stream?streams="
	for (let i = 0; i < data.length; i++) {
		socketQuery += `${data[i].symbol.toLowerCase()}@kline_${
			data[i].interval
		}`
		if (i < data.length - 1) socketQuery += "/"
	}

	let tokensList = ""
	for (let i = 0; i < data.length; i++) {
		tokensList += data[i].symbol
		if (i < data.length - 1) tokensList += ", "
	}

	console.log(`Retreieved settings for: ${tokensList}`)
	return { socketQuery, tokensList }
}

export { connectionString }
