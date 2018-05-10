const Logger = require('../logger');

const Requests = {
	Authentication: '.AuthenticationRequest',
	AccountDetailsRequest: '.AccountDetailsRequest',
	ChangeUserDetailsRequest: '.ChangeUserDetailsRequest',
	RegistrationRequest: '.RegistrationRequest'
};

class Gamesparks {
	constructor(config) {
		this.gameSparks = require('gamesparks-node');
		this.readyState = false;
		this.config = config;

		this.gameSparks.initPreviewListener(config.apiKey, config.secret, config.socketCount, this.onMessage.bind(this), this.onOperate.bind(this), this.onError.bind(this));
	}

	async authenticateUser(userName, password) {
		return new Promise((resolve, reject) => {
			if (this.readyState) {
				this.gameSparks.sendAs(null, Requests.Authentication, {userName: userName, password: password}, (err, body) => {
					if (err) reject(err);
					else resolve(body);
				});
			}
		});
	}

	async registerUser(displayName, userName, password) {
		return new Promise((resolve, reject) => {
			if (this.readyState) {
				this.gameSparks.sendAs(null, Requests.RegistrationRequest, {
					userName: userName,
					password: password,
					displayName: displayName
				}, (err, body) => {
					if (err) reject(err);
					else resolve(body);
				});
			}
		});
	}

	async executeCloudFunction(userId, cloudFunction, data) {
		return new Promise((resolve, reject) => {
			if (this.readyState) {
				this.gameSparks.sendAs(userId, cloudFunction, data, (err, body) => {
					if (err) reject(err);
					else resolve(body);
				});
			}
		});
	}

	registerRoutes(app) {
		app.get('/gamesparks/register', require('./api-actions/register.js'));
		app.get('/gamesparks/call-procedure', require('./api-actions/call-procedure.js'));
	}

	onOperate() {
		console.log(`Gamesparks client ready.`);
		this.readyState = true;
	}

	onMessage() {

	}

	onError(error) {
		this.readyState = false;
		Logger.log(Logger.Error, 'Gamesparks error', error);

		delete this.gameSparks;

		this.gameSparks = require('gamesparks-node');
		this.gameSparks.initPreviewListener(this.config.apiKey, this.config.secret, this.config.socketCount, this.onMessage.bind(this), this.onOperate.bind(this), this.onError.bind(this));
	}
}

module.exports = {
	Gamesparks: Gamesparks,
	Requests: Requests
};