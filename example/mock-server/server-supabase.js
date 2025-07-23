const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { supabase } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration (not used for Supabase Storage, but kept for compatibility)
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

// --- API Endpoints ---

// Get deployments for an application (by application_id)
app.get('/v1/apps/:appId/deployments', async (req, res) => {
  const { appId } = req.params;
  try {
    const { data, error } = await supabase
      .from('codepush_application_deployments')
      .select('*')
      .eq('application_id', appId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get deployment by name (for an application)
app.get('/v1/apps/:appId/deployments/:deploymentName', async (req, res) => {
  const { appId, deploymentName } = req.params;
  try {
    const { data, error } = await supabase
      .from('codepush_application_deployments')
      .select('*')
      .eq('application_id', appId)
      .eq('name', deploymentName)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Deployment not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check for updates (main endpoint for SDK)
app.post('/v1/public/codepush/update_check', async (req, res) => {
  const { deploymentKey, appVersion, packageHash, clientUniqueId, label } = req.body;
  console.log('POST /v0.1/public/codepush/update_check', req.body);
  try {
    // 1. Find deployment by key
    const { data: deployment, error: depError } = await supabase
      .from('codepush_application_deployments')
      .select('id')
      .eq('key', deploymentKey)
      .single();
    if (depError || !deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    // 2. Find latest enabled release for deployment
    const { data: release, error: relError } = await supabase
      .from('codepush_releases')
      .select('*')
      .eq('application_deployment_id', deployment.id)
      .eq('is_disabled', false)
      .order('released_at', { ascending: false })
      .limit(1)
      .single();
    if (relError || !release) {
      return res.json({ updateInfo: null });
    }
    // 3. If packageHash matches, no update needed
    if (packageHash && release.bundle_hash && packageHash === release.bundle_hash) {
      return res.json({ updateInfo: null });
    }
    // 4. Return update info in old mock server format (camelCase)
    res.json({
      updateInfo: {
        id: release.id,
        label: release.label,
        appVersion: release.app_version,
        description: release.description,
        isDisabled: release.is_disabled,
        isMandatory: release.is_mandatory,
        rollout: release.rollout_percentage,
        downloadUrl: release.bundle_url,
        size: release.bundle_size,
        packageHash: release.bundle_hash,
        blobUrl: release.bundle_url, // or another field if you have a separate blob URL
        uploadTime: release.released_at,
        releasedBy: release.created_by // or null if not available
      }
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ error: 'Failed to check for updates' });
  }
});

// Report status
app.post('/v1/public/codepush/report_status/deploy', async (req, res) => {
  const { deploymentKey, label, status, clientUniqueId } = req.body;
  console.log('POST /v0.1/public/codepush/report_status/deploy', req.body);
  
  try {
    const deployment = await supabase
      .from('codepush_application_deployments')
      .select('id')
      .eq('key', deploymentKey)
      .single();
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    await supabase
      .from('codepush_status_reports')
      .insert({
        deployment_id: deployment.id,
        package_label: label,
        status: status,
        client_unique_id: clientUniqueId,
        report_type: 'deploy'
      });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting deploy status:', error);
    res.status(500).json({ error: 'Failed to report status' });
  }
});

app.post('/v1/public/codepush/report_status/download', async (req, res) => {
  const { deploymentKey, label, clientUniqueId } = req.body;
  console.log('POST /v0.1/public/codepush/report_status/download', req.body);
  
  try {
    const deployment = await supabase
      .from('codepush_application_deployments')
      .select('id')
      .eq('key', deploymentKey)
      .single();
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    await supabase
      .from('codepush_status_reports')
      .insert({
        deployment_id: deployment.id,
        package_label: label,
        status: 'downloaded',
        client_unique_id: clientUniqueId,
        report_type: 'download'
      });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting download status:', error);
    res.status(500).json({ error: 'Failed to report status' });
  }
});

// Upload package
app.post('/v1/apps/:appName/deployments/:deploymentName/release', upload.single('package'), async (req, res) => {
  const { appName, deploymentName } = req.params;
  const { label, description, mandatory, rollout } = req.body;
  const file = req.file;
  
  console.log(`POST /v0.1/apps/${appName}/deployments/${deploymentName}/release`);
  console.log('Body:', req.body);
  console.log('File:', file);
  
  if (!file) {
    return res.status(400).json({ error: 'Package file is required' });
  }
  
  try {
    const deployment = await supabase
      .from('codepush_application_deployments')
      .select('id')
      .eq('name', deploymentName)
      .single();
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    const newPackage = {
      id: uuidv4(),
      deployment_id: deployment.id,
      label: label || `v${Date.now()}`,
      app_version: '1.0.0',
      description: description || 'No description provided',
      is_disabled: false,
      is_mandatory: mandatory === 'true',
      rollout: parseInt(rollout) || 100,
      download_url: `/uploads/${file.filename}`,
      size: file.size,
      package_hash: uuidv4(),
      blob_url: `/uploads/${file.filename}`,
      released_by: 'developer@example.com'
    };
    
    const { data, error } = await supabase
      .from('codepush_packages')
      .insert(newPackage)
      .select()
      .single();

    if (error) {
      console.error('Error creating package:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve demo bundles
app.use('/demo-bundles', express.static(path.join(__dirname, 'demo-bundles')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server (no DB/sample data initialization)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CodePush Supabase Server running on port ${PORT}`);
}); 