# sample project

This is NodeJS project that accompanies my guest blog post on Gitlab.com. Link TBA.

It contains two independent modules to be tested with Gitlab CI.

To run test locally with Docker Compose:

```
# preparation
docker-compose build
docker-compose up -d

# running the tests
docker-compose run --rm node /bin/bash scripts/docker-tests.sh

# cleaning up
docker-compose stop
docker-compose rm -f
```

To run the test directly, set up a postgres test database, then execute:
```
DB_URL=<POSTGRES_URL>  \
node ./specs/start.js $1
```

To use a dockerized postgres db, run:
```
docker run \
  --name postgres-db \
  --publish=5432:5432 \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_USER=testuser \
  -d postgres:9.5.0
```
Then the db will be available at the following address:
> postgres://testuser:123456@localhost:5432/postgres
