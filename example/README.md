# CodePush SDK Example App

This is a simple React Native example app demonstrating how to use the Custom CodePush SDK.

## Features Demonstrated

- ✅ Check for updates manually and automatically
- ✅ Download and install updates with progress tracking
- ✅ Handle mandatory vs optional updates
- ✅ Rollback functionality
- ✅ Update history and status tracking
- ✅ Error handling and retry mechanisms

## Setup

1. **Install Dependencies**
```bash
cd example
npm install
```

2. **Configure Your Server**
Edit `src/config/codepush.config.ts` and update:
- `serverUrl`: Your custom CodePush server URL
- `deploymentKey`: Your deployment key
- `appVersion`: Your app version

3. **Run the App**
```bash
# iOS
npm run ios

# Android
npm run android
```

## Demo Scenarios

### 1. Basic Update Check
- Tap "Check for Updates" to manually check
- See status messages and progress indicators

### 2. Automatic Updates
- Enable auto-check in settings
- App will check for updates on start and resume

### 3. Mandatory Updates
- Server can mark updates as mandatory
- User cannot skip mandatory updates

### 4. Rollback Testing
- Install an update
- Use "Rollback" to revert to previous version

### 5. Error Handling
- Disconnect network during download
- See error states and retry options

## Mock Server

The example includes a mock server implementation for testing:

```bash
cd example/mock-server
npm install
npm start
```

This will start a local server at `http://localhost:3000` that simulates CodePush server responses.

## File Structure

```
example/
├── src/
│   ├── components/          # UI components
│   ├── config/             # Configuration files
│   ├── screens/            # App screens
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main app component
├── mock-server/            # Mock CodePush server
└── package.json
```

## Testing Updates

1. **Create Update Package**
   - Bundle your React Native app
   - Create a ZIP file with the bundle and assets
   - Upload to your server or use the mock server

2. **Test Update Flow**
   - Check for updates
   - Download and install
   - Verify new version is active

3. **Test Rollback**
   - Install an update
   - Trigger rollback
   - Verify previous version is restored