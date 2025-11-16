#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
python -m prisma generate

# Push database schema
python -m prisma db push