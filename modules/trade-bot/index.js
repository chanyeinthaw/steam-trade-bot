const SteamUser = require('steam-user');
const getSteamAPIKey = require('steam-web-api-key');
const SteamTradeOffers = require('steam-tradeoffers');
const Registry = require('./registry');
const Logger = require('../logger');

class TradeBot {
	constructor(accountName, password, twoFactorCode, registry) {
		this.logOnOptions = {
			accountName: accountName,
			password: password,
			twoFactorCode: twoFactorCode
		};

		this.registry = registry;
		this.client = new SteamUser();
		this.offers = new SteamTradeOffers();
		this.tradeOfferOptions = null;
		this.tradeOfferCallback = null;
		this.isBusy = false;

		this.client.on('loggedOn', this.onClientLoggedOn.bind(this));
		this.client.on('disconnected', this.onClientDissconnected.bind(this));
		this.client.on('error', (error) => {
			Logger.log(Logger.Error, 'LogOnException', error);
		});
	}

	initOperation(cb) {
		this.client.logOn(this.logOnOptions);

		if (typeof cb === 'function') {
			return cb();
		}
	}

	isBotIdle() {
		return !this.isBusy;
	}

	makeBotBusy() {
		this.isBusy = true;
	}

	releaseBot() {
		this.isBusy = false;
	}

	getBotName() {
		return this.logOnOptions.accountName;
	}

	sendTradeOffer(partnerSteamId, accessToken, items, message, callback) {
		this.tradeOfferCallback = callback;
		this.tradeOfferOptions = {
			steamId: partnerSteamId,
			items: items,
			message: message,
			accessToken: accessToken
		};

		if (this.client.steamID === null) {
			return this.initOperation(this.doSendTradeOffer.bind(this));
		}

		return this.doSendTradeOffer();
	}

	doSendTradeOffer() {
		if (this.tradeOfferOptions !== null) {
			let offerOptions = {
				message: this.tradeOfferOptions.message,
				partnerSteamId: this.tradeOfferOptions.steamId,
				accessToken: this.tradeOfferOptions.accessToken,
				itemsFromThem: this.tradeOfferOptions.items,
				itemsFromMe: []
			};

			this.isBusy = true;

			this.offers.makeOffer(offerOptions, this.onMakeOfferResponse.bind(this));
		}
	}

	onMakeOfferResponse(err, body) {
		this.isBusy = false;

		if (err) {
			console.log(`TradeBot ${this.logOnOptions.accountName} error: ${err.message}`);

			return this.tradeOfferCallback(err, null);
		}

		console.log(`TradeBot ${this.logOnOptions.accountName} success: offer id is ${body.tradeofferid}`);
		this.tradeOfferCallback(null, body);
	}

	onClientLoggedOn() {
		console.log(`TradeBot ${this.logOnOptions.accountName} logged on.`);

		this.client.setPersona(SteamUser.Steam.EPersonaState.Online);

		this.client.on('webSession', this.onClientWebSession.bind(this));
	}

	onClientDissconnected(eresult, msg) {
		console.log(`TradeBot ${this.logOnOptions.accountName} disconnected.`);

		this.registry.unRegisterBot(this);

		console.log(`TradeBot ${this.logOnOptions.accountName} removed from registry.`);
	}

	onClientWebSession(sessionID, webCookie) {
		console.log(`TradeBot ${this.logOnOptions.accountName} web session started.`);

		this.webSession = {
			sessionID: sessionID,
			webCookie: webCookie,
		};

		console.log(`TradeBot ${this.logOnOptions.accountName} requesting api key.`);
		getSteamAPIKey(this.webSession, this.onGetSteamAPIKey.bind(this));
	}

	onGetSteamAPIKey(err, APIKey) {
		this.webSession.APIKey = APIKey;

		console.log(`TradeBot ${this.logOnOptions.accountName} api key acquired.`);
		console.log(`TradeBot ${this.logOnOptions.accountName} storing webSessionInfo.`);
		console.log(`TradeBot ${this.logOnOptions.accountName} setting up trade offer option.`);

		this.offers.setup(this.webSession);

		console.log(`TradeBot ${this.logOnOptions.accountName} ready to trade.`);

		this.registry.registerBot(this);

		console.log(`TradeBot ${this.logOnOptions.accountName} added to registry.`);
	}
}

module.exports = {
	Bot: TradeBot,
	Registry: Registry
};