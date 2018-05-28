const Model = require('../Model.js');
const jq = require('json-query');

function getClassIdArray(items) {
    let result = [];

    for(let i = 0; i < items.length; i++) {
        result.push(items[i].classid);
    }

    return result;
}

class AllowedItem extends Model {
    constructor(values) {
        super(values);

        this.table = 'allowed_items';
        this.primaryKey = 'id';
    }

    static async checkItems(items, appid) {
        try {
            let allowedAssets = await this
                .query()
                .where('appid', appid)
                .whereIn('classid', getClassIdArray(items));

            let allowedItems = [];

            for(let i = 0; i < items.length; i++) {
                let classId = items[i].classid;
                let shouldAdd = false;

                for(let j = 0; j < allowedAssets.length; j++) {
                    if (classId == allowedAssets[j].classid && allowedAssets[j].appid == appid) {
                        shouldAdd = true; break;
                    }
                }

                if (shouldAdd) allowedItems.push(items[i]);

                return allowedItems;
            }
        } catch (e) { console.log(e);
            return [];
        }
    }

    static async getTotalCoins(items, appid) {
        try {
            let assetsWithPrice = await this
                .query()
                .where('appid', appid)
                .whereIn('classid', getClassIdArray(items));

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

module.exports = AllowedItem;