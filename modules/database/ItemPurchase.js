const Model = require('../Model');
const InventoryTransaction = require('./InventoryTransaction');

class ItemPurchase extends Model {
    constructor(values) {
        super(values);

        this.table = 'item_purchases';
        this.primaryKey = 'id';
    }

    get tradeInfo() {
        return new Promise((resolve, reject) => {
            InventoryTransaction.find(this.values.inventory_transaction_id)
                .then(async (data) => {
                    let item = await data.item;

                    if (item) {
                        resolve({
                            botname: data.values.botname,
                            assetid: data.values.assetid,
                            appid: parseInt(item.values.appid),
                            amount: 1
                        });
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }
}

module.exports = ItemPurchase;