const { supabase, TABLES } = require('./supabase');

class DatabaseService {
  // Deployment operations
  async getDeployments(appName) {
    const { data, error } = await supabase
      .from(TABLES.DEPLOYMENTS)
      .select('*')
      .eq('app_name', appName);
    
    if (error) {
      console.error('Error fetching deployments:', error);
      throw error;
    }
    
    return data || [];
  }

  async getDeployment(appName, deploymentName) {
    const { data, error } = await supabase
      .from(TABLES.DEPLOYMENTS)
      .select('*')
      .eq('app_name', appName)
      .eq('name', deploymentName)
      .single();
    
    if (error) {
      console.error('Error fetching deployment:', error);
      throw error;
    }
    
    return data;
  }

  async getDeploymentByKey(deploymentKey) {
    const { data, error } = await supabase
      .from(TABLES.DEPLOYMENTS)
      .select('*')
      .eq('key', deploymentKey)
      .single();
    
    if (error) {
      console.error('Error fetching deployment by key:', error);
      throw error;
    }
    
    return data;
  }

  async createDeployment(deployment) {
    const { data, error } = await supabase
      .from(TABLES.DEPLOYMENTS)
      .insert(deployment)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating deployment:', error);
      throw error;
    }
    
    return data;
  }

  // Package operations
  async getPackages(deploymentId) {
    const { data, error } = await supabase
      .from(TABLES.PACKAGES)
      .select('*')
      .eq('deployment_id', deploymentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
    
    return data || [];
  }

  async getLatestPackage(deploymentId) {
    const { data, error } = await supabase
      .from(TABLES.PACKAGES)
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('is_disabled', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching latest package:', error);
      return null;
    }
    
    return data;
  }

  async createPackage(packageData) {
    const { data, error } = await supabase
      .from(TABLES.PACKAGES)
      .insert(packageData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating package:', error);
      throw error;
    }
    
    return data;
  }

  async updatePackage(id, updates) {
    const { data, error } = await supabase
      .from(TABLES.PACKAGES)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating package:', error);
      throw error;
    }
    
    return data;
  }

  // Status report operations
  async createStatusReport(reportData) {
    const { data, error } = await supabase
      .from(TABLES.STATUS_REPORTS)
      .insert(reportData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating status report:', error);
      throw error;
    }
    
    return data;
  }

  // Initialize with sample data
  async initializeSampleData() {
    try {
      // Check if we already have deployments
      const { data: existingDeployments } = await supabase
        .from(TABLES.DEPLOYMENTS)
        .select('*')
        .limit(1);
      
      if (existingDeployments && existingDeployments.length > 0) {
        console.log('📋 Sample data already exists, skipping initialization');
        return;
      }

      console.log('📋 Creating sample deployments...');
      
      // Create sample deployments
      const productionDeployment = await this.createDeployment({
        id: 'production-deployment',
        app_name: 'demo-app',
        name: 'Production',
        key: 'production-key-123',
        description: 'Production deployment for demo app'
      });

      const stagingDeployment = await this.createDeployment({
        id: 'staging-deployment',
        app_name: 'demo-app',
        name: 'Staging',
        key: 'staging-key-456',
        description: 'Staging deployment for demo app'
      });

      console.log('📦 Creating sample packages...');
      
      // Create sample packages
      await this.createPackage({
        id: '1',
        deployment_id: productionDeployment.id,
        label: 'v1.0.1',
        app_version: '1.0.0',
        description: 'Demo bundle with basic functionality - Dynamic bundle loading, Version management, Hot updates',
        is_disabled: false,
        is_mandatory: false,
        rollout: 100,
        download_url: 'http://192.168.9.143:3000/demo-bundles/v1.0.1.js',
        size: 2048,
        package_hash: 'abc123def456',
        blob_url: 'http://192.168.9.143:3000/demo-bundles/v1.0.1.js',
        released_by: 'developer@example.com'
      });

      await this.createPackage({
        id: '2',
        deployment_id: productionDeployment.id,
        label: 'v1.0.2',
        app_version: '1.0.0',
        description: 'Enhanced demo bundle with advanced features - Enhanced UI, Performance improvements, Bug fixes',
        is_disabled: false,
        is_mandatory: true,
        rollout: 50,
        download_url: 'http://192.168.9.143:3000/demo-bundles/real-android.js',
        size: 3072,
        package_hash: 'def456ghi789',
        blob_url: 'http://192.168.9.143:3000/demo-bundles/real-android.js',
        released_by: 'developer@example.com'
      });

      console.log('✅ Sample data initialization complete');
    } catch (error) {
      console.error('❌ Sample data initialization failed:', error);
    }
  }
}

module.exports = new DatabaseService(); 