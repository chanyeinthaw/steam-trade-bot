

module.exports = async (classnn, data, uid) => {
	const gs = global.app.gs;

	const conn = await db.connection();
	const user = new global.models.User({id: uid});

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