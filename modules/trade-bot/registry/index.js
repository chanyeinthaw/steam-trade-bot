class Registry {
	constructor() {
		this.bots = [];
		this.botIndex = {};
	}

	registerBot(tradeBot) {
		this.bots.push(tradeBot);
		this.botIndex[tradeBot.getBotName()] = this.bots.length - 1;
	}

	unRegisterBot(tradeBot) {
		if (this.botIndex.hasOwnProperty(tradeBot.getBotName())) {
			let index = this.botIndex[tradeBot.getBotName()];
			this.bots.splice(index, 1);
		}
	}

	getIdleBot() {
		for(let i in this.bots) {
			let bot = bots[i];

			if (bot.isBotIdle()) {
				bot.makeBotBusy();
				return bot;
			}
		}
	}
}