#!/bin/sh
set -e

mkdir -p /data/uploads

echo "→ running prisma migrate deploy"
node ./node_modules/prisma/build/index.js migrate deploy

exec "$@"
