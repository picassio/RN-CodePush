import { CodePushConfig } from '../types/codepush';

export const defaultConfig: CodePushConfig = {
  serverUrl: 'http://localhost:3000',
  deploymentKey: 'production-key-123',
  appVersion: '1.0.0',
  autoDownload: true,
  autoInstall: true,
  checkFrequency: 'ON_APP_START',
  installMode: 'IMMEDIATE',
  rollbackRetryOptions: {
    delayInHours: 24,
    maxRetryAttempts: 3,
  },
  updateDialog: {
    title: 'Update Available',
    description: 'A new version of the app is available. Would you like to update now?',
    mandatoryUpdateMessage: 'An update is required to continue using the app.',
    updateButtonText: 'Update',
    postponeButtonText: 'Later',
  },
}; 