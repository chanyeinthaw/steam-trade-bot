const connector = require('./connector.js');

module.exports = async (query, data) => {
	let c = await connector();
	let r = await c.query(query, data);

	c.end();

	return r;
};