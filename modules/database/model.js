class Model {
    constructor(attributes, table) {
        this.table = table;
        this.attributes = attributes;
        this.primaryKey = 'id';
    }

    query() {
        return global.app.db(this.table);
    }

    save() {
        return this.query().insert(this.attributes);
    }

    async saveOrGet(field = 'id') {
        try {
            let rows = await this.find(this.attributes[field], field);
            if (rows.length > 0) {
                return rows;
            } else {
                let insertId = (await this.save())[0];

                if (insertId) {
                    let row = Object.assign({}, this.attributes);

                    row.id = insertId;

                    return [row];
                }
            }
        } catch (e) {
            console.log(e.message);
        }

        return [];
    }

    find(id, field = null) {
        return this.query().where(field == null ? this.primaryKey : field, id);
    }

    destroy(...ids) {
        return this.query().whereIn(this.primaryKey, ids).del()
    }

    all() {
        return this.query().select('*');
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