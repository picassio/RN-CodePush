# Custom CodePush Server API

This document describes the API endpoints your custom CodePush server should implement.

## Base URL
```
https://your-custom-codepush-server.com
```

## Endpoints

### 1. Check for Updates
**POST** `/v1/public/codepush/update_check`

Check if there's an available update for the client.

**Request Body:**
```json
{
  "deploymentKey": "your-deployment-key",
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
**POST** `/v1/public/codepush/report_status/deploy`

Report the status of an update installation.

**Request Body:**
```json
{
  "deploymentKey": "your-deployment-key",
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
**POST** `/v1/public/codepush/report_status/download`

**Request Body:**
```json
{
  "deploymentKey": "your-deployment-key",
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

1. **Security**: Always validate deployment keys and implement rate limiting
2. **Rollout**: Support gradual rollouts by checking device ID against rollout percentage
3. **Caching**: Implement proper caching headers for download URLs
4. **Logging**: Log all update checks and installations for analytics
5. **Rollback**: Track failed installations and support automatic rollbacks
6. **Compression**: Use gzip compression for API responses
7. **CDN**: Use a CDN for serving update packages for better performance