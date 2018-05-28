const Model = require('../Model.js');
const decrypt = require('../decrypt.js');

class Users extends Model {
    constructor(values) {
        super(values);

        this.table = 'users';
        this.primaryKey = 'id';
    }

    get gameSparksPassword() {
        try {
            return decrypt(this.values.gamesparks_password);
        } catch (e) {
            return '';
        }
    }
}

module.exports = Users;