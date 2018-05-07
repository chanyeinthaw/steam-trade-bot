const SteamUser = require('steam-user');
// const getSteamAPIKey = require('steam-web-api-key');
const SteamTradeOffers = require('steam-tradeoffers');
const Logger = require('../logger');

class TradeBot {
	constructor(accountName, password, twoFactorCode, registry) {
		this.logOnOptions = {
			accountName: accountName,
			password: password,
			twoFactorCode: twoFactorCode,
			rememberPassword: true
		};

		this.registry = registry;
		this.client = new SteamUser();
		this.offers = new SteamTradeOffers();
		this.isBusy = false;

		this.client.on('loggedOn', this.onClientLoggedOn.bind(this));
		this.client.on('webSession', this.onClientWebSession.bind(this));
		this.client.on('disconnected', this.onClientDissconnected.bind(this));
		this.client.on('error', (error) => {
			Logger.log(Logger.Error, 'LogOnException', error);
		});
	}

	initOperation() {
		this.client.logOn(this.logOnOptions);
	}

	relogBot() {
		this.registry.unRegisterBot(this);
		this.client.relog();
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

	onClientLoggedOn() {
		console.log(`TradeBot ${this.logOnOptions.accountName} logged on.`);

		this.client.setPersona(SteamUser.Steam.EPersonaState.Online);
	}

	onClientDissconnected(eresult, msg) {
		console.log(`TradeBot ${this.logOnOptions.accountName} disconnected.`);

		this.registry.unRegisterBot(this);

		console.log(`TradeBot ${this.logOnOptions.accountName} removed from registry.`);
	}

	async getTradeOffer(offerId) {
		return new Promise((resolve, reject) => {
			this.offers.getOffer({
				tradeOfferId: offerId
			}, (err, res) => {
				if (err) reject(err);
				else resolve(res);
			})
		});
	}

	onClientWebSession(sessionID, webCookie) {
		console.log(`TradeBot ${this.logOnOptions.accountName} web session started.`);

		this.webSession = {
			sessionID: sessionID,
			webCookie: webCookie,
		};

		// console.log(`TradeBot ${this.logOnOptions.accountName} requesting api key.`);

		// try {
		// 	this.webSession.APIKey = await this.getSteamApiKey();
		//
		// 	console.log(`TradeBot ${this.logOnOptions.accountName} api key acquired.`);
		// } catch (e) {
		// 	console.log(`TradeBot ${this.logOnOptions.accountName} api key get error.`);
		// }

		console.log(`TradeBot ${this.logOnOptions.accountName} storing webSessionInfo.`);
		console.log(`TradeBot ${this.logOnOptions.accountName} setting up trade offer option.`);

		this.offers.setup(this.webSession);

		console.log(`TradeBot ${this.logOnOptions.accountName} ready to trade.`);

		this.registry.registerBot(this);

		console.log(`TradeBot ${this.logOnOptions.accountName} added to registry.`);
	}

	async sendTradeOffer(partnerSteamId, accessToken, itemsFromThem, itemsFromMe, message) {
		return new Promise((resolve, reject) => {
			if (this.client.steamID === null) {
				return reject(new Error('Client not connected'));
			}

			let offerOptions = {
				message: message,
				partnerSteamId: partnerSteamId,
				accessToken: accessToken,
				itemsFromThem: itemsFromThem,
				itemsFromMe: itemsFromMe
			};

			this.isBusy = true;

			this.offers.makeOffer(offerOptions,(err, body) => {
				this.isBusy = false;

				if (err) {
					console.log(`TradeBot ${this.logOnOptions.accountName} error: ${err.message}`);

					return reject(err);
				}

				console.log(`TradeBot ${this.logOnOptions.accountName} success: offer id is ${body.tradeofferid}`);
				resolve(body);
			});
		});
	}

	// async getSteamApiKey() {
	// 	return new Promise((resolve, reject) => {
	// 		getSteamAPIKey(this.webSession, (err, APIKey) => {
	// 			if (err) reject(err);
	// 			else resolve(APIKey);
	// 		});
	// 	})
	// }
}

module.exports = TradeBot;