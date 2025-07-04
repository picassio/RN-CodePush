const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Mock deployments database
let deployments = {
  'Production': {
    id: 'production-deployment',
    name: 'Production',
    key: 'production-key-123',
    packages: []
  },
  'Staging': {
    id: 'staging-deployment',
    name: 'Staging',
    key: 'staging-key-456',
    packages: []
  }
};

// Mock update packages
let updatePackages = [
  {
    id: '1',
    label: 'v1.0.1',
    appVersion: '1.0.0',
    description: 'Bug fixes and performance improvements',
    isDisabled: false,
    isMandatory: false,
    rollout: 100,
    downloadUrl: 'https://example.com/updates/v1.0.1.zip',
    size: 1024000,
    packageHash: 'abc123def456',
    blobUrl: 'https://example.com/blobs/abc123def456',
    uploadTime: new Date().toISOString(),
    releasedBy: 'developer@example.com'
  },
  {
    id: '2',
    label: 'v1.0.2',
    appVersion: '1.0.0',
    description: 'New features and UI improvements',
    isDisabled: false,
    isMandatory: true,
    rollout: 50,
    downloadUrl: 'https://example.com/updates/v1.0.2.zip',
    size: 2048000,
    packageHash: 'def456ghi789',
    blobUrl: 'https://example.com/blobs/def456ghi789',
    uploadTime: new Date().toISOString(),
    releasedBy: 'developer@example.com'
  }
];

// Routes

// Get deployments
app.get('/v0.1/apps/:appName/deployments', (req, res) => {
  const { appName } = req.params;
  console.log(`GET /v0.1/apps/${appName}/deployments`);
  
  res.json(Object.values(deployments));
});

// Get deployment by name
app.get('/v0.1/apps/:appName/deployments/:deploymentName', (req, res) => {
  const { appName, deploymentName } = req.params;
  console.log(`GET /v0.1/apps/${appName}/deployments/${deploymentName}`);
  
  const deployment = deployments[deploymentName];
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  res.json(deployment);
});

// Check for updates
app.post('/v0.1/public/codepush/update_check', (req, res) => {
  const { deploymentKey, appVersion, packageHash, clientUniqueId, label } = req.body;
  console.log('POST /v0.1/public/codepush/update_check', req.body);
  
  // Find deployment by key
  const deployment = Object.values(deployments).find(d => d.key === deploymentKey);
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  // Simulate update logic
  const latestUpdate = updatePackages[updatePackages.length - 1];
  
  if (packageHash === latestUpdate.packageHash) {
    // No update needed
    return res.json({ updateInfo: null });
  }
  
  // Return update
  res.json({
    updateInfo: {
      ...latestUpdate,
      updateAppVersion: false,
      shouldRunBinaryVersion: false
    }
  });
});

// Report status
app.post('/v0.1/public/codepush/report_status/deploy', (req, res) => {
  const { deploymentKey, label, status, clientUniqueId } = req.body;
  console.log('POST /v0.1/public/codepush/report_status/deploy', req.body);
  
  res.json({ success: true });
});

app.post('/v0.1/public/codepush/report_status/download', (req, res) => {
  const { deploymentKey, label, clientUniqueId } = req.body;
  console.log('POST /v0.1/public/codepush/report_status/download', req.body);
  
  res.json({ success: true });
});

// Upload package
app.post('/v0.1/apps/:appName/deployments/:deploymentName/release', upload.single('package'), (req, res) => {
  const { appName, deploymentName } = req.params;
  const { label, description, mandatory, rollout } = req.body;
  const file = req.file;
  
  console.log(`POST /v0.1/apps/${appName}/deployments/${deploymentName}/release`);
  console.log('Body:', req.body);
  console.log('File:', file);
  
  if (!file) {
    return res.status(400).json({ error: 'Package file is required' });
  }
  
  const deployment = deployments[deploymentName];
  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }
  
  const newPackage = {
    id: uuidv4(),
    label: label || `v${Date.now()}`,
    appVersion: '1.0.0',
    description: description || 'No description provided',
    isDisabled: false,
    isMandatory: mandatory === 'true',
    rollout: parseInt(rollout) || 100,
    downloadUrl: `/uploads/${file.filename}`,
    size: file.size,
    packageHash: uuidv4(),
    blobUrl: `/uploads/${file.filename}`,
    uploadTime: new Date().toISOString(),
    releasedBy: 'developer@example.com'
  };
  
  updatePackages.push(newPackage);
  deployment.packages.push(newPackage);
  
  res.json(newPackage);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CodePush Mock Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 