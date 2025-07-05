import { CodePushConfiguration } from 'react-native-codepush-sdk';

export const defaultConfig: CodePushConfiguration = {
  serverUrl: 'http://192.168.0.103:3000',
  deploymentKey: 'production-key-123',
  // appVersion: '1.0.0',
  // autoDownload: true,
  // autoInstall: true,
  checkFrequency: 'ON_APP_START',
  installMode: 'IMMEDIATE',
  appName: 'CodePushDemo',
  minimumBackgroundDuration: 0
}; 