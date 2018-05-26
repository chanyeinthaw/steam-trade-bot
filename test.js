const Fs = require('fs');
const ENV = JSON.parse(Fs.readFileSync("env.json"));
const knex = require('knex');

global.app = {
    db: knex({client: 'mysql',connection: ENV.mysql})
};

const PendingTrade = require('./modules/database/pending-trade.js');

let pt = new PendingTrade({
    offerid: '134',
    message: 'HI',
    botname: 'botname',
    items: 'items',
    in_out: 'in'
});


pt.save().then((r) => console.log(r));
