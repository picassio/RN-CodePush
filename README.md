# React Native CodePush SDK

A React Native SDK for over-the-air (OTA) updates with support for your own backend. Use it to ship JS and asset updates without going through the app stores.

- **Custom server**: Works with any server that implements the CodePush-style API.
- **Unified API**: Same API on iOS and Android (provider, hook, or class-based).
- **Optional demo**: See the `example/` app for a full setup.

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
npm install react-native-fs react-native-zip-archive react-native-device-info @react-native-async-storage/async-storage
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

App version is read from the device via `react-native-device-info`; you only configure `serverUrl` and `deploymentKey`.

### Provider + component (recommended)

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { CodePushProvider, UpdateChecker } from 'react-native-codepush-sdk';

const config = {
  serverUrl: 'https://your-codepush-server.com',
  deploymentKey: 'your-deployment-key',
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
  deploymentKey: 'your-key',
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

**You configure:** `serverUrl`, `deploymentKey` (and optionally `installMode`, `checkFrequency`). The SDK automatically sends `bundleId` (from the device; not configurable) with every API request for backend validation.

**You call:** `checkForUpdate()`, `syncUpdate()`, `rollback()`, `clearUpdates()`, `getBundleUrl()` (from `useCodePush()` or `CustomCodePush`).

**You receive:** `availableUpdate` (when an update exists), `currentUpdate` (currently installed), `syncStatus`, `isChecking`, `isDownloading`, `isInstalling`. The SDK handles the rest (network calls, install, reporting) internally.

---

## Backend (for server implementers)

Your server must expose these routes under `serverUrl` (e.g. on Vercel): `POST /api/v1/update_check`, `POST /api/v1/report_status/deploy`, `POST /api/v1/report_status/download`. The SDK calls them automatically. Request and response formats are documented in `src/api/server-example.md`.

## Configuration

```typescript
interface CodePushConfiguration {
  serverUrl: string;           // Base URL of your update server (no trailing slash)
  deploymentKey: string;       // Deployment key for this app/deployment
  checkFrequency?: 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';  // default: 'ON_APP_START'
  installMode?: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';  // default: 'ON_NEXT_RESTART'
  minimumBackgroundDuration?: number;  // default: 0 (seconds in background before resume check)
}
```
(SDK sends `bundleId` automatically from the device; it is not in config.)

## Minimum API (core surface)

- **Config:** `serverUrl`, `deploymentKey` (optional: `installMode`, `checkFrequency`).
- **React:** `CodePushProvider` + `useCodePush()` (or class-based `CustomCodePush`).
- **Call:** `checkForUpdate()`, then `syncUpdate()` (or `downloadUpdate` + `installUpdate`), and `getBundleUrl()` for the bundle to load.
- **Get:** `getCurrentPackage()` / `getUpdateMetadata()`, and recovery via `rollback()`.

## Bundle loading

Use **`getBundleUrl()`** from `useCodePush()` or `CustomCodePush.getBundleUrl()` as the single source of truth for the OTA bundle path (e.g. `file://.../index.bundle`). `BundleManager` is an optional utility for custom setups.

### Expo / native entrypoint configuration (Bare / custom dev client)

If you are using **Expo managed** (no native iOS/Android projects), you typically cannot swap the JS bundle entrypoint at runtime, so installing an update won't change the running code.

To load a downloaded bundle at app start you need a **native entrypoint** that checks for a local file and uses it as the JS bundle. This requires **Bare workflow** or an **Expo custom dev client**.

This SDK includes `BundleManager.installBundle(sourcePath)` which copies the installed update's `index.bundle` to:

- iOS/Android path: `DocumentDirectory/CustomCodePush/current.bundle`

Then configure native entrypoints to load that file when it exists.

#### iOS (Swift)

In your `AppDelegate`, override the bundle URL:

```swift
override func bundleURL() -> URL? {
#if DEBUG
  return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
  let fileManager = FileManager.default
  let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
  let customBundleURL = documentsDirectory.appendingPathComponent("CustomCodePush/current.bundle")

  if fileManager.fileExists(atPath: customBundleURL.path) {
    return customBundleURL
  }
  return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
}
```

#### Android (Kotlin)

In your `ReactNativeHost`, override `getJSBundleFile()`:

```kotlin
override fun getJSBundleFile(): String? {
  val file = File(applicationContext.filesDir, "CustomCodePush/current.bundle")
  return if (file.exists()) file.absolutePath else super.getJSBundleFile()
}
```

#### After download + install

If you use the `current.bundle` native entrypoint above, make sure your app copies the bundle there after install:

```ts
import { BundleManager } from 'react-native-codepush-sdk';

// After installUpdate(localPackage)
await BundleManager.installBundle(localPackage.localPath);
```

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

- [Repository](https://github.com/picassio/RN-CodePush) · [Issues](https://github.com/picassio/RN-CodePush/issues)