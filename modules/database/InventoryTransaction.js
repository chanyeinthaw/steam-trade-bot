const Model = require('../Model.js');

class InventoryTransaction extends Model {
    constructor(attributes) {
        super(attributes);

        this.table = 'inventory_transactions';
        this.primaryKey = 'id';
    }
}

module.exports = InventoryTransaction;