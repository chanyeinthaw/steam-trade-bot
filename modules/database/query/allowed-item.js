const execute = require('../execute.js');
const jq = require('json-query');

const QUERYS = {
	check: 'select classid from allowed_items where classid in (?)',
	getprice: 'select classid, price from allowed_items where classid in (?)'
};

function getClassIdArray(items) {
	let assetIdArray = [];

	for(let i = 0; i < items.length; i++) {
		assetIdArray.push(items[i].classid);
	}

	return assetIdArray;
}

module.exports = {
	async checkItems(items) {
		try {
			let allowedAssets =  await execute(QUERYS.check, [getClassIdArray(items)]);

			let allowItems = [];

			for(let i = 0; i < items.length; i++) {
				let classId = items[i].classid;
				let shouldAdd = false;

				for(let j = 0; j < allowedAssets.length; j++) {
					if (classId == allowedAssets[j].classid) {
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
			let assetsWithPrice = await execute(QUERYS.getprice, [getClassIdArray(items)]);

			let totalCoins = 0;

			for(let i = 0; i < assetsWithPrice.length; i++) {
				let classid = assetsWithPrice[i].classid;
				let sr = jq(`items[classid=${classid}].amount`, {data: {items: items}});

				sr = sr.value;

				totalCoins += assetsWithPrice[i].price * sr;
			}

			return totalCoins;
		} catch (e) { console.log(e); return 0}
	}
};