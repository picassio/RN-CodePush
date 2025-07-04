# Custom React Native CodePush SDK

A comprehensive custom implementation of CodePush for React Native applications, providing over-the-air updates with your own server infrastructure.

## Features

### 🚀 Core Functionality
- **Custom Server Integration**: Connect to your own CodePush server
- **Over-the-Air Updates**: Download and install app updates without app store releases
- **Rollback Support**: Automatically rollback failed updates
- **Progress Tracking**: Real-time download and installation progress
- **Mandatory Updates**: Support for required updates that users cannot skip

### 📱 Platform Support
- **iOS**: Full native integration
- **Android**: Complete Android support
- **Cross-Platform**: Unified API for both platforms

### 🔧 Advanced Features
- **Gradual Rollouts**: Support for percentage-based rollouts
- **Update Validation**: Verify update integrity before installation
- **Offline Support**: Handle updates when network is unavailable
- **Background Downloads**: Download updates in the background
- **Custom Install Modes**: Immediate, on restart, or on resume installation

## Installation

### 1. Install Dependencies

```bash
npm install react-native-fs react-native-zip-archive react-native-device-info @react-native-async-storage/async-storage
```

### 2. Platform Setup

#### iOS Setup
1. Run `cd ios && pod install`
2. Add the following to your `Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

#### Android Setup
1. Add permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Usage

### Basic Setup

```tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { CodePushProvider } from './src/sdk/CodePushProvider';
import UpdateChecker from './src/components/UpdateChecker';

const App: React.FC = () => {
  const codePushConfig = {
    serverUrl: 'https://your-custom-codepush-server.com',
    deploymentKey: 'your-deployment-key-here',
    appVersion: '1.0.0',
    checkFrequency: 'ON_APP_START',
    installMode: 'ON_NEXT_RESTART',
  };

  return (
    <CodePushProvider config={codePushConfig} autoCheck={true}>
      <SafeAreaView style={{ flex: 1 }}>
        <UpdateChecker />
      </SafeAreaView>
    </CodePushProvider>
  );
};

export default App;
```

### Using the Hook

```tsx
import { useCodePush } from './src/sdk/CodePushProvider';

const MyComponent = () => {
  const {
    availableUpdate,
    isChecking,
    checkForUpdate,
    syncUpdate,
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
};
```

### Manual Integration

```tsx
import CustomCodePush from './src/sdk/CustomCodePush';

const codePush = new CustomCodePush({
  serverUrl: 'https://your-server.com',
  deploymentKey: 'your-key',
  appVersion: '1.0.0',
});

// Check for updates
const update = await codePush.checkForUpdate();

// Download and install
if (update) {
  const localPackage = await codePush.downloadUpdate(update, (progress) => {
    console.log(`Download progress: ${progress.receivedBytes}/${progress.totalBytes}`);
  });
  
  await codePush.installUpdate(localPackage);
}
```

## Server Implementation

Your custom CodePush server needs to implement these endpoints:

### Check for Updates
```
POST /api/v1/updates/check
```

### Report Installation
```
POST /api/v1/updates/report
```

### Report Rollback
```
POST /api/v1/updates/rollback
```

See `src/api/server-example.md` for detailed API documentation.

## Configuration Options

```typescript
interface CodePushConfiguration {
  serverUrl: string;                    // Your server URL
  deploymentKey: string;                // Deployment key for authentication
  appVersion: string;                   // Current app version
  checkFrequency?: 'ON_APP_START' |     // When to check for updates
                   'ON_APP_RESUME' | 
                   'MANUAL';
  installMode?: 'IMMEDIATE' |           // When to install updates
                'ON_NEXT_RESTART' | 
                'ON_NEXT_RESUME';
  minimumBackgroundDuration?: number;   // Minimum background time before checking
}
```

## API Reference

### CustomCodePush Class

#### Methods

- `checkForUpdate()`: Check if an update is available
- `downloadUpdate(update, progressCallback)`: Download an update package
- `installUpdate(localPackage)`: Install a downloaded update
- `sync(options, statusCallback, progressCallback)`: Complete sync process
- `getCurrentPackage()`: Get current installed package info
- `rollback()`: Rollback to previous version
- `clearUpdates()`: Clear all downloaded updates

### CodePushProvider Component

#### Props

- `config`: CodePush configuration object
- `autoCheck`: Automatically check for updates on app start
- `checkOnResume`: Check for updates when app resumes

### useCodePush Hook

#### Returns

- `codePush`: CustomCodePush instance
- `currentUpdate`: Currently installed update info
- `availableUpdate`: Available update info
- `syncStatus`: Current sync status
- `isChecking`: Whether checking for updates
- `isDownloading`: Whether downloading an update
- `isInstalling`: Whether installing an update
- `checkForUpdate()`: Function to check for updates
- `syncUpdate()`: Function to sync and install updates
- `rollback()`: Function to rollback updates
- `clearUpdates()`: Function to clear all updates

## Update Package Format

Update packages should be ZIP files with this structure:

```
package.zip
├── index.bundle          # Main JavaScript bundle
├── index.bundle.map      # Source map (optional)
├── assets/              # Static assets
│   ├── images/
│   ├── fonts/
│   └── ...
└── metadata.json        # Package metadata
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS for your server
2. **Authentication**: Validate deployment keys on server
3. **Package Signing**: Consider signing update packages
4. **Rate Limiting**: Implement rate limiting on your server
5. **Rollback Protection**: Implement automatic rollback for failed updates

## Troubleshooting

### Common Issues

1. **Network Errors**: Check server URL and network connectivity
2. **Permission Errors**: Ensure file system permissions are granted
3. **Bundle Errors**: Verify update package format and integrity
4. **Installation Failures**: Check available storage space

### Debug Mode

Enable debug logging by setting:

```typescript
// Add to your configuration
const config = {
  // ... other config
  debug: true,
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the server API documentation
- Create an issue in the repository