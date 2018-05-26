const Model = require('./model.js');

class InventoryTransaction extends Model {
    constructor(attributes) {
        super(attributes, 'inventory_transactions');
    }

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
}

module.exports = InventoryTransaction;