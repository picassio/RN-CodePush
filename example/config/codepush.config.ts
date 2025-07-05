import { CodePushConfiguration } from '../types/codepush';

export const defaultConfig: CodePushConfiguration = {
  serverUrl: 'http://192.168.0.103:3000',
  deploymentKey: 'production-key-123',
  appName: 'CodePushDemo',
  checkFrequency: 'ON_APP_START',
  installMode: 'IMMEDIATE',
  minimumBackgroundDuration: 0
}; 