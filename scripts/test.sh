#!/bin/bash

HOST=${HOST:-localhost}
DBNAME=${DBNAME:-test}

echo "Starting integration tests..."
MONGODB_HOST=$HOST MONGODB_DBNAME=$DBNAME mocha --compilers js:babel-register --recursive test/

echo "Dropping database: \"$DBNAME\""
mongo $HOST/$DBNAME --eval "db.dropDatabase();"
