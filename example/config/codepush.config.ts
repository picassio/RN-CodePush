import { CodePushConfiguration } from '../types/codepush';

export const defaultConfig: CodePushConfiguration = {
  serverUrl: 'http://192.168.9.143:3080',
  deploymentKey: 'production-key-123',
  appName: 'CodePushDemo',
  checkFrequency: 'ON_APP_START',
  installMode: 'IMMEDIATE',
  minimumBackgroundDuration: 0
}; 