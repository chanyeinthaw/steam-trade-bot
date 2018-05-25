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

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

	async getBot(game, items) {
		let randomIndex = Registry.getRandomInt(0, this.bots.length - 1);

        let bot = this.bots[randomIndex];

        if (bot.isLoggedOn) {
            let free = null;
            try {
                free = game.maxInventoryLimit - await bot.getInventoryItemCount(parseInt(game.appId), game.contextId);
            } catch (e) { return {bot: null, items: []}; }

            let reducedItems = null;
            if (items.length > free) {
                reducedItems = items.splice(0, items.length - free);
            } else {
                reducedItems = items;
            }

            if (reducedItems.length > 0)
            	return { bot: bot, items: reducedItems };
        }

		return {bot: null, items: []};
	}
}

module.exports = Registry;