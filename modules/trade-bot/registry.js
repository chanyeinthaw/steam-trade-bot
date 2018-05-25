class Registry {
	constructor() {
		this.bots = [];
		this.botIndex = {};
	}

	registerBot(tradeBot) {
		this.bots.push(tradeBot);
		this.botIndex[tradeBot.getBotName()] = this.bots.length - 1;
	}

	getBotByName(name) {
		if (this.botIndex.hasOwnProperty(name)) {
			let index = this.botIndex[name];
			return this.bots[index];
		}

		return null;
	}

	unRegisterBot(tradeBot) {
		if (this.botIndex.hasOwnProperty(tradeBot.getBotName())) {
			let index = this.botIndex[tradeBot.getBotName()];
			this.bots.splice(index, 1);
		}
	}

	getIdleBotCount() {
		let count = 0;
		for(let i in this.bots) {
			let bot = this.bots[i];

			if (bot.isBotIdle()) {
				count ++;
			}
		}

		return count;
	}

	async getBot(game, items) {
		for(let i in this.bots) {
			let bot = this.bots[i];

			if (bot.isBotIdle() && bot.isLoggedOn) {
				let free = null;
				try {
					free = game.maxInventoryLimit - await bot.getInventoryItemCount(parseInt(game.appId), game.contextId);
				} catch (e) { continue; }

				let reducedItems = null;
				if (items.length > free) {
					reducedItems = items.splice(0, items.length - free);
				} else {
					reducedItems = items;
				}
				if (reducedItems.length <= 0) continue;

				bot.makeBotBusy();
				return { bot: bot, items: reducedItems };
			}
		}
	}
}

module.exports = Registry;