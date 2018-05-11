module.exports = async (classnn, data, uid) => {
	const gs = global.app.gs;
	const db = global.app.db;

	const conn = await db.connection();
	const userq = db.user(conn);

	const credentials = {
		userName: `user${uid}`,
		password: await userq.getGamesparksPassword(uid)
	};

	conn.end();

	return gs.executeCloudFunction(
		(await gs.authenticateUser(credentials.userName, credentials.password)).userId,
		classnn,
		data);
};