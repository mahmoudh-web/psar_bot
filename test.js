const array = [1, 2, 3, 4, 5, 6, 7, 8]

do {
	const first = array.shift()

	console.log(first)
	console.log(array)
} while (array.length)
