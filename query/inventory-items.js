const QUERY = {
	insert: 'insert into inventory_items set ?'
};

class InventoryItemDao {
	constructor(conn) {
		this.conn = conn;
	}
}