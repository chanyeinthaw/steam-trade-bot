const jq = require('json-query');

const QUERYS = {
	check: 'select classid, appid from allowed_items where classid in (?) and appid = ?',
	getprice: 'select classid, price, appid from allowed_items where classid in (?) and appid = ?'
};

function getClassIdArray(items) {
	let assetIdArray = [];

	for(let i = 0; i < items.length; i++) {
		assetIdArray.push(items[i].classid);
	}

	return assetIdArray;
}

module.exports = (conn) => {
	return {
		conn,
		
		async checkItems(items, appid) {
			try {
				let allowedAssets =  await this.conn.query(QUERYS.check, [getClassIdArray(items), appid]);

				let allowItems = [];

				for(let i = 0; i < items.length; i++) {
					let classId = items[i].classid;
					let shouldAdd = false;

					for(let j = 0; j < allowedAssets.length; j++) {
						if (classId == allowedAssets[j].classid && allowedAssets[j].appid == appid) {
							shouldAdd = true; break;
						}
					}

					if (shouldAdd) allowItems.push(items[i]);

					return allowItems;
				}
			} catch (e) { console.log(e); return []; }
		},

		async getTotalCoins(items, appid) {
			try {
				let assetsWithPrice = await this.conn.query(QUERYS.getprice, [getClassIdArray(items), appid]);

				let totalCoins = 0;

				for(let i = 0; i < assetsWithPrice.length; i++) {
					if (assetsWithPrice[i].appid !== appid) continue;

					let classid = assetsWithPrice[i].classid;
					let sr = jq(`items[classid=${classid}].amount`, {data: {items: items}});

					sr = sr.value;

					totalCoins += assetsWithPrice[i].price * sr;
				}

				return totalCoins;
			} catch (e) { console.log(e); return 0}
		}
	}
};