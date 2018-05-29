const Model = require('../Model.js');

class InventoryTransaction extends Model {
    constructor(values) {
        super(values);

        this.table = 'inventory_transactions';
        this.primaryKey = 'id';
    }

    get item() {
        return require('./InventoryItem').find(this.values.inventory_item_id);
    }
}

module.exports = InventoryTransaction;