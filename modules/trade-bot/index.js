const SteamUser = require('steam-user');
const getSteamAPIKey = require('steam-web-api-key');
const SteamTradeOffers = require('steam-tradeoffers');

class TradeBot {
	constructor(accountName, password, twoFactorCode) {
		this.logOnOptions = {
			accountName: accountName,
			password: password,
			twoFactorCode: twoFactorCode
		};

		this.client = new SteamUser();
		this.offers = new SteamTradeOffers();
		this.tradeOfferOptions = null;
		this.isBusy = false;

		this.client.on('loggedOn', this.onClientLoggedOn.bind(this));
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

	sendTradeOffer(partnerSteamId, items, message) {
		this.tradeOfferOptions = {
			steamId: partnerSteamId,
			items: items,
			message: message
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
				itemsFromThem: this.tradeOfferOptions.items,
				itemsFromMe: []
			};

			this.isBusy = false;

			this.offers.makeOffer(offerOptions, this.onMakeOfferResponse.bind(this));
		}
	}

	onMakeOfferResponse(err, body) {
		this.isBusy = true;

		if (err) {
			console.log(`TradeBot ${this.logOnOptions.accountName} error: ${err.message}`);

			return;
		}

		console.log(`TradeBot ${this.logOnOptions.accountName} success: ${body}`);
	}

	onClientLoggedOn() {
		console.log(`TradeBot ${this.logOnOptions.accountName} logged on.`);

		this.client.setPersona(SteamUser.Steam.EPersonaState.Online);

		this.client.on('webSession', this.onClientLoggedOn.bind(this));
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
	}
}