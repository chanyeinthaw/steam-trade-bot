const Winston = require('winston');
const Fs = require('fs');

module.exports = {
	Error: 'Error',
	Warn: 'Warn',
	Info: 'Info',
	Verbose: 'Verbose',
	Debug: 'Debug',

	log: (level, message, object) => {
		object = JSON.stringify(object)
			.replace(/:/g, '=')
			.replace(/,/g, ' ')
			.replace(/"|{|}/g, '');

		let log = `${new Date(Date.now())} - ${level}: ${message} ${object}\n`;
		Fs.appendFile('logs/application.logs', log, () => {});
	}
};