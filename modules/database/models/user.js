const Model = require('../model.js');

class User extends Model {
    constructor(attributes) {
        super(attributes, 'users');
    }

    get gameSparksPassword() {
        return this.getAttribute('gamesparks_password');
    }
}

module.exports = User;