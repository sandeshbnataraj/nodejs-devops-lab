'use strict';

var pg = require('pg');
var Promise = require('promise');

var DB_URL = process.env.DB_URL || 'postgres://testuser:123456@localhost:5432/postgres';

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
