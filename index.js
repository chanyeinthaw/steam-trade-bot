const Fs = require('fs');
const TradeBot = require('./modules/trade-bot');
const APIEndpoint = require('./modules/api-endpoint');

class SteamTradeBot {
	constructor() {
		this.botRegistry = new TradeBot.Registry();
		this.apiEndpoint = new APIEndpoint(3000, this.botRegistry);

		this.registerBotList();

		this.apiEndpoint.listen();
	}

	registerBotList() {
		let bots = Fs.readFileSync('bots.json');

		bots = JSON.parse(bots);

		console.log(`SteamTradeBot creating bots`);
		for(let i in bots) {
			let botConfig = bots[i];
			let tradeBot = new TradeBot.Bot(botConfig.accountName, botConfig.password, botConfig.twoFactorCode, this.botRegistry);

			tradeBot.initOperation();
		}
	}
}

let instance = new SteamTradeBot();