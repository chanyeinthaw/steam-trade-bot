const execute = require('../execute.js');

const QUERYS = {
	insert: 'insert into inventory_items set ?',
	delete: 'delete from inventory_items where assetid = ?'
};


module.exports = {
	async addEntry(assetid, image_url, image_url_large) {
		try {
			let res = await execute(QUERYS.insert, {assetid: assetid, image_url: image_url, image_url_large: image_url_large});

			return res.insertId;
		} catch (e) {
			console.log(e);
		}

		return -1;
	},

	async deleteEntry(assetid) {
		try {
			let res = await execute(QUERYS.delete, [assetid]);
			return res.affectedRows;
		} catch (e) {
			console.log(e);
		}

		return 0;
	}
};