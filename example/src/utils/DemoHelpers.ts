import { Alert } from 'react-native';

export class DemoHelpers {
  /**
   * Show information about demo limitations
   */
  static showDemoInfo() {
    Alert.alert(
      'Demo Information',
      'This is a demonstration of the Custom CodePush SDK.\n\n' +
      'Features:\n' +
      '• Mock server for testing\n' +
      '• Simulated update downloads\n' +
      '• Update installation flow\n' +
      '• Rollback functionality\n' +
      '• Settings configuration\n\n' +
      'For production use, replace the mock server with your actual CodePush server.',
      [{ text: 'Got it!' }]
    );
  }

  /**
   * Show setup instructions
   */
  static showSetupInstructions() {
    Alert.alert(
      'Setup Instructions',
      '1. Start the mock server:\n' +
      '   cd example/mock-server\n' +
      '   npm install && npm start\n\n' +
      '2. Configure your server URL in the app settings\n\n' +
      '3. Test the update flow:\n' +
      '   • Check for updates\n' +
      '   • Download and install\n' +
      '   • Try rollback functionality\n\n' +
      '4. Monitor server logs for debugging',
      [{ text: 'OK' }]
    );
  }

  /**
   * Validate server configuration
   */
  static async validateServerConfig(serverUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      }
      
      return false;
    } catch (error) {
      console.warn('Server validation failed:', error);
      return false;
    }
  }

  /**
   * Show server connection status
   */
  static async checkServerConnection(serverUrl: string) {
    const isConnected = await this.validateServerConfig(serverUrl);
    
    Alert.alert(
      'Server Connection',
      isConnected 
        ? '✅ Connected to mock server successfully!'
        : '❌ Cannot connect to server. Make sure the mock server is running.',
      [{ text: 'OK' }]
    );
  }

  /**
   * Generate mock update data for testing
   */
  static generateMockUpdate() {
    const versions = ['1.0.1', '1.0.2', '1.0.3', '1.1.0', '1.2.0'];
    const descriptions = [
      'Bug fixes and performance improvements',
      'New features and UI enhancements',
      'Security updates and stability fixes',
      'Major feature release with new functionality',
      'Critical bug fixes and optimizations',
    ];

    const randomVersion = versions[Math.floor(Math.random() * versions.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

    return {
      packageHash: 'mock_' + Date.now(),
      label: `v${randomVersion}`,
      appVersion: randomVersion,
      description: randomDescription,
      isMandatory: Math.random() > 0.7, // 30% chance of mandatory
      packageSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
      downloadUrl: `http://localhost:3000/downloads/mock_${Date.now()}.zip`,
      timestamp: Date.now(),
    };
  }

  /**
   * Format file sizes for display
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format timestamps for display
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Show update details in a formatted alert
   */
  static showUpdateDetails(update: any) {
    Alert.alert(
      `Update ${update.label}`,
      `Version: ${update.appVersion}\n` +
      `Size: ${this.formatBytes(update.packageSize)}\n` +
      `Type: ${update.isMandatory ? 'Mandatory' : 'Optional'}\n` +
      `Date: ${this.formatTimestamp(update.timestamp)}\n\n` +
      `Description:\n${update.description}`,
      [{ text: 'OK' }]
    );
  }

  /**
   * Simulate network delay for realistic testing
   */
  static async simulateNetworkDelay(min: number = 500, max: number = 2000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Log demo events for debugging
   */
  static logDemoEvent(event: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[DEMO ${timestamp}] ${event}`, data || '');
  }
}