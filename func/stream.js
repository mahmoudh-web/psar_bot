const connectionString = data => {
	let string = ""
	for (let i = 0; i < data.length; i++) {
		string += `${data[i].symbol.toLowerCase()}@kline_${data[i].interval}`
		if (i < data.length - 1) string += "/"
	}

	return string
}

export { connectionString }
