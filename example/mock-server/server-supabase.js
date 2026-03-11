const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Endpoints ---

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Check for updates (main endpoint for SDK)
app.post('/v1/public/codepush/update_check', async (req, res) => {
  const { deploymentKey, appVersion, packageHash, clientUniqueId, label } = req.body;
  console.log('POST /v1/public/codepush/update_check', req.body);
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
        blobUrl: release.bundle_url,
        uploadTime: release.released_at,
        releasedBy: release.created_by
      }
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ error: 'Failed to check for updates' });
  }
});

// Report download status
app.post('/v1/public/codepush/report_status/download', async (req, res) => {
  const { deploymentKey, label, clientUniqueId } = req.body;
  console.log('POST /v1/public/codepush/report_status/download', req.body);
  
  try {
    const { data: deployment, error: depError } = await supabase
      .from('codepush_application_deployments')
      .select('id')
      .eq('key', deploymentKey)
      .single();
    
    if (depError || !deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    // Log download status (optional - you can remove this if not needed)
    await supabase
      .from('codepush_download_logs')
      .insert({
        release_id: label, // or get actual release_id if needed
        device_id: clientUniqueId,
        status: 'downloaded',
        download_size: 0, // will be updated by actual download
        created_at: new Date().toISOString()
      });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting download status:', error);
    res.status(500).json({ error: 'Failed to report status' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CodePush Supabase Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Update check: POST http://localhost:${PORT}/v1/public/codepush/update_check`);
}); 