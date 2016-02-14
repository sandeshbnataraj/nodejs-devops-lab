'use strict';

import pg from 'pg';
import dbWrapper from '../src/db-postgres';

const DB_URL = process.env.DB_URL || 'postgres://testuser:123456@localhost:5432/postgres';

const dropTable = function() {
  return new Promise((resolve, reject) => {
    pg.connect(DB_URL, (err, client, done) => {
      if (err) {
        done();
        return reject();
      }

      var query = client.query('DROP TABLE IF EXISTS members');

      query.on('end', () => {
        done();
        return resolve();
      });
    });
  });
};

const createTable = function() {
  const CREATE_QUERY = 'CREATE TABLE IF NOT EXISTS members(id text PRIMARY KEY, created_at timestamp)';
  return new Promise((resolve, reject) => {
    var client = new pg.Client(DB_URL);
    client.connect((err) => {
      if(err) {
        return reject();
      }

      client.query(CREATE_QUERY, (err, result) => {
        if (err) {
          return reject();
        }

        client.end();
        return resolve();
      });
    });
  });
};

const insertData = data => () => {
  const INSERT_QUERY = 'INSERT INTO members VALUES($1, now())';

  return new Promise((resolve, reject) => {
    var client = new pg.Client(DB_URL);
    client.connect((err) => {
      if(err) {
        return reject();
      }

      let doneCount = 0;

      data.forEach((id) => {
        client.query(INSERT_QUERY, [id], (err, result) => {
          if (err) {
            return reject();
          }

          doneCount += 1;

          if (doneCount == data.length) {
            client.end();
            return resolve();
          }
        });
      });
    });
  });
};

const checkTableExists = function() {
  const QUERY_STRING = 'SELECT relname FROM pg_class WHERE relname=\'members\'';

  return new Promise((resolve, reject) => {
    var client = new pg.Client(DB_URL);
    client.connect((err) => {
      if(err) {
        return reject();
      }

      client.query(QUERY_STRING, (err, result) => {
        if (err) {
          return reject();
        }
        client.end();
        resolve(result.rows.length === 1);
      });
    });
  });
};

describe('testing initialization', () => {
  beforeEach((done) => {
    dropTable().then(done);
  });

  it('should have getItem and putItem methods', (done) => {
    dbWrapper(DB_URL).then((db) => {
      expect(typeof db.get).toEqual('function');
      expect(typeof db.put).toEqual('function');
      done();
    });
  });

  it('should create member table if it does not exist', (done) => {
    dbWrapper(DB_URL).then((db) => {
      checkTableExists().then((res) => {
        expect(res).toBe(true);
        done();
      });
    });
  });
});

describe('testing get method', () => {
  const sampleIds = ['12', '57', '26', '231'];
  beforeEach((done) => {
    const insertSampleData = insertData(sampleIds);
    dropTable().then(createTable).then(insertSampleData).then(done);
  });

  it('should get item', (done) => {
    dbWrapper(DB_URL).then((db) => {
      db.get('12').then((row) => {
        expect(row.id).toEqual('12');
        done();
      });
    });
  });

  it('should return null if item does not exist', (done) => {
    dbWrapper(DB_URL).then((db) => {
      db.get('not-exists').then((row) => {
        expect(row).toBe(null);
        done();
      });
    });
  });
});
