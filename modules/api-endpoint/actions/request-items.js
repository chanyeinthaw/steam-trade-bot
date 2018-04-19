module.exports = (res, req) => {
	let query = req.query;

	let requires = [
		'partner', 'token', 'items'
	];

	let errors = validate(requires, query);

	if (errors) {
		return res.send(errors);
	}

	if (this.registry.getIdleBotCount() <= 0) {
		return res.send({
			error: 'Bots are busy or offline.'
		});
	}

	let idleBot = this.registry.getIdleBot();

	let message = Buffer.from(idleBot.getBotName() + Date.now().toString())
		.toString('base64')
		.replace(/=/g, '');

	idleBot.sendTradeOffer(toSteamid(query.partner),
		query.token,
		JSON.parse(query.items),
		[],
		message,
	(err, body) => {
		if (err) {
			res.send(err.message);
		} else {


			res.send(JSON.stringify(body));
		}
	});

	idleBot.releaseBot();
};