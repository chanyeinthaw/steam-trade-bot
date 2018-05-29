const Totp = require('steam-totp');
const Community = require('steamcommunity');
const TradeOffers = require('steam-tradeoffers');

class TradeBot {
	constructor(accountName, password, sharedSecret, idSecret, steamAPIKey ,registry) {
		this.logOnOptions = {
			accountName: accountName,
			password: password,
			sharedSecret: sharedSecret,
			identitySecret: idSecret,
			rememberPassword: true
		};

		this.webSession = {
			APIKey: steamAPIKey
		};

		this.registry = registry;
		this.isLoggedOn = false;

		this.registry.registerBot(this);

        this.client = new Community();
        this.offers = new TradeOffers();

		this.client.on('sessionExpired', () => {
			this.isLoggedOn = false;
			this.initOperation();
		});
	}

	initOperation() {
		this.logOnOptions.twoFactorCode = Totp.generateAuthCode(this.logOnOptions.sharedSecret);
		this.client.login(this.logOnOptions, this.onClientLoggedOn.bind(this));
	}

	getBotName() {
		return this.logOnOptions.accountName;
	}

	onClientLoggedOn(err, sessionID, webCookie) {
		if (err) {
			this.isLoggedOn = false;
			return;
		}

		this.isLoggedOn = true;

		this.client.setCookies(webCookie);

		console.log(`TradeBot ${this.logOnOptions.accountName} logged on.`);

		console.log(`TradeBot ${this.logOnOptions.accountName} web session started.`);

		this.webSession.sessionID = sessionID;
		this.webSession.webCookie = webCookie;

		console.log(`TradeBot ${this.logOnOptions.accountName} storing webSessionInfo.`);
		console.log(`TradeBot ${this.logOnOptions.accountName} setting up trade offer option.`);

		this.offers.setup(this.webSession);

		console.log(`TradeBot ${this.logOnOptions.accountName} ready to trade.`);

		console.log(`TradeBot ${this.logOnOptions.accountName} added to registry.`);
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

	async acceptOfferById(offerId) {
	    let ids = this.logOnOptions.identitySecret;
	    return new Promise((resolve) => {
            this.client.acceptConfirmationForObject(ids, offerId, (err) => {
                resolve(err);
            })
        })
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

	static prepareItems(items, game) {
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
				itemsFromThem: TradeBot.prepareItems(itemsFromThem, game),
				itemsFromMe: TradeBot.prepareItems(itemsFromMe, game)
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