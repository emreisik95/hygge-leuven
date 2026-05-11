#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R nextjs:nodejs /data

echo "→ running prisma migrate deploy"
su-exec nextjs:nodejs node ./node_modules/prisma/build/index.js migrate deploy

echo "→ starting app as nextjs"
exec su-exec nextjs:nodejs "$@"
