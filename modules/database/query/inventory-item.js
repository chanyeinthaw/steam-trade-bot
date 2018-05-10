const execute = require('../execute.js');

const QUERYS = {
	retrieve: 'select * from inventory_items where classid = ?',
	insert: 'insert into inventory_items set ?',
	exists: 'select count(*) as count from inventory_items where classid = ?',
	delete: 'delete from inventory_items where classid = ?',

	insert_transaction: 'insert into inventory_transactions (botname,inventory_item_id,count,in_out) values ',
};

module.exports = {
	async addItems(items) {
		let object = {classid: classid, image_url: image_url, image_url_large: image_url_large};
		try {
			let exists = await this.exists(classid);
			if (exists === 0) {
				let res = await execute(QUERYS.insert, object);

				object.id = res.insertId;

				return object;
			} else if (exists > 0) {
				let res = await execute(QUERYS.retrieve, [classid]);

				return res[0];
			}
		} catch (e) {
			console.log(e);
		}

		return object;
	},

	async delete(classid) {
		try {
			let res = await execute(QUERYS.delete, [classid]);
			return res.affectedRows;
		} catch (e) {
			console.log(e);
		}

		return 0;
	},

	async exists(classid) {
		try {
			let res = await execute(QUERYS.exists, [classid]);

			return res[0].count; // 0 no, > 0 yes;
		} catch (e) {
			console.log(e);
		}

		return -1;
	},

	async addTranaction(trans) {
		let q = QUERYS.insert_transaction;

		for(let i = 0; i < trans.length; i++) {
			q += '(?),';
		}

		q = q.substr(0, q.length - 1);

		try {
			let res = await execute(q, trans);

			return res.affectedRows;
		} catch (e) {
			console.log(e);
		}

		return 0;
	},
};