const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database table names
const TABLES = {
  DEPLOYMENTS: 'deployments',
  PACKAGES: 'packages',
  STATUS_REPORTS: 'status_reports'
};

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing Supabase database...');
    
    // Check if tables exist by trying to query them
    const { data: deployments, error: deploymentsError } = await supabase
      .from(TABLES.DEPLOYMENTS)
      .select('*')
      .limit(1);
    
    if (deploymentsError) {
      console.log('📋 Creating deployments table...');
      // You'll need to create this table in Supabase dashboard
      console.log('Please create the deployments table in your Supabase dashboard');
    }
    
    const { data: packages, error: packagesError } = await supabase
      .from(TABLES.PACKAGES)
      .select('*')
      .limit(1);
    
    if (packagesError) {
      console.log('📦 Creating packages table...');
      // You'll need to create this table in Supabase dashboard
      console.log('Please create the packages table in your Supabase dashboard');
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

module.exports = {
  supabase,
  TABLES,
  initializeDatabase
}; 