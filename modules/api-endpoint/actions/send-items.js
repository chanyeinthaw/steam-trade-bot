const validate = require('../validate');
const toSteamid = require('../../to-steamid');
const ItemPurchase = require('../../database/ItemPurchase');

module.exports = async (req, res) => {
	let query = req.query;

	let requires = [
		'partner', 'token', 'purchaseId', 'appKey', 'game'
	];

	// items - item format {'appid', assetid: '', amount: ''}

	let errors = validate(requires, query);

	if (errors) {
		return res.send(errors);
	}

	if (query.appKey !== global.app.env.appKey) {
		return res.send({
			error: 'Invalid APP key.'
		});
	}

	try {
        let purchaseInfo = await ItemPurchase.find(query.purchaseId);

        if (!purchaseInfo) return res.send({error: 'invalid purchaseId'});
        if (purchaseInfo.values.is_paid === 0) return res.send({error: 'Purchase is not complete'});

        let tradeInfo = [await purchaseInfo.tradeInfo];

        const bots = global.app.bots;
        const game = global.app.games[query.game];
        const bot = bots.getBotByName(tradeInfo[0].botname);

        let offer = await bot.sendTradeOffer(toSteamid(query.partner), query.token, [], tradeInfo, `purchaseId: ${query.purchaseId}`, game);

        if (!offer) return res.send({error: 'failed'});

        if (offer.hasOwnProperty('needs_mobile_confirmation') && offer.needs_mobile_confirmation === true) {
            let err = await bot.acceptOfferById(offer.tradeofferid);

            if (err == null)
                return res.send({message: 'Trade Offer sent', purchaseId: query.purchaseId, offerId: offer.tradeofferid})
        }

        res.send({error: 'failed to accept', purchaseId: query.purchaseId});
    } catch (e) {
        return res.send({error: e.message});
    }
};