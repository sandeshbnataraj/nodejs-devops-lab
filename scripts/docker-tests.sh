#! /bin/bash

function checkDB {
  DB_URL=postgres://testuser:123456@$DB_HOST:5432/postgres node ./specs/helpers/check-db.js; WAITING=$?
}

DB_HOST=postgres-db

if [ "$2" != "--no-db" ]; then

  echo "waiting for db"
  checkDB
  until [ ${WAITING} -eq 0 ]; do
    sleep 1
    checkDB
    echo -n "."
  done
  echo ""

fi

DB_URL=postgres://testuser:123456@$DB_HOST:5432/postgres  \
node ./specs/start.js $1
