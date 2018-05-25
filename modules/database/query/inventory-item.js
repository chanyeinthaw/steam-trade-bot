const execute = require('../execute.js');

const QUERYS = {
	retrieve: 'select * from inventory_items where classid = ?',
	insert: 'insert into inventory_items set ?',
	exists: 'select count(*) as count from inventory_items where classid = ?',
	delete: 'delete from inventory_items where classid = ?',

	insert_transaction: 'insert into inventory_transactions set ?',
};

module.exports = (conn) => {
	return {
		conn,
		async addItem(classid, img_url, img_url_large, appid) {
			let object = {classid: classid, image_url: img_url, image_url_large: img_url_large, appid: appid};
			try {
				let exists = await this.exists(classid);
				if (exists === 0) {
					let res = await this.conn.query(QUERYS.insert, object);

					object.id = res.insertId;

					return object;
				} else if (exists > 0) {
					let res = await this.conn.query(QUERYS.retrieve, [classid]);

					return res[0];
				}
			} catch (e) {
				console.log(e);
			}

			return object;
		},
		async addItems(items, botname, inout) {
			for(let i = 0; i < items.length; i++ ) {
				let current = items[0];
				let  item= await this.addItem(current.classid, current.icon_url, current.icon_url_large);

				if (item.hasOwnProperty('id')) {
					await this.addTranaction(botname, item.id, current.id ,current.amount, inout);
				}
			}
		},
		async addTranaction(botname, inventory_item_id, assetid,count, inout) {
			try {
				let res = await this.conn.query(QUERYS.insert_transaction, {
					botname: botname,
					assetid: assetid,
					inventory_item_id: inventory_item_id,
					count: count,
					in_out: inout
				});

				return res.insertId;
			} catch (e) {
				console.log(e);
			}

			return -1;
		},
		async delete(classid) {
			try {
				let res = await this.conn.query(QUERYS.delete, [classid]);
				return res.affectedRows;
			} catch (e) {
				console.log(e);
			}

			return 0;
		},
		async exists(classid) {
			try {
				let res = await this.conn.query(QUERYS.exists, [classid]);

				return res[0].count; // 0 no, > 0 yes;
			} catch (e) {
				console.log(e);
			}

			return -1;
		},
	};
};