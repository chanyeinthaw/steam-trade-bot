const Fs = require('fs');
const ENV = JSON.parse(Fs.readFileSync("env.json"));
const knex = require('knex');

global.app = {
    db: knex({client: 'mysql',connection: ENV.mysql})
};

const Model = require('./modules/Model');

Model.setup(global.app.db);
const Test = require('./modules/database/InventoryItem.js');

async function test() {
    let t = await Test.find(1);

    console.log(t)
}

test();
