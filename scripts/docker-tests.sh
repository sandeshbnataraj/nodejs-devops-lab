#! /bin/bash

sleep 5

DB_HOST=postgres-db

DB_URL=postgres://testuser:123456@$DB_HOST:5432/postgres  \
npm test
