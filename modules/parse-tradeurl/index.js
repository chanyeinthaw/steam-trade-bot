const Long = require('long');

module.exports = (tradeUrl) => {
	let queryStr = tradeUrl.split('?')[1],
		queryArr = queryStr.split('&'),
		queryParams = {};

	for (let q = 0, qArrLength = queryArr.length; q < qArrLength; q++) {
		let qArr = queryArr[q].split('=');
		queryParams[qArr[0]] = qArr[1];
	}

	queryParams.steamid = new Long(parseInt(queryParams.partner, 10), 0x1100001).toString();

	return queryParams;
};