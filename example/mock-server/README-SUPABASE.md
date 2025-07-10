# CodePush Mock Server with Supabase

This is an enhanced version of the mock server that uses Supabase as the database backend instead of in-memory storage.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the API settings

### 3. Create Environment File

Create a `.env` file in the `mock-server` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration
PORT=3000
```

### 4. Create Database Tables

Run these SQL commands in your Supabase SQL editor:

#### Deployments Table
```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_deployments_app_name ON deployments(app_name);
CREATE INDEX idx_deployments_key ON deployments(key);
```

#### Packages Table
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  app_version TEXT NOT NULL,
  description TEXT,
  is_disabled BOOLEAN DEFAULT FALSE,
  is_mandatory BOOLEAN DEFAULT FALSE,
  rollout INTEGER DEFAULT 100,
  download_url TEXT NOT NULL,
  size BIGINT,
  package_hash TEXT UNIQUE NOT NULL,
  blob_url TEXT,
  released_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_packages_deployment_id ON packages(deployment_id);
CREATE INDEX idx_packages_package_hash ON packages(package_hash);
CREATE INDEX idx_packages_created_at ON packages(created_at DESC);
```

#### Status Reports Table
```sql
CREATE TABLE status_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
  package_label TEXT,
  status TEXT NOT NULL,
  client_unique_id TEXT,
  report_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_status_reports_deployment_id ON status_reports(deployment_id);
CREATE INDEX idx_status_reports_created_at ON status_reports(created_at DESC);
```

### 5. Run the Server

```bash
# Run the original mock server (in-memory)
npm start

# Run the Supabase version
node server-supabase.js
```

## Features

### Database Integration
- **Deployments**: Stored in Supabase with proper relationships
- **Packages**: Linked to deployments with full metadata
- **Status Reports**: Track download and deployment status
- **Automatic Sample Data**: Server initializes with demo data

### API Endpoints

All endpoints work the same as the original mock server:

- `GET /v0.1/apps/:appName/deployments` - List deployments
- `GET /v0.1/apps/:appName/deployments/:deploymentName` - Get deployment details
- `POST /v0.1/public/codepush/update_check` - Check for updates
- `POST /v0.1/public/codepush/report_status/deploy` - Report deployment status
- `POST /v0.1/public/codepush/report_status/download` - Report download status
- `POST /v0.1/apps/:appName/deployments/:deploymentName/release` - Upload new package

### File Storage

Files are still stored locally in the `uploads/` directory. For production, consider:

1. **Supabase Storage**: Upload files to Supabase Storage buckets
2. **CDN**: Use a CDN for better performance
3. **Cloud Storage**: Use AWS S3, Google Cloud Storage, etc.

## Production Considerations

### Security
- Add authentication to API endpoints
- Use Row Level Security (RLS) in Supabase
- Validate file uploads
- Rate limiting

### Performance
- Add caching layer (Redis)
- Database connection pooling
- CDN for file delivery

### Monitoring
- Log all API calls
- Track deployment success rates
- Monitor file storage usage

## Migration from In-Memory

The server automatically creates sample data when first run. To migrate existing data:

1. Export data from your current system
2. Import into Supabase using the SQL editor
3. Update any hardcoded IDs to match your data

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your Supabase URL and anon key
2. **Table Not Found**: Make sure you've created the database tables
3. **Permission Error**: Check your Supabase RLS policies
4. **File Upload Error**: Ensure the uploads directory is writable

### Debug Mode

Add this to your `.env` file for detailed logging:
```env
DEBUG=true
``` 