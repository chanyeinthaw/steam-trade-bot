class Model {
    constructor(attributes, table) {
        this.table = table;
        this.attributes = attributes;
        this.primaryKey = 'id';
    }

    query() {
        return global.app.db(this.table);
    }

    async getAttribute(col) {
        try {
            let rows =  await this.query()
                .select(col)
                .where(this.primaryKey, this.attributes[this.primaryKey]);

            return rows[0][col];
        } catch (e) {
            return undefined;
        }
    }
}

module.exports = Model;