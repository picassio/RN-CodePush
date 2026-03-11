# React Native CodePush SDK

A React Native SDK for over-the-air (OTA) updates with support for your own backend. Use it to ship JS and asset updates without going through the app stores.

- **Custom server**: Works with any server that implements the CodePush-style API.
- **Unified API**: Same API on iOS and Android (provider, hook, or class-based).
- **Optional demo**: See the `example/` app and `example/mock-server/` for a full setup.

## Features

- **Custom server** – Point to your own update server (see [Server API](#server-api)).
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

App version is read from the device via `react-native-device-info`; you only configure `serverUrl`, `deploymentKey`, and `appName`.

### Provider + component (recommended)

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { CodePushProvider, UpdateChecker } from 'react-native-codepush-sdk';

const config = {
  serverUrl: 'https://your-codepush-server.com',
  deploymentKey: 'your-deployment-key',
  appName: 'YourApp',
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
  appName: 'YourApp',
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

## Server API

The SDK calls these paths on your `serverUrl` (no trailing slash). In a typical dashboard setup (e.g. on Vercel), you would expose these as API routes:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/update_check` | Check for an available update |
| POST | `/api/v1/report_status/deploy` | Report install/deploy/rollback status |
| POST | `/api/v1/report_status/download` | Report download status |

**update_check** request body (example):

```json
{
  "deploymentKey": "your-deployment-key",
  "appVersion": "1.0.0",
  "packageHash": null,
  "clientUniqueId": "device-id",
  "label": null
}
```

**update_check** response when an update is available:

```json
{
  "updateInfo": {
    "packageHash": "abc123",
    "label": "v1.0.1",
    "appVersion": "1.0.0",
    "description": "Bug fixes",
    "isMandatory": false,
    "size": 1048576,
    "downloadUrl": "https://your-server.com/packages/abc123.zip",
    "rollout": 100,
    "isDisabled": false
  }
}
```

When no update is available, return `updateInfo.isAvailable: false` or omit `updateInfo`.

A full server example and request/response shapes are in `src/api/server-example.md`. Implement those routes in your dashboard/backend (for example, as Vercel/Next.js API routes).

## Configuration

```typescript
interface CodePushConfiguration {
  serverUrl: string;           // Base URL of your update server (no trailing slash)
  deploymentKey: string;       // Deployment key for this app/deployment
  appName: string;             // App name (e.g. for server-side routing)
  checkFrequency?: 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';  // default: 'ON_APP_START'
  installMode?: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';  // default: 'ON_NEXT_RESTART'
  minimumBackgroundDuration?: number;  // default: 0 (seconds in background before resume check)
}
```

## API Reference

### Exports

- `CodePushProvider` – React context provider; wrap your app (or root screen) with it.
- `useCodePush` – Hook to access update state and actions (must be used inside `CodePushProvider`).
- `CustomCodePush` – Class for non-React or manual integration.
- `UpdateChecker` – Optional UI component that shows update prompts.
- `BundleManager` – Utility for bundle path and loading.
- `codePushService` – Optional service layer (e.g. for deployment/history UIs).
- `useFrameworkReady` – Hook to wait for framework/engine ready before loading bundles.
- Types: `CodePushUpdate`, `CodePushDeployment`, `CodePushSyncStatus`, `CodePushConfiguration`, `UpdateHistory`, etc. (see `types/codepush.ts`).

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

The server should serve either:

- **ZIP** – Standard CodePush-style package:
  - `index.bundle` (main JS bundle), optional `index.bundle.map`, `assets/`, and `metadata.json`.
- **Single JS file** – For simple/demo setups the SDK can also use a direct `.js` URL (e.g. mock server demo bundles).

See `src/api/server-example.md` and `example/mock-server/` for package layout and metadata.

## Development and example app

- **Example app**: `example/` is a React Native app that uses this SDK; run it with `cd example && npm start` (and start the mock server for updates).
- **Mock server**: `example/mock-server/` implements the `/v1/public/codepush/*` endpoints (Supabase-backed). Use it to test update flow locally.
- **Test script**: From the repo root, run `node test-update-check.js` (with the mock server on port 3080) to hit the update-check endpoint.

```bash
# Terminal 1 – mock server
cd example/mock-server && npm start

# Terminal 2 – test update check
node test-update-check.js
```

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