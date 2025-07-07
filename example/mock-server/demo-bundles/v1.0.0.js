
// Initial Demo Bundle v1.0.0
// This is the starting point of our demo

console.log('🚀 Initial Demo Bundle v1.0.0 loaded!');

const DemoApp = {
  version: '1.0.0',
  title: 'Initial Demo Bundle v1.0.0',
  description: 'This is the initial demo bundle with basic functionality',
  features: [
    'Basic demo functionality',
    'Version tracking',
    'Simple UI'
  ],
  
  getInfo() {
    return {
      version: this.version,
      title: this.title,
      description: this.description,
      features: this.features,
      timestamp: new Date().toISOString(),
      isInitial: true
    };
  },
  
  render() {
    return {
      type: 'initial-demo-bundle',
      version: this.version,
      content: 'This is the initial content from bundle v1.0.0',
      message: 'Welcome to the initial demo!'
    };
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoApp;
}