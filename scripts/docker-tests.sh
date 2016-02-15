#! /bin/bash

sleep 5

DB_HOST=postgres

DB_URL=postgres://testuser:123456@$DB_HOST:5432/postgres  \
node ./specs/start.js ./specs/db-postgres.js
