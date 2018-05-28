const Model = require('../Model.js');

class PendingTrade extends Model {
    constructor(value) {
        super(value);

        this.table = 'pending_trades';
        this.primaryKey = 'id';
    }

    static findByOfferId(offerId) {
        return this.find(offerId, 'offerid');
    }

    static deleteByOfferId(offerId) {
        return new this().delete(offerId, 'offerid');
    }
}

module.exports = PendingTrade;