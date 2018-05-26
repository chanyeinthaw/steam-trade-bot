const Model = require('../model.js');

class PendingTrade extends Model {
    constructor(attributes) {
        super(attributes, 'pending_trades');
    }

    asyncCheckTradeOffer(offerId) {
        return this.conn
            .query()
            .select('offerid', 'botname', 'items', 'in_out')
            .where('offerid', offerId)
    }
}