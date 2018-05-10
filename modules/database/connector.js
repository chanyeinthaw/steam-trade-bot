const mysql = require('promise-mysql');

module.exports = async () => {
	try {
		return await mysql.createConnection(global.mysqlConfig);
	} catch (e) {
		console.log(e);
	}

	return null;
};