const Logger = require('../logger');

const Requests = {
	Authentication: '.AuthenticationRequest',
	AccountDetailsRequest: '.AccountDetailsRequest',
	ChangeUserDetailsRequest: '.ChangeUserDetailsRequest',
};

class Gamesparks {
	constructor(apiKey, secret, socketCount) {
		this.gameSparks = require('gamesparks-node');
		this.readyState = false;
		this.currentUser = null;

		this.config = {
			apiKey: apiKey,
			secret: secret,
			socketCount: socketCount
		};

		this.gameSparks.initPreviewListener(apiKey, secret, socketCount, this.onMessage.bind(this), this.onOperate.bind(this), this.onError.bind(this));
	}

	authenticateUser(userName, password, callback) {
		if (this.readyState) {
			let authResponse = (err, user) => {
				this.currentUser = user;
				callback(err,user);
			};

			this.gameSparks.sendAs(null, Requests.Authentication, {userName: userName, password: password}, authResponse.bind(this));
		}
	}

	executeCloudFunction(cloudFunction, data, callback) {
		if (this.readyState && this.currentUser !== null) {
			this.gameSparks.sendAs(this.currentUser.userId, cloudFunction, data, callback);
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