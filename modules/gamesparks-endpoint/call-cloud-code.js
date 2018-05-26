const User = require('../database/user.js');

module.exports = async (classnn, data, uid) => {
	const gs = global.app.gs;

	const conn = await db.connection();
	const user = new User({id: uid});

	const credentials = {
		userName: `user${uid}`,
		password: await user.gameSparksPassword
	};

	conn.end();

	return gs.executeCloudFunction(
		(await gs.authenticateUser(credentials.userName, credentials.password)).userId,
		classnn,
		data);
};