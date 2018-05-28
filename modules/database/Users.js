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
            return decrypt(data);
        } catch (e) {
            return '';
        }
    }
}

module.exports = Users;