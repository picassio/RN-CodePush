#!/bin/bash

# build-codepush.sh
# Automates the generation of CodePush-compatible update packages.

PLATFORM=$1 # android or ios
OUTPUT_DIR="codepush/$PLATFORM"
BUNDLE_FILE="index.bundle"
ENTRY_FILE="index.js"

if [ -z "$PLATFORM" ]; then
  PLATFORM="android"
fi

if [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "ios" ]; then
  echo "❌ Error: Platform must be 'android' or 'ios'"
  exit 1
fi

echo "🚀 Starting CodePush build for $PLATFORM..."

# Ensure we are in the project root
cd "$(dirname "$0")/.."

# Clean and create directory
echo "📁 Preparing output directory: $OUTPUT_DIR"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Build JS Bundle
echo "⚙️  Generating JS bundle (this may take a minute)..."
npx react-native bundle \
  --platform "$PLATFORM" \
  --dev false \
  --entry-file "$ENTRY_FILE" \
  --bundle-output "$OUTPUT_DIR/$BUNDLE_FILE" \
  --assets-dest "$OUTPUT_DIR" \
  --sourcemap-output "$OUTPUT_DIR/$BUNDLE_FILE.map"

# Verify bundle existence
if [ ! -f "$OUTPUT_DIR/$BUNDLE_FILE" ]; then
  echo "❌ Error: Bundle generation failed!"
  exit 1
fi

# Generate metadata.json
# Customize this object to match your specific server requirements
echo "📝 Generating metadata.json..."
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +%s)
DESCRIPTION="CodePush update for $PLATFORM - Version $VERSION"

cat <<EOF > "$OUTPUT_DIR/metadata.json"
{
  "version": "$VERSION",
  "platform": "$PLATFORM",
  "timestamp": $TIMESTAMP,
  "description": "$DESCRIPTION"
}
EOF

# Create ZIP package
ZIP_NAME="codepush_${PLATFORM}_release.zip"
echo "📦 Creating package: $ZIP_NAME"

# We use -j to flatten the directory structure if needed, but the SDK expects the relative assets path
# So we cd into the output dir and zip everything there
cd "$OUTPUT_DIR"
zip -r "../../$ZIP_NAME" . -x "*.map"
cd ../..

echo "----------------------------------------------------"
echo "✅ SUCCESS!"
echo "📍 Package: ./$ZIP_NAME"
echo "📂 Contents: bundle, assets/, metadata.json"
echo "----------------------------------------------------"
