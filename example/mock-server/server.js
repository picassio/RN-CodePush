const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock data
let deployments = {
  'demo-deployment-key-12345': {
    name: 'Demo Deployment',
    key: 'demo-deployment-key-12345',
    currentPackage: {
      packageHash: 'abc123def456',
      label: 'v1.0.1',
      appVersion: '1.0.0',
      description: 'Bug fixes and performance improvements',
      isMandatory: false,
      packageSize: 2048576,
      downloadUrl: 'http://localhost:3000/downloads/abc123def456.zip',
      timestamp: Date.now() - 86400000,
    }
  }
};

let updateHistory = [];
let rollbackHistory = [];

// Simulate update availability (70% chance of no update)
const hasUpdateAvailable = () => Math.random() > 0.7;

// API Routes

// Check for updates
app.post('/api/v1/updates/check', (req, res) => {
  console.log('📱 Update check request:', req.body);
  
  const { deploymentKey, appVersion, packageHash } = req.body;
  
  if (!deploymentKey) {
    return res.status(400).json({
      error: 'Missing deployment key'
    });
  }

  const deployment = deployments[deploymentKey];
  if (!deployment) {
    return res.status(404).json({
      error: 'Deployment not found'
    });
  }

  // Simulate update availability
  if (!hasUpdateAvailable() || packageHash === deployment.currentPackage.packageHash) {
    console.log('✅ No update available');
    return res.json({
      updateInfo: {
        isAvailable: false
      }
    });
  }

  // Return available update
  console.log('🆕 Update available:', deployment.currentPackage.label);
  res.json({
    updateInfo: {
      isAvailable: true,
      ...deployment.currentPackage
    }
  });
});

// Report installation status
app.post('/api/v1/updates/report', (req, res) => {
  console.log('📊 Installation report:', req.body);
  
  const { deploymentKey, packageHash, label, status, timestamp } = req.body;
  
  // Store in history
  updateHistory.push({
    id: Date.now().toString(),
    deploymentKey,
    packageHash,
    label,
    status,
    timestamp: timestamp || Date.now(),
    ...req.body
  });

  console.log(`✅ Installation ${status.toLowerCase()}: ${label}`);
  
  res.json({
    success: true
  });
});

// Report rollback
app.post('/api/v1/updates/rollback', (req, res) => {
  console.log('🔄 Rollback report:', req.body);
  
  const { deploymentKey, packageHash, timestamp } = req.body;
  
  // Store in rollback history
  rollbackHistory.push({
    id: Date.now().toString(),
    deploymentKey,
    packageHash,
    timestamp: timestamp || Date.now(),
    ...req.body
  });

  console.log('✅ Rollback recorded');
  
  res.json({
    success: true
  });
});

// Get deployment info (bonus endpoint)
app.get('/api/v1/deployments/:key', (req, res) => {
  const { key } = req.params;
  const deployment = deployments[key];
  
  if (!deployment) {
    return res.status(404).json({
      error: 'Deployment not found'
    });
  }

  res.json(deployment);
});

// Get update history (bonus endpoint)
app.get('/api/v1/updates/history/:deploymentKey', (req, res) => {
  const { deploymentKey } = req.params;
  const history = updateHistory.filter(item => item.deploymentKey === deploymentKey);
  
  res.json({
    history: history.slice(-20) // Return last 20 items
  });
});

// Serve mock update packages
app.get('/downloads/:packageHash.zip', (req, res) => {
  const { packageHash } = req.params;
  
  console.log(`📦 Download request for package: ${packageHash}`);
  
  // Create a mock ZIP file response
  // In a real server, this would serve actual update packages
  const mockZipContent = Buffer.from('Mock update package content');
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Length', mockZipContent.length);
  res.setHeader('Content-Disposition', `attachment; filename="${packageHash}.zip"`);
  
  // Simulate download delay
  setTimeout(() => {
    res.send(mockZipContent);
    console.log(`✅ Package ${packageHash} downloaded`);
  }, 1000);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployments: Object.keys(deployments).length,
    updateHistory: updateHistory.length,
    rollbackHistory: rollbackHistory.length
  });
});

// Admin endpoints for testing
app.post('/admin/trigger-update', (req, res) => {
  const { deploymentKey } = req.body;
  
  if (deployments[deploymentKey]) {
    // Create a new update
    const newPackage = {
      packageHash: 'new' + Date.now(),
      label: `v1.0.${Math.floor(Math.random() * 100)}`,
      appVersion: '1.0.0',
      description: 'Test update triggered manually',
      isMandatory: Math.random() > 0.7, // 30% chance of mandatory
      packageSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
      downloadUrl: `http://localhost:3000/downloads/new${Date.now()}.zip`,
      timestamp: Date.now(),
    };
    
    deployments[deploymentKey].currentPackage = newPackage;
    
    console.log('🚀 Manual update triggered:', newPackage.label);
    
    res.json({
      success: true,
      update: newPackage
    });
  } else {
    res.status(404).json({
      error: 'Deployment not found'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CodePush Mock Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Admin trigger: POST http://localhost:${PORT}/admin/trigger-update`);
  console.log('');
  console.log('Available deployments:');
  Object.values(deployments).forEach(deployment => {
    console.log(`  - ${deployment.name} (${deployment.key})`);
  });
  console.log('');
  console.log('Ready to serve CodePush requests! 📱');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down CodePush Mock Server...');
  process.exit(0);
});