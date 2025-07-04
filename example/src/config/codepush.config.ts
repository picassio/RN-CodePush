import { CodePushConfiguration } from '../../src/sdk/CustomCodePush';

export const codePushConfig: CodePushConfiguration = {
  // Replace with your actual server URL
  serverUrl: 'http://localhost:3000', // Mock server for testing
  
  // Replace with your actual deployment key
  deploymentKey: 'demo-deployment-key-12345',
  
  // Current app version
  appVersion: '1.0.0',
  
  // When to check for updates
  checkFrequency: 'ON_APP_START',
  
  // When to install updates
  installMode: 'ON_NEXT_RESTART',
  
  // Minimum time in background before checking (in seconds)
  minimumBackgroundDuration: 0,
};

// Alternative configurations for different environments
export const developmentConfig: CodePushConfiguration = {
  ...codePushConfig,
  serverUrl: 'http://localhost:3000',
  deploymentKey: 'dev-deployment-key',
  checkFrequency: 'MANUAL', // Manual checks in development
};

export const productionConfig: CodePushConfiguration = {
  ...codePushConfig,
  serverUrl: 'https://your-production-server.com',
  deploymentKey: 'prod-deployment-key',
  checkFrequency: 'ON_APP_START',
  installMode: 'ON_NEXT_RESTART',
};