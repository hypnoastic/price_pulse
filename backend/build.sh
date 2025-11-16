#!/bin/bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Fetching Prisma binaries..."
python -m prisma py fetch || echo "Fetch failed, continuing..."

echo "Generating Prisma client..."
python -m prisma generate

echo "Pushing database schema..."
python -m prisma db push

echo "Build completed successfully!"