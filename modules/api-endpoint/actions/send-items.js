module.exports = (req, res, modules) => {
	let query = req.query;

	let requires = [
		'partner', 'token', 'items', 'apikey'
	];

	let errors = validate(requires, query);

	if (errors) {
		return res.send(errors);
	}

	if (apikey !== 'foolish') {
		return res.send({
			error: 'Invalid API key.'
		});
	}


};