const QUERYS = {
	check: 'select assetid from allowed_items where assetid in (?)',
	getprice: 'select assetid, price from allowed_items where assetid in (?)'
};

class AllowedItem {
	constructor(conn) {
		this.conn = conn;
	}

	async checkItems(items) {
		try {
			let allowedAssets =  await this.conn.query(QUERYS.check, [AllowedItem.getAssetIdArray(items)]);
			let allowItems = [];

			for(let i = 0; i < items.length; i++) {
				let assetId = items[i].assetid;
				let shouldAdd = false;

				for(let j = 0; j < allowedAssets.length; j++) {
					if (assetId == allowedAssets[j].assetid) {
						shouldAdd = true; break;
					}
				}

				if (shouldAdd) allowItems.push(items[i]);

				return allowItems;
			}
		} catch (e) { console.log(e); return []; }
	}

	static getAssetIdArray(items) {
		let assetIdArray = [];

		for(let i = 0; i < items.length; i++) {
			assetIdArray.push(items[i].assetid);
		}

		return assetIdArray;
	}

	async getTotalCoins(items) {
		try {
			let assetsWithPrice = this.conn.query(QUERYS.getprice, [AllowedItem.getAssetIdArray(items)]);
			let totalCoins = 0;

			for(let i = 0; i < assetsWithPrice.length; i++) {
				totalCoins += assetsWithPrice[i].price;
			}

			return totalCoins;
		} catch (e) { console.log(e); return 0}
	}
}

module.exports = AllowedItem;