#!/bin/sh

echo "🔄 Running database migrations..."
npx knex migrate:latest

echo "🔄 Starting server..."
node src/server-simple.js
