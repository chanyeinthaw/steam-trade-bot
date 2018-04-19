const Long = require('long');
module.exports = (partnerid) => {
	return new Long(parseInt(partnerid, 10), 0x1100001).toString();
};