const User = require('../database/Users');

module.exports = async (classnn, data, uid) => {
	const gs = global.app.gs;

	const user = await User.find(uid);
    let password = '';
	if (user) password = user.gameSparksPassword;

	const credentials = {
		userName: `user${uid}`,
		password: password
	};

	return gs.executeCloudFunction(
		(await gs.authenticateUser(credentials.userName, credentials.password)).userId,
		classnn,
		data);
};