const Model = require('./model.js');
const InventoryTransaction = require('./inventory-transaction.js');

class InventoryItem extends Model {
    constructor(attributes) {
        super(attributes, 'inventory_items');
    }

    delete(classid) {
        return this.query()
            .where('classid', classid)
            .del();
    }

    static async addItems(items, botname, inout) {
        for(let i = 0; i < items.length; i++) {
            let current = items[0];

            let item = (
                await new InventoryItem({
                    classid: current.claim(),
                    image_url: current.icon_url,
                    image_url_large: current.icon_url_large
                }).saveOrGet('classid')
            )[0];

            if (item && item.hasOwnProperty('id')) {
                await new InventoryTransaction({
                    botname: botname,
                    assetid: current.id,
                    inventory_item_id: item.id,
                    count: current.amount,
                    inout: inout
                }).save();
            }
        }
    }
}

module.exports = InventoryItem;