const callCC = require('../call-cloud-code.js');
module.exports = async (req, res) => {
	try {
		res.send(await callCC('.AccountDetailsRequest', {}, req.loggedUserId));
	} catch(e) {
		res.send({error: e.message});
	}
};