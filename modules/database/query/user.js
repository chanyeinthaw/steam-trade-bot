const decrypt = require('../../decrypt.js');
const QUERYS = {
	getpw: 'SELECT gamesparks_password as password FROM users WHERE id = ?'
};

module.exports = (conn) => {
	return {
		conn,
		async getGamesparksPassword(userId) {
			try {
				let rows = await this.conn.query(QUERYS.getpw, [userId]);

				if (rows.length > 0) {
					let pwencrypted = rows[0].password;
					return decrypt(pwencrypted);
				}
				return '';
			} catch (e) {
				console.log(e);
			}

			return '';
		}
	};
};