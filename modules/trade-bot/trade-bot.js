const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const SteamTradeOffers = require('steam-tradeoffers');

class TradeBot {
	constructor(accountName, password, sharedSecret, idSecret, steamAPIKey ,registry) {
		this.logOnOptions = {
			accountName: accountName,
			password: password,
			sharedSecret: sharedSecret,
			identitySecret: idSecret,
			rememberPassword: true
		};

		this.intervalId = null;

		this.webSession = {
			APIKey: steamAPIKey
		};

		this.registry = registry;
		this.client = new SteamCommunity();
		this.offers = new SteamTradeOffers();
		this.isBusy = false;

		this.client.on('sessionExpired', (err) => {
			this.registry.unRegisterBot(this);
			this.initOperation();
		});
	}

	initOperation() {
		this.logOnOptions.twoFactorCode = SteamTotp.generateAuthCode(this.logOnOptions.sharedSecret);

		this.client.login(this.logOnOptions, this.onClientLoggedOn.bind(this));
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

	onClientLoggedOn(err, sessionID, webCookie) {
		if (err) {
			console.log(`Tradebot ${this.logOnOptions.accountName} error logging on retrying in 30s.`);

			this.intervalId = setInterval(() => {
				this.registry.unRegisterBot(this);
				this.initOperation();
			}, 30000);

			return;
		}

		if (this.intervalId !== null)
			clearInterval(this.intervalId);

		console.log(`TradeBot ${this.logOnOptions.accountName} logged on.`);

		console.log(`TradeBot ${this.logOnOptions.accountName} web session started.`);

		this.webSession.sessionID = sessionID;
		this.webSession.webCookie = webCookie; console.log(this.webSession);

		console.log(`TradeBot ${this.logOnOptions.accountName} storing webSessionInfo.`);
		console.log(`TradeBot ${this.logOnOptions.accountName} setting up trade offer option.`);

		this.offers.setup(this.webSession);

		console.log(`TradeBot ${this.logOnOptions.accountName} ready to trade.`);

		this.registry.registerBot(this);

		console.log(`TradeBot ${this.logOnOptions.accountName} added to registry.`);

		this.releaseBot();
	}

	async getTradeOffer(offerId) {
		return new Promise((resolve, reject) => {
			this.offers.getOffer({
				tradeofferid : offerId
			}, (err, res) => {
				if (err) reject(err);
				else resolve(res);
			})
		});
	}

	async cancelTradeOffer(offerId) {
		return new Promise((resolve, reject) => {
			this.offers.cancelOffer({
				tradeOfferId : offerId
			}, (res) => {
				if (!res) reject(new Error('Cancele trade offer fails.'))
				else resolve(true);
			})
		});
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
}

module.exports = TradeBot;