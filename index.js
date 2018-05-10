const Fs = require('fs');
const Mysql = require('promise-mysql');
const TradeBot = require('./modules/trade-bot');
const APIEndpoint = require('./modules/api-endpoint');
const GamesparksEndpoint = require('./modules/gamesparks-endpoint');
const query = require('./modules/database');

const ENV = JSON.parse(Fs.readFileSync("env.json"));

global.mysqlConfig = ENV.mysql;

process.on('unhandledRejection', error => {
	console.log('unhandledRejection', error.message);
});

class SteamTradeBot {
	constructor() {
		this.gamesparks = new GamesparksEndpoint.Gamesparks(ENV.gamesparks);
		this.botRegistry = new TradeBot.Registry();
		this.apiEndpoint = new APIEndpoint(3000, {
			registry: this.botRegistry,
			gamesparks: this.gamesparks,
			query: query,
		});

		this.registerBotList();

		this.apiEndpoint.listen();
	}

	registerBotList() {
		console.log(`SteamTradeBot creating bots`);
		for(let i in ENV.bots) {
			let botConfig = ENV.bots[i];
			let tradeBot = new TradeBot.Bot(botConfig.accountName,
				botConfig.password, botConfig.sharedSecret,
				botConfig.identitySecret, ENV.steamAPIKey,
				this.botRegistry, this.offerPoll);

			tradeBot.initOperation();
		}
	}
}

let instance = new SteamTradeBot();