const Model = require('../Model.js');
const InventoryTransaction = require('./InventoryTransaction.js');

class InventoryItem extends Model {
    constructor(values) {
        super(values);

        this.table = 'inventory_items';
        this.primaryKey = 'id';
    }

    static deleteByClassId(classid) {
        return new this().delete(classid, 'classid');
    }

    static async addItems(items, botname, inout) {
        for(let i = 0; i < items.length; i++) {
            let current = items[0];

            let item = await InventoryItem.find(current.classid, 'classid');

            if (!item) {
                item = new InventoryItem({
                    classid: current.classid,
                    image_url: current.icon_url,
                    image_url_large: current.icon_url_large
                });

                await item.save();
            }

            if (item.values.hasOwnProperty('id')) {
                let newT = new InventoryTransaction({
                    botname: botname,
                    assetid: current.id,
                    inventory_item_id: item.values.id,
                    count: current.amount,
                    in_out: inout
                });

                await newT.save();
            }
        }
    }
}

module.exports = InventoryItem;