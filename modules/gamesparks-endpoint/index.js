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

	authenticateUser(userName, password, callback) {
		if (this.readyState) {
			this.gameSparks.sendAs(null, Requests.Authentication, {userName: userName, password: password}, callback);
		}
	}

	registerUser(displayName, userName, password, callback) {
		if (this.readyState) {
			this.gameSparks.sendAs(null, Requests.RegistrationRequest, {
				userName: userName,
				password: password,
				displayName: displayName
			}, callback);
		}
	}

	executeCloudFunction(userId, cloudFunction, data, callback) {
		if (this.readyState) {
			this.gameSparks.sendAs(userId, cloudFunction, data, callback);
		}
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