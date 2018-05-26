const Model = require('./model.js');

class PendingTrade extends Model {
    constructor(attributes) {
        super(attributes, 'pending_trades');
    }

    check(offerId) {
        return this.query()
            .select('offerid', 'botname', 'items', 'in_out')
            .where('offerid', offerId);
    }

    delete(offerId) {
        return this.query()
            .where('offerid', offerId)
            .del();
    }
}

module.exports = PendingTrade;