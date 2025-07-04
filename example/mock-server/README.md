# CodePush Mock Server

A simple Express.js server that simulates CodePush server responses for testing the custom CodePush SDK.

## Features

- ✅ Update check endpoint with configurable availability
- ✅ Installation reporting
- ✅ Rollback tracking
- ✅ Mock package downloads
- ✅ Admin endpoints for testing
- ✅ Request logging for debugging

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **For development with auto-reload:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Core CodePush API

#### Check for Updates
```
POST /api/v1/updates/check
```

**Request:**
```json
{
  "deploymentKey": "demo-deployment-key-12345",
  "appVersion": "1.0.0",
  "packageHash": "current-hash-or-null"
}
```

**Response (Update Available):**
```json
{
  "updateInfo": {
    "isAvailable": true,
    "packageHash": "abc123def456",
    "label": "v1.0.1",
    "appVersion": "1.0.0",
    "description": "Bug fixes and improvements",
    "isMandatory": false,
    "packageSize": 2048576,
    "downloadUrl": "http://localhost:3000/downloads/abc123def456.zip"
  }
}
```

#### Report Installation
```
POST /api/v1/updates/report
```

#### Report Rollback
```
POST /api/v1/updates/rollback
```

#### Download Package
```
GET /downloads/:packageHash.zip
```

### Bonus Endpoints

#### Health Check
```
GET /health
```

#### Get Deployment Info
```
GET /api/v1/deployments/:key
```

#### Get Update History
```
GET /api/v1/updates/history/:deploymentKey
```

### Admin Endpoints

#### Trigger Update
```
POST /admin/trigger-update
```

Force an update to be available for testing:

```bash
curl -X POST http://localhost:3000/admin/trigger-update \
  -H "Content-Type: application/json" \
  -d '{"deploymentKey": "demo-deployment-key-12345"}'
```

## Configuration

### Update Availability

By default, the server has a 30% chance of returning an available update. You can modify this in `server.js`:

```javascript
// Change this function to control update availability
const hasUpdateAvailable = () => Math.random() > 0.7; // 30% chance
```

### Mock Deployments

Add or modify deployments in the `deployments` object:

```javascript
let deployments = {
  'your-deployment-key': {
    name: 'Your Deployment',
    key: 'your-deployment-key',
    currentPackage: {
      // ... package info
    }
  }
};
```

## Testing Scenarios

### 1. Basic Update Flow
```bash
# Check for update
curl -X POST http://localhost:3000/api/v1/updates/check \
  -H "Content-Type: application/json" \
  -d '{"deploymentKey": "demo-deployment-key-12345", "appVersion": "1.0.0"}'

# Download package (if update available)
curl -O http://localhost:3000/downloads/abc123def456.zip

# Report installation
curl -X POST http://localhost:3000/api/v1/updates/report \
  -H "Content-Type: application/json" \
  -d '{"deploymentKey": "demo-deployment-key-12345", "packageHash": "abc123def456", "status": "INSTALLED"}'
```

### 2. Force Update for Testing
```bash
# Trigger an update
curl -X POST http://localhost:3000/admin/trigger-update \
  -H "Content-Type: application/json" \
  -d '{"deploymentKey": "demo-deployment-key-12345"}'

# Then check for updates in your app
```

### 3. Monitor Server Activity
```bash
# Check server health and stats
curl http://localhost:3000/health

# View update history
curl http://localhost:3000/api/v1/updates/history/demo-deployment-key-12345
```

## Logs

The server logs all requests for debugging:

```
📱 Update check request: { deploymentKey: 'demo-deployment-key-12345', ... }
✅ No update available
📦 Download request for package: abc123def456
✅ Package abc123def456 downloaded
📊 Installation report: { status: 'INSTALLED', ... }
```

## Production Notes

This is a **mock server for testing only**. For production use:

1. Implement proper authentication and authorization
2. Add database persistence for deployments and history
3. Implement actual file storage and serving
4. Add rate limiting and security measures
5. Use HTTPS and proper SSL certificates
6. Add comprehensive error handling and validation
7. Implement package signing and verification

## Troubleshooting

### Port Already in Use
If port 3000 is busy, change the PORT in `server.js`:

```javascript
const PORT = 3001; // or any available port
```

### CORS Issues
The server includes CORS middleware. If you have issues, check the CORS configuration.

### Network Connectivity
Make sure your React Native app can reach the server:
- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Physical Device: Use your computer's IP address