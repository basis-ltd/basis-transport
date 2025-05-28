#!/bin/bash

# Exit on error
set -e

# Install dependencies for API
cd api
npm install

# Install dependencies for Client
cd ../client
npm install

# Start both servers concurrently
cd ..

echo "Starting API and Client in development mode..."

# Start API
echo "Starting API (npm run dev in ./api)..."
cd api
npm run dev &
API_PID=$!

# Start Client
echo "Starting Client (npm run dev in ./client)..."
cd ../client
npm run dev -- --host &
CLIENT_PID=$!

# Wait for both to exit
wait $API_PID $CLIENT_PID 