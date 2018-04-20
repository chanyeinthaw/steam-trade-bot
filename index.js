const Fs = require('fs');
const TradeBot = require('./modules/trade-bot');
const APIEndpoint = require('./modules/api-endpoint');
const GamesparksEndpoint = require('./modules/gamesparks-endpoint');

const ENV = JSON.parse(Fs.readFileSync("env.json"));

class SteamTradeBot {
	constructor() {
		this.gamesparks = new GamesparksEndpoint.Gamesparks(ENV.gamesparks);
		this.botRegistry = new TradeBot.Registry();
		this.apiEndpoint = new APIEndpoint(3000, {
			registry: this.botRegistry,
			gamesparks: this.gamesparks
		});

		this.registerBotList();

		this.apiEndpoint.listen();
	}

	registerBotList() {
		console.log(`SteamTradeBot creating bots`);
		for(let i in ENV.bots) {
			let botConfig = bots[i];
			let tradeBot = new TradeBot.Bot(botConfig.accountName, botConfig.password, botConfig.twoFactorCode, this.botRegistry);

			tradeBot.initOperation();
		}
	}
}

let instance = new SteamTradeBot();