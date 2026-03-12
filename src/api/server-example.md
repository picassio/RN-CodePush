# Custom CodePush Server API

This document describes the API endpoints your custom CodePush server should implement.

## Base URL
```
https://your-custom-codepush-server.com
```

## Endpoints

### 1. Check for Updates
**POST** `/api/v1/update_check`

Check if there's an available update for the client.

**Request Body:** (SDK sends these; `bundleId` is read from the device automatically and cannot be overridden. Validate `deploymentKey` + `bundleId` on the server.)
```json
{
  "deploymentKey": "your-deployment-key",
  "bundleId": "com.example.myapp",
  "appVersion": "1.0.0",
  "packageHash": "current-package-hash-or-null",
  "clientUniqueId": "unique-device-id",
  "label": "current-label-or-null"
}
```

**Response (Update Available):**
```json
{
  "updateInfo": {
    "packageHash": "new-package-hash",
    "label": "v1.0.1",
    "appVersion": "1.0.0",
    "description": "Bug fixes and improvements",
    "isMandatory": false,
    "size": 1048576,
    "downloadUrl": "https://your-server.com/downloads/package-hash.zip",
    "rollout": 100,
    "isDisabled": false
  }
}
```

**Response (No Update):**
```json
{
  "updateInfo": null
}
```

### 2. Report Deploy / Installation
**POST** `/api/v1/report_status/deploy`

Report the status of an update installation.

**Request Body:**
```json
{
  "deploymentKey": "your-deployment-key",
  "bundleId": "com.example.myapp",
  "label": "v1.0.1",
  "status": "Deployed|Failed|Rollback",
  "clientUniqueId": "unique-device-id"
}
```

**Response:**
```json
{
  "success": true
}
```

### 3. Report Download
**POST** `/api/v1/report_status/download`

**Request Body:**
```json
{
  "deploymentKey": "your-deployment-key",
  "bundleId": "com.example.myapp",
  "label": "v1.0.1",
  "clientUniqueId": "unique-device-id"
}
```

**Response:**
```json
{
  "success": true
}
```

## Package Structure

The downloadable update package should be a ZIP file containing:

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

**metadata.json example:**
```json
{
  "packageHash": "abc123def456",
  "label": "v1.0.1",
  "appVersion": "1.0.0",
  "description": "Bug fixes and improvements",
  "isMandatory": false,
  "packageSize": 1048576,
  "timestamp": 1640995200000
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters",
  "details": "Missing required field: deploymentKey"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid deployment key"
}
```

**404 Not Found:**
```json
{
  "error": "Deployment not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

## Implementation Notes

1. **Validation**: Validate `deploymentKey` and `bundleId` together (the deployment must be associated with that app bundle). Reject requests with an invalid or mismatched pair.
2. **Security**: Implement rate limiting and use HTTPS.
3. **Rollout**: Support gradual rollouts by checking device ID against rollout percentage.
4. **Caching**: Implement proper caching headers for download URLs.
5. **Logging**: Log all update checks and installations for analytics.
6. **Rollback**: Track failed installations and support automatic rollbacks.
7. **Compression**: Use gzip compression for API responses.
8. **CDN**: Use a CDN for serving update packages for better performance.