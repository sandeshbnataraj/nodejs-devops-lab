#! /bin/bash

sleep 5

DB_HOST=postgres-db

echo $1

DB_URL=postgres://testuser:123456@$DB_HOST:5432/postgres  \
node ./specs/start.js $1
