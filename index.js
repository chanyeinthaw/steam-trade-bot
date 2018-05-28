const Fs = require('fs');
const Model = require('./modules/Model');
const TradeBot = require('./modules/trade-bot');
const APIEndpoint = require('./modules/api-endpoint');
const GameSparksEndpoint = require('./modules/gamesparks-endpoint');
const knex = require('knex');

const GAMES = require('./game-config.js');
const ENV = JSON.parse(Fs.readFileSync("env.json"));

global.decryptionCache = {};

class App {
	constructor(env, games) {
        this.env = env;
        this.games = games;

        Model.setup(knex({client: 'mysql',connection: this.env.mysql}));
	}

	run() {
        this.gs = new GameSparksEndpoint.GameSparks(this.env.gamesparks);
        this.bots = new TradeBot.Registry();
        this.apiep = new APIEndpoint(3000);
        this.offerChecker = new TradeBot.OfferChecker();

        this.registerBotList();

		this.offerChecker.start();
		this.apiep.run();
	}

	registerBotList() {
		console.log(`SteamTradeBot creating bots`);
		for(let i in this.env.bots) {
			let botConfig = this.env.bots[i];
			let tradeBot = new TradeBot.Bot(botConfig.accountName,
				botConfig.password, botConfig.sharedSecret,
				botConfig.identitySecret, ENV.steamAPIKey,
				this.bots, this.offerPoll);

			tradeBot.initOperation();
		}
	}
}

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
});

global.app = new App(ENV, GAMES);
global.app.run();