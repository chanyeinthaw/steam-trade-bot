const User = require('../database/user.js');
const decrypt = require('../decrypt.js');

module.exports = async (classnn, data, uid) => {
	const gs = global.app.gs;

	const user = new User({id: uid});

	let password = '';

	try {
	    password = await user.gameSparksPassword;
    } catch (e) { }

	const credentials = {
		userName: `user${uid}`,
		password: password
	};

	return gs.executeCloudFunction(
		(await gs.authenticateUser(credentials.userName, credentials.password)).userId,
		classnn,
		data);
};