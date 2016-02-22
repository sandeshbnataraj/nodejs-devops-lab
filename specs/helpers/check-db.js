'use strict';

var pg = require('pg');
var Promise = require('promise');

const DB_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/postgres`

var client = new pg.Client(DB_URL);
client.connect((err) => {
  if(err) {
    process.exit(1)
  }

  client.query('select version()', (err, result) => {
    if (err) {
      process.exit(1);
    }
    client.end();
    process.exit(0);
  });
});
