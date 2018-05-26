const Model = require('./model.js');

class InventoryTransaction extends Model {
    constructor(attributes) {
        super(attributes, 'inventory_transactions');
    }
}

module.exports = InventoryTransaction;