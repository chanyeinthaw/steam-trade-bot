let db = null;

class Model {
    constructor(values) {
        if (new.target === Model) {
            throw new TypeError("Cannot construct Model instances directly");
        }

        this.values = values;
    }

    delete(ids, column = null) {
        column = column == null ? this.primaryKey : column;
        if (ids === undefined) {
            ids = this.values[column];
        }

        if (!Array.isArray(ids))
            ids = [ids];

        return this.newQuery()
            .whereIn(column, ids)
            .del();
    }

    newQuery() {
        return db(this.table);
    }

    async save() {
        let insertIds = await this.newQuery().insert(this.values);

        if (this.primaryKey !== null)
            this.values[this.primaryKey] = insertIds[0];

        return insertIds.length > 0;
    }

    async update(column = null) {
        column = column == null ? this.primaryKey : column;

        let values = Object.assign({}, this.values);

        delete values[this.primaryKey];

        let count =  await this.newQuery()
            .update(values)
            .where(column, this.values[column]);

        return count > 0;
    }

    static wrap(rows) {
        if (!Array.isArray(rows)) rows = [rows];
        let objects = [];

        for(let i = 0; i < rows.length; i++) {
            objects.push(new this(rows[i]));
        }

        if (objects.length === 1) {
            return objects[0];
        }

        return objects;
    }

    static query() {
        return new this().newQuery();
    }

    static async all() {
        let rows = await this.query().select('*');
        let objects = [];
        for(let i = 0; i < rows.length; i++) {
            objects.push(new this(rows[i]));
        }

        return objects;
    }

    static async find(value, column = null) {
        let instance = new this();
        let row = await this.query()
            .where(column == null ? instance.primaryKey : column, value)
            .select('*').first();

        return row === undefined ? null : new this(row);
    }

    static async findOrNew(value, column = null) {
        let result = await this.find(value, column);

        return result === null ? new this({}) : result;
    }

    static destroy(...ids) {
        return new this().delete(ids);
    }

    static setup(knex) {
        db = knex;
    }
}

module.exports = Model;