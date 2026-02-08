#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Compiling TypeScript (ignoring errors)..."
npx tsc || true

echo "Build complete!"
