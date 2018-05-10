const connector = require('../connector.js');

const QUERYS = {
	check: 'select assetid from allowed_items where assetid in (?)',
	getprice: 'select assetid, price from allowed_items where assetid in (?)'
};

function getAssetIdArray(items) {
	let assetIdArray = [];

	for(let i = 0; i < items.length; i++) {
		assetIdArray.push(items[i].assetid);
	}

	return assetIdArray;
}

module.exports = {
	async checkItems(items) {
		try {
			let conn = await connector();

			let allowedAssets =  await conn.query(QUERYS.check, [getAssetIdArray(items)]);

			conn.end();

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
	},

	async getTotalCoins(items) {
		try {
			let conn = await connector();

			let assetsWithPrice = conn.query(QUERYS.getprice, [AllowedItem.getAssetIdArray(items)]);

			conn.end();

			let totalCoins = 0;

			for(let i = 0; i < assetsWithPrice.length; i++) {
				totalCoins += assetsWithPrice[i].price;
			}

			return totalCoins;
		} catch (e) { console.log(e); return 0}
	}
};