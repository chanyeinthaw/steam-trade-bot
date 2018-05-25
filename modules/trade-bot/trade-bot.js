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
		this.isLoggedOn = false;

		this.registry.registerBot(this);

		this.client.on('sessionExpired', (err) => {
			this.isLoggedOn = false;
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
			this.isLoggedOn = false;
			// console.log(`Tradebot ${this.logOnOptions.accountName} error logging on retrying in 30s.`);
			//
			// this.intervalId = setInterval(() => {
			// 	this.registry.unRegisterBot(this);
			// 	this.initOperation();
			// }, 30000);

			return;
		}

		// if (this.intervalId !== null)
		// 	clearInterval(this.intervalId);

		this.isLoggedOn = true;

		console.log(`TradeBot ${this.logOnOptions.accountName} logged on.`);

		console.log(`TradeBot ${this.logOnOptions.accountName} web session started.`);

		this.webSession.sessionID = sessionID;
		this.webSession.webCookie = webCookie;

		console.log(`TradeBot ${this.logOnOptions.accountName} storing webSessionInfo.`);
		console.log(`TradeBot ${this.logOnOptions.accountName} setting up trade offer option.`);

		this.offers.setup(this.webSession);

		console.log(`TradeBot ${this.logOnOptions.accountName} ready to trade.`);

		console.log(`TradeBot ${this.logOnOptions.accountName} added to registry.`);

		this.releaseBot();
	}

	async getInventoryItemCount(appid, contextid) {
		return new Promise((resolve, reject) => {
			this.offers.loadMyInventory({appId: appid, contextId: contextid}, (err, data, raw) => {
				if (err) return reject(err);
				else resolve(data.length);
			})
		})
	}

	async getItemsOfCompletedOffer(offer) {
		return new Promise((resolve, reject) => {
			this.offers.getItems({tradeId: offer.tradeid}, (err, items) => {
				if (err) reject(err);
				else resolve(items);
			});
		});
	}

	async getTradeOffer(offerId) {
		return new Promise((resolve, reject) => {
			this.offers.getOffer({
				tradeofferid : offerId
			}, (err, res) => {
				if (err) reject(err);
				else resolve(res.response.offer);
			})
		});
	}

	cancelTradeOffer(offerId) {
		this.offers.cancelOffer({tradeOfferId : offerId}, (res) => {});
	}

	prepareItems(items, game) {
		let r = [];
        for(let i = 0; i < items.length; i++){
            let item = items[i];

            item.appid = parseInt(game.appId);
            item.contextid = game.contextId;
            item.amount = 1;

            r.push(item);
        }

        return r;
	}

	async sendTradeOffer(partnerSteamId, accessToken, itemsFromThem, itemsFromMe, message, game) {
		return new Promise((resolve, reject) => {
			if (this.client.steamID === null) {
				return reject(new Error('Client not connected'));
			}

			let offerOptions = {
				message: message,
				partnerSteamId: partnerSteamId,
				accessToken: accessToken,
				itemsFromThem: this.prepareItems(itemsFromThem, game),
				itemsFromMe: this.prepareItems(itemsFromMe, game)
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