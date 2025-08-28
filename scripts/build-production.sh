#!/bin/bash

# Production build script with console log stripping
# This script ensures all console statements are removed from production builds

echo "======================================"
echo "Production Build with Log Stripping"
echo "======================================"

# Set environment to production
export NODE_ENV=production

# Server build with Bun
echo ""
echo "Building server..."
cd apps/server
bun run build

# Add terser step to remove console logs from server build
if [ -d "dist" ]; then
  echo "Stripping console logs from server build..."
  npx terser dist/**/*.js \
    --compress drop_console=true \
    --mangle \
    --output dist/
fi

cd ../..

# Native app build (Expo handles console stripping via metro.config.js)
echo ""
echo "Building native app..."
cd apps/native

# For iOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Building for iOS..."
  expo build:ios --release-channel production
fi

# For Android
echo "Building for Android..."
expo build:android --release-channel production

cd ../..

echo ""
echo "======================================"
echo "Production build complete!"
echo "Console logs have been stripped."
echo "======================================"