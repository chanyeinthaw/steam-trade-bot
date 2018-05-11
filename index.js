const Fs = require('fs');
const TradeBot = require('./modules/trade-bot');
const APIEndpoint = require('./modules/api-endpoint');
const GamesparksEndpoint = require('./modules/gamesparks-endpoint');
const db = require('./modules/database');

const ENV = JSON.parse(Fs.readFileSync("env.json"));

global.mysqlConfig = ENV.mysql;
global.jwtSecret = ENV.jwtSecret;
global.appKey = ENV.appKey;
global.decryptionCache = {};

process.on('unhandledRejection', error => {
	console.log('unhandledRejection', error.message);
});

class Application {
	constructor() {
		this.gs = new GamesparksEndpoint.Gamesparks(ENV.gamesparks);
		this.bots = new TradeBot.Registry();
		this.apiep = new APIEndpoint(3000);
		this.db = db;

		this.registerBotList();
	}

	run() {
		this.apiep.run();
	}

	registerBotList() {
		console.log(`SteamTradeBot creating bots`);
		for(let i in ENV.bots) {
			let botConfig = ENV.bots[i];
			let tradeBot = new TradeBot.Bot(botConfig.accountName,
				botConfig.password, botConfig.sharedSecret,
				botConfig.identitySecret, ENV.steamAPIKey,
				this.bots, this.offerPoll);

			tradeBot.initOperation();
		}
	}
}

global.app = new Application();
global.app.run();