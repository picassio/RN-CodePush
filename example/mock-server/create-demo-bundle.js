const fs = require('fs');
const path = require('path');

// Create demo bundles directory
const bundlesDir = path.join(__dirname, 'demo-bundles');
if (!fs.existsSync(bundlesDir)) {
  fs.mkdirSync(bundlesDir, { recursive: true });
}

// Demo bundle 1: Simple welcome message
const demoBundle1 = `
// Demo Bundle v1.0.1
// This is a simulated JavaScript bundle that would be executed

console.log('🎉 Demo Bundle v1.0.1 loaded successfully!');

const DemoApp = {
  version: '1.0.1',
  title: 'Welcome to Demo Bundle v1.0.1',
  description: 'This is a demo bundle with basic functionality',
  features: [
    'Dynamic bundle loading',
    'Version management',
    'Hot updates'
  ],
  
  getInfo() {
    return {
      version: this.version,
      title: this.title,
      description: this.description,
      features: this.features,
      timestamp: new Date().toISOString()
    };
  },
  
  render() {
    return {
      type: 'demo-bundle',
      version: this.version,
      content: 'This is the content from downloaded bundle v1.0.1'
    };
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoApp;
}
`;

// Demo bundle 2: Enhanced version
const demoBundle2 = `
// Demo Bundle v1.0.2
// Enhanced version with more features

console.log('🚀 Demo Bundle v1.0.2 loaded successfully!');

const DemoApp = {
  version: '1.0.2',
  title: 'Enhanced Demo Bundle v1.0.2',
  description: 'This is an enhanced demo bundle with advanced features',
  features: [
    'Dynamic bundle loading',
    'Version management',
    'Hot updates',
    'Enhanced UI',
    'Performance improvements',
    'Bug fixes'
  ],
  
  getInfo() {
    return {
      version: this.version,
      title: this.title,
      description: this.description,
      features: this.features,
      timestamp: new Date().toISOString(),
      isEnhanced: true
    };
  },
  
  render() {
    return {
      type: 'enhanced-demo-bundle',
      version: this.version,
      content: 'This is the enhanced content from downloaded bundle v1.0.2',
      features: this.features
    };
  },
  
  // New method in v1.0.2
  getStats() {
    return {
      bundleSize: '2.1 KB',
      loadTime: '150ms',
      performance: 'excellent'
    };
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoApp;
}
`;

// Write demo bundles
fs.writeFileSync(path.join(bundlesDir, 'v1.0.1.js'), demoBundle1);
fs.writeFileSync(path.join(bundlesDir, 'v1.0.2.js'), demoBundle2);

console.log('✅ Demo bundles created successfully!');
console.log('📁 Location:', bundlesDir);
console.log('📦 Bundles:');
console.log('  - v1.0.1.js (Basic demo)');
console.log('  - v1.0.2.js (Enhanced demo)'); 