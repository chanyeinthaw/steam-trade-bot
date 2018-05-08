const QUERYS = {
	check: 'select assetid from allowed_items where assetid in (?)',
	getprice: 'select assetid, price from allowed_items where assetid in (?)'
};

class AllowedItemsDao {
	constructor(conn) {
		this.conn = conn;
	}

	checkItems(items) {
		return this.conn.query(QUERYS.check, [AllowedItemsDao.getAssetIdArray(items)]);
	}

	static getAssetIdArray(items) {
		let assetIdArray = [];

		for(let i = 0; i < items.length; i++) {
			assetIdArray.push(items[i].assetid);
		}

		return assetIdArray;
	}

	getPrice(items) {
		return this.conn.query(QUERYS.getprice, [AllowedItemsDao.getAssetIdArray(items)]);
	}
}

module.exports = AllowedItemsDao;