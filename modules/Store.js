const store = {};

class Store {
    static set(key, value) {
        store[key] = value
    }

    static get(key) {
        return store[key];
    }
}

module.exports = Store;