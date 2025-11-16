#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Fetch Prisma binaries
python -m prisma py fetch

# Generate Prisma client
python -m prisma generate

# Push database schema
python -m prisma db push