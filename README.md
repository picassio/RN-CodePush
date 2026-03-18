# React Native CodePush SDK

A React Native SDK for over-the-air (OTA) updates with support for your own backend. Use it to ship JS and asset updates without going through the app stores.

**[CodePush Portal (Dashboard)](https://codepush.hyper-mind.dev/)** — manage deployments and view update status.

- **Custom server**: Works with any server that implements the CodePush-style API.
- **Unified API**: Same API on iOS and Android (provider, hook, or class-based).
- **Optional demo**: See the `example/` app for a full setup.

<p align="center">
  <img src="Screen_Recording_20260316_095707_Eduhome.gif" alt="Eduhome splash screen" width="320" />
</p>
<p align="center"><em>Demo App</em></p>

## ZIP + manifest mode (for large bundle)

In addition to the classic CodePush-style API (`/update_check`), the SDK supports a **ZIP + manifest** mode.
This is useful when you host a single large bundle (e.g. for a social app) and want clients to decide
"new version or not" from a tiny JSON manifest, without downloading the ZIP on every check.

### Manifest format

Host a small JSON file (for example at `https://your-server.com/codepush/manifest.json`).

You can either use a **single ZIP for both platforms**:

```json
{
  "packageHash": "abc123def456",
  "zipBundleUrl": "https://your-server.com/codepush/bundles/app-abc123def456.zip",
  "size": 104857600
}
```

or a **platform-specific ZIP per OS**, with one manifest URL and both URLs inside:

```json
{
  "packageHash": "abc123def456",
  "zipBundleUrlAndroid": "https://your-server.com/codepush/bundles/app-android.zip",
  "zipBundleUrliOS": "https://your-server.com/codepush/bundles/app-ios.zip",
  "sizeAndroid": 104857600,
  "sizeiOS": 104857600
}
```

- `packageHash`: logical version / hash of the OTA bundle.
- `zipBundleUrl`: public URL of the ZIP bundle when using a single ZIP.
- `zipBundleUrlAndroid` / `zipBundleUrliOS`: platform-specific ZIP URLs (when using separate bundles).
- `size`, `sizeAndroid`, `sizeiOS` (optional): used for progress UI and basic size checks.

### Generating `manifest.json` in your build/CI

This repo provides 2 scripts at the repo root to build the OTA ZIP and update `codepush/manifest.json`.

Run from the repo root:

```bash
# iOS
bash build-codepush.sh ios
node build-manifest.js ios

# Android
bash build-codepush.sh android
node build-manifest.js android
```

Optional: add a `package.json` script for one-liner usage (example for iOS):

```json
{
  "scripts": {
    "codepush:ios": "bash scripts/build-codepush.sh ios && node scripts/build-manifest.js ios"
  }
}
```

Then run:

```bash
yarn codepush:ios
```

This produces:

- `codepush/<platform>/index.bundle` + assets + `metadata.json`
- `codepush_<platform>_release.zip` at the repo root
- `codepush/manifest.json` (unified manifest with `packageHash` + platform URL/size)

You can adapt the hashing scheme (e.g. include assets or use a git commit hash) as long as
`packageHash` stays stable for a given bundle and changes when you release a new version.

### Using CustomCodePush with a manifest

You can keep `serverUrl` and `deploymentKeyIOS` / `deploymentKeyAndroid` for the classic API, or omit them if you only use
the manifest-based flow. On app startup (or whenever you want to check), call:

```ts
import CustomCodePush from 'react-native-codepush-sdk';

const codePush = new CustomCodePush({
  // Optional: serverUrl and deploymentKeyIOS / deploymentKeyAndroid for classic mode.
  // Optional: manifestUrl if you want to store it in config.
  manifestUrl: EnvConfig.codePushManifestUrl,
  installMode: 'ON_NEXT_RESTART',
});

await codePush.initialize();

const result = await codePush.checkAndInstallFromManifest({
  manifestUrl: EnvConfig.codePushManifestUrl,
  installMode: 'ON_NEXT_RESTART', // or 'IMMEDIATE' / 'ON_NEXT_RESUME'
});

console.log('Has new version:', result.hasNewVersion);
console.log('Installed hash:', result.installedHash);
console.log('Latest hash:', result.latestHash);
```

`checkAndInstallFromManifest` will:

- Fetch the manifest (small JSON).
- Compare `manifest.packageHash` with the currently installed `packageHash`.
- Download and install the ZIP from `zipBundleUrl` **only when the hash changes**.
- Treat "no current package hash" as **first install** and install once.

This design works well for **social-style apps** or any scenario where you distribute one large bundle,
minimize per-launch network traffic, and still get OTA behavior.

## Features

- **Custom server** – Point to your own update server (see [Backend](#backend-for-server-implementers)).
- **OTA updates** – Download and install JS bundles and assets without a store release.
- **Rollback** – Revert to the previous bundle on failed install.
- **Progress** – Download and install progress callbacks.
- **Mandatory updates** – Optional forced updates.
- **Install modes** – Immediate, on next restart, or on next resume.
- **Gradual rollouts** – Server-side rollout percentage support.

## Requirements

- React Native >= 0.60, React >= 16.8
- Node >= 18 (for tooling)

## Installation

### 1. Install the package

```bash
npm install react-native-codepush-sdk
```

Peer dependencies (install if not already present):

```bash
npm install react-native-fs react-native-zip-archive react-native-device-info @react-native-async-storage/async-storage react-native-restart 
```

### 2. Platform setup

#### iOS

1. Run `cd ios && pod install`.
2. If your server uses HTTP (e.g. local dev), add to `Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

#### Android

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Usage

App version is read from the device via `react-native-device-info`; you configure `serverUrl` and platform keys (`deploymentKeyIOS`, `deploymentKeyAndroid`).

### Provider + component (recommended)

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { CodePushProvider, UpdateChecker } from 'react-native-codepush-sdk';

const config = {
  serverUrl: 'https://your-codepush-server.com',
  deploymentKeyIOS: 'your-ios-key',
  deploymentKeyAndroid: 'your-android-key',
  checkFrequency: 'ON_APP_START',
  installMode: 'ON_NEXT_RESTART',
  minimumBackgroundDuration: 0,
};

export default function App() {
  return (
    <CodePushProvider config={config} autoCheck checkOnResume>
      <SafeAreaView style={{ flex: 1 }}>
        <UpdateChecker />
      </SafeAreaView>
    </CodePushProvider>
  );
}
```

### useCodePush hook

```tsx
import { View, Button } from 'react-native';
import { useCodePush } from 'react-native-codepush-sdk';

function MyScreen() {
  const {
    availableUpdate,
    isChecking,
    checkForUpdate,
    syncUpdate,
    getBundleUrl,
  } = useCodePush();

  return (
    <View>
      {availableUpdate && (
        <Button title="Install Update" onPress={syncUpdate} />
      )}
      <Button
        title="Check for Updates"
        onPress={checkForUpdate}
        disabled={isChecking}
      />
    </View>
  );
}
```

### Class-based (CustomCodePush)

```tsx
import { CustomCodePush } from 'react-native-codepush-sdk';

const codePush = new CustomCodePush({
  serverUrl: 'https://your-server.com',
  deploymentKeyIOS: 'your-ios-key',
  deploymentKeyAndroid: 'your-android-key',
});

await codePush.initialize();

const update = await codePush.checkForUpdate();
if (update) {
  const localPackage = await codePush.downloadUpdate(update, (progress) => {
    console.log(`${progress.receivedBytes}/${progress.totalBytes}`);
  });
  await codePush.installUpdate(localPackage);
}
```

## What you use and receive

**You configure:** `serverUrl`, `deploymentKeyIOS`, `deploymentKeyAndroid` (and optionally `installMode`, `checkFrequency`). The SDK automatically sends `bundleId` (from the device; not configurable) with every API request for backend validation.

**You call:** `checkForUpdate()`, `syncUpdate()`, `rollback()`, `clearUpdates()`, `getBundleUrl()` (from `useCodePush()` or `CustomCodePush`).

**You receive:** `availableUpdate` (when an update exists), `currentUpdate` (currently installed), `syncStatus`, `isChecking`, `isDownloading`, `isInstalling`. The SDK handles the rest (network calls, install, reporting) internally.

---

## Backend (for server implementers)

Your server must expose these routes under `serverUrl` (e.g. on Vercel): `POST /api/v1/update_check`, `POST /api/v1/report_status/deploy`, `POST /api/v1/report_status/download`. The SDK calls them automatically. Request and response formats are documented in `src/api/server-example.md`.

## Configuration

```typescript
interface CodePushConfiguration {
  serverUrl?: string;           // Base URL of your update server (no trailing slash)
  deploymentKeyIOS?: string;    // iOS deployment key (e.g. from CMS dashboard)
  deploymentKeyAndroid?: string; // Android deployment key (e.g. from CMS dashboard)
  /**
   * Optional URL to a small JSON manifest that describes the latest bundle
   * (for ZIP+manifest mode, e.g. large/social apps).
   */
  manifestUrl?: string;
  checkFrequency?: 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';  // default: 'ON_APP_START'
  installMode?: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';  // default: 'ON_NEXT_RESTART'
  minimumBackgroundDuration?: number;  // default: 0 (seconds in background before resume check)
}
```
(SDK sends `bundleId` automatically from the device; it is not in config.)

## Minimum API (core surface)

- **Config:** `serverUrl`, `deploymentKeyIOS`, `deploymentKeyAndroid` (optional: `installMode`, `checkFrequency`).
- **React:** `CodePushProvider` + `useCodePush()` (or class-based `CustomCodePush`).
- **Call:** `checkForUpdate()`, then `syncUpdate()` (or `downloadUpdate` + `installUpdate`), and `getBundleUrl()` for the bundle to load.
- **Get:** `getCurrentPackage()` / `getUpdateMetadata()`, and recovery via `rollback()`.

## Bundle loading

Use **`getBundleUrl()`** from `useCodePush()` or `CustomCodePush.getBundleUrl()` for the OTA bundle path. The SDK stores updates under a hash-based path; **`BundleManager.installBundle(sourcePath)`** copies the active bundle to `CustomCodePush/current.bundle` so native can load it on next launch.

To load that file at app start you must configure the **native JS bundle entrypoint** (Bare workflow or Expo custom dev client). The following config is based on the working example in this repo (`example/AppDelegate.swift`, `example/MainApplication.kt`).

### Native config (iOS)

Use a delegate that overrides `bundleURL()` and prefers `CustomCodePush/current.bundle` when it exists and is not empty (so you can test OTA in Debug too):

```swift
override func bundleURL() -> URL? {
  let fileManager = FileManager.default
  let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
  let customBundleURL = documentsDirectory.appendingPathComponent("CustomCodePush/current.bundle")

  var isDirectory: ObjCBool = false
  let exists = fileManager.fileExists(atPath: customBundleURL.path, isDirectory: &isDirectory)
  let isNotEmpty = (try? fileManager.attributesOfItem(atPath: customBundleURL.path)[.size] as? Int64 ?? 0) ?? 0 > 0

  if exists && !isDirectory.boolValue && isNotEmpty {
    return customBundleURL
  }

#if DEBUG
  return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
  return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
}
```

(With Expo, implement this in your `ExpoReactNativeFactoryDelegate` subclass and return it from `sourceURL(for:)` as `bridge.bundleURL ?? bundleURL()`.)

### Native config (Android)

In your `ReactNativeHost`, override `getJSBundleFile()` and optionally `getUseDeveloperSupport()` so a valid OTA bundle is used even in debug:

```kotlin
override fun getJSBundleFile(): String? {
  val file = File(applicationContext.filesDir, "CustomCodePush/current.bundle")
  return if (file.exists() && file.length() > 0) file.absolutePath else super.getJSBundleFile()
}

override fun getUseDeveloperSupport(): Boolean {
  val file = File(applicationContext.filesDir, "CustomCodePush/current.bundle")
  val exists = file.exists() && file.length() > 0
  return if (exists) false else BuildConfig.DEBUG
}
```

### After download + install

Copy the installed update to `current.bundle` so the native entrypoint loads it on next launch:

```ts
import { BundleManager } from 'react-native-codepush-sdk';

// After installUpdate(localPackage)
await BundleManager.installBundle(localPackage.localPath);
```

See the `example/` app for full iOS and Android setup.

## API Reference

### Core exports

- `CodePushProvider` – React context provider; wrap your app (or root screen) with it.
- `useCodePush` – Hook to access update state and actions (must be used inside `CodePushProvider`).
- `CustomCodePush` – Class for non-React or manual integration.
- Types: `CodePushConfiguration`, `UpdatePackage`, `LocalPackage`, `SyncStatus`, plus `types/codepush` (`CodePushUpdate`, `CodePushDeployment`, `CodePushSyncStatus`, `UpdateHistory`, etc.).

### Optional exports

- `UpdateChecker` – UI component for update prompts and actions.
- `BundleManager` – Utility for custom bundle paths (prefer `getBundleUrl()` for OTA).
- `useFrameworkReady` – Hook for framework/engine ready (e.g. Hermes).

### CustomCodePush

- `initialize()`: Promise that resolves when SDK is ready (directories + stored package loaded).
- `checkForUpdate()`: Returns `UpdatePackage | null`.
- `downloadUpdate(update, progressCallback?)`: Returns `Promise<LocalPackage>`.
- `installUpdate(localPackage)`: Install a downloaded update.
- `sync(statusCallback?, progressCallback?)`: Check, download, and install in one flow.
- `getCurrentPackage()`: Current installed package or null.
- `getBundleUrl()`: URL/path to load the current bundle (e.g. for custom loaders).
- `rollback()`: Rollback to the previous version.
- `clearUpdates()`: Clear all downloaded updates.

### CodePushProvider

- **config** (`CodePushConfiguration`): Required.
- **autoCheck** (boolean, default `true`): Run a check on mount.
- **checkOnResume** (boolean, default `true`): Run a check when app comes to foreground.

### useCodePush()

Returns: `codePush`, `currentUpdate`, `availableUpdate`, `syncStatus`, `isChecking`, `isDownloading`, `isInstalling`, `checkForUpdate`, `syncUpdate`, `rollback`, `clearUpdates`, `getBundleUrl`.


## Update package format

The server serves a **ZIP** (with `index.bundle`, optional `assets/`, `metadata.json`) or a single **JS file**. Details and metadata layout: `src/api/server-example.md`.

## Development and example app

- **Example app**: `example/` uses this SDK; run with `cd example && npm start`. Point `serverUrl` at your own backend (e.g. dashboard on Vercel).
- **Test script**: `node test-update-check.js` (with your backend running on the URL and port used in the script).

## Security

- Prefer **HTTPS** for the update server.
- Validate **deployment keys** and apply **rate limiting** on the server.
- Consider **signed packages** and automatic **rollback** on failed installs.

## Troubleshooting

- **Network errors**: Confirm `serverUrl` and device connectivity (and ATS/cleartext if using HTTP).
- **Permission errors**: Ensure storage permissions (e.g. Android manifest) are set.
- **Bundle/install failures**: Check package format, integrity, and free space.

## License

MIT – see [LICENSE](LICENSE).

## Links

- **[CodePush Portal (Dashboard)](https://codepush.hyper-mind.dev/)** — manage deployments and view update status
- [Repository](https://github.com/picassio/RN-CodePush) · [Issues](https://github.com/picassio/RN-CodePush/issues)