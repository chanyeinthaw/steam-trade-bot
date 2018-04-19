module.exports = (keys, query) => {
	let errors = {};
	for(let i in keys) {
		if (!query.hasOwnProperty(keys[i])) {
			errors[keys[i]] = `${keys[i]} value required.`;
		}
	}

	if (Object.keys(errors).length === 0) {
		return false;
	}

	return errors;
};