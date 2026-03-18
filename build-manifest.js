const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const platform = process.argv[2] || 'android';
const distDir = path.join('codepush', platform);
const bundlePath = path.join(distDir, 'index.bundle');
const zipName = `codepush_${platform}_release.zip`;
// The zip is created at the project root by build-codepush.sh
const zipPath = zipName;
// The base URL where your zip files and manifest are hosted
const baseUrl =
  'https://hcm03.vstorage.vngcloud.vn/v1/AUTH_349c8b85955a49f192a4b9b0c9d58020/dev/testing/';
const zipUrl = baseUrl + zipName;

function buildManifest() {
  if (!fs.existsSync(distDir)) {
    console.error(
      `Error: Directory ${distDir} does not exist. Please run your bundle command first.`
    );
    process.exit(1);
  }

  if (!fs.existsSync(bundlePath)) {
    console.error(
      `Error: Bundle not found at ${bundlePath}. Please run the bundle command first.`
    );
    process.exit(1);
  }

  if (!fs.existsSync(zipPath)) {
    console.error(
      `Error: Zip file not found at ${zipPath}. Please zip the bundle and assets first.`
    );
    process.exit(1);
  }

  // We will generate a single unified manifest for BOTH platforms.
  const manifestDir = 'codepush';
  const manifestPath = path.join(manifestDir, 'manifest.json');

  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      console.warn('Could not read existing manifest, creating new one.');
    }
  }

  const stats = fs.statSync(zipPath);

  // Update the platform specific URL and size
  if (platform === 'android') {
    manifest.zipBundleUrlAndroid = zipUrl;
    manifest.sizeAndroid = stats.size;
  } else if (platform === 'ios') {
    manifest.zipBundleUrliOS = zipUrl;
    manifest.sizeiOS = stats.size;
  }

  // Generate a consistent packageHash using BOTH bundles if they exist.
  // This ensures building android and then ios doesn't change the hash for android unexpectedly.
  let hashPayload = '';
  const androidBundle = path.join('codepush', 'android', 'index.bundle');
  const iosBundle = path.join('codepush', 'ios', 'index.bundle');

  if (fs.existsSync(androidBundle)) {
    hashPayload += fs.readFileSync(androidBundle, 'utf8');
  }
  if (fs.existsSync(iosBundle)) {
    hashPayload += fs.readFileSync(iosBundle, 'utf8');
  }

  const packageHash = crypto
    .createHash('sha256')
    .update(hashPayload)
    .digest('hex');

  manifest.packageHash = packageHash;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`✅ Unified Manifest written to ${manifestPath}`);
  console.log(`📦 Package Hash: ${packageHash}`);
  if (manifest.zipBundleUrlAndroid)
    console.log(`🔗 Android Zip URL: ${manifest.zipBundleUrlAndroid}`);
  if (manifest.zipBundleUrliOS)
    console.log(`🔗 iOS Zip URL: ${manifest.zipBundleUrliOS}`);
}

buildManifest();
