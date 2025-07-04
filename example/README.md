# CodePush Demo App

A complete React Native demo application showcasing the CodePush SDK functionality.

## Features

- 📱 React Native 0.74.4 with full Android & iOS support
- 🔄 CodePush SDK integration with custom implementation
- 🎯 Mock server for testing CodePush functionality
- 🧭 Navigation between demo screens
- ⚙️ Settings management
- 📊 Update history tracking
- 🔧 Configurable update behavior

## Project Structure

```
example/
├── android/                 # Android project files
├── ios/                     # iOS project files
├── src/
│   ├── sdk/                 # CodePush SDK implementation
│   │   ├── CodePushProvider.tsx
│   │   └── CustomCodePush.ts
│   ├── components/          # SDK components
│   │   └── UpdateChecker.tsx
│   ├── utils/               # Utility functions
│   └── api/                 # API helpers
├── components/              # Demo UI components
│   ├── StatusCard.tsx
│   ├── DeploymentCard.tsx
│   └── HistoryItem.tsx
├── screens/                 # Demo screens
│   ├── HomeScreen.tsx
│   ├── SettingsScreen.tsx
│   └── UpdateHistoryScreen.tsx
├── config/                  # Configuration files
│   └── codepush.config.ts
├── mock-server/             # Mock CodePush server
│   ├── server.js
│   └── package.json
├── hooks/                   # Custom React hooks
├── services/                # Service implementations
├── types/                   # TypeScript type definitions
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
cd example
npm install
```

### 2. Start the Mock Server

```bash
npm run mock-server
```

The mock server will run on `http://localhost:3000` and provide:
- Update checking endpoints
- Package upload/download
- Deployment management
- Status reporting

### 3. Run the Demo App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

## Demo Features

### Home Screen
- Check for updates manually
- Force update functionality
- View current deployment status
- Monitor update progress
- Access settings and history

### Settings Screen
- Toggle auto-download
- Toggle auto-install
- View current configuration
- Modify update behavior

### Update History Screen
- View all previous updates
- See update details and timestamps
- Track deployment history

## Configuration

The demo uses a configuration file at `config/codepush.config.ts`:

```typescript
export const defaultConfig: CodePushConfig = {
  serverUrl: 'http://localhost:3000',
  deploymentKey: 'production-key-123',
  appVersion: '1.0.0',
  autoDownload: true,
  autoInstall: true,
  checkFrequency: 'ON_APP_START',
  installMode: 'IMMEDIATE',
  // ... more options
};
```

## Mock Server API

The included mock server provides a complete CodePush-compatible API:

### Endpoints
- `GET /v0.1/apps/:appName/deployments` - List deployments
- `POST /v0.1/public/codepush/update_check` - Check for updates
- `POST /v0.1/public/codepush/report_status/deploy` - Report deployment status
- `POST /v0.1/apps/:appName/deployments/:deploymentName/release` - Upload updates

### Testing Updates
1. Start the mock server
2. Launch the demo app
3. Use "Check for Updates" to test the update flow
4. Monitor the console for API calls and responses

## Development

### Adding New Features
1. Extend the CodePush SDK in `src/sdk/`
2. Add new screens in `screens/`
3. Create UI components in `components/`
4. Update configuration in `config/`

### Customizing the Mock Server
Edit `mock-server/server.js` to:
- Add new endpoints
- Modify update logic
- Change deployment configurations
- Add authentication

## SDK Integration

The demo shows how to integrate the CodePush SDK:

```typescript
// In your app root
import { CodePushProvider } from './src/sdk/CodePushProvider';
import { defaultConfig } from './config/codepush.config';

function App() {
  return (
    <CodePushProvider config={defaultConfig}>
      {/* Your app content */}
    </CodePushProvider>
  );
}
```

```typescript
// In your components
import { useCodePush } from './src/sdk/CodePushProvider';

function MyComponent() {
  const { checkForUpdate, syncStatus, updateInfo } = useCodePush();
  
  const handleUpdate = async () => {
    await checkForUpdate();
  };
  
  return (
    // Your component JSX
  );
}
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **Android build issues**: Clean and rebuild with `cd android && ./gradlew clean`
3. **iOS build issues**: Clean derived data in Xcode
4. **Mock server not responding**: Check that port 3000 is available

### Debug Mode
Enable debug logging by setting `DEBUG=true` in your environment or configuration.

## Next Steps

1. **Production Setup**: Replace mock server with real CodePush service
2. **Authentication**: Add proper authentication to your CodePush server
3. **CI/CD Integration**: Automate update deployments
4. **Advanced Features**: Add rollback, A/B testing, and analytics

## License

This demo is provided as-is for educational and testing purposes.
