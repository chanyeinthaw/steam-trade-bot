const Model = require('./model.js');
const decrypt = require('../decrypt.js');

class User extends Model {
    constructor(attributes) {
        super(attributes, 'users');
    }

    get gameSparksPassword() {
        return new Promise((resolve, reject) => {
            this.getAttribute('gamesparks_password').then((data) => {
                try {
                    let pw = decrypt(data);
                    resolve(pw);
                } catch (e) {
                    reject(e);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }
}

module.exports = User;