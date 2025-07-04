import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { CodePushProvider } from './src/sdk/CodePushProvider';
import UpdateChecker from './src/components/UpdateChecker';

const App: React.FC = () => {
  const codePushConfig = {
    serverUrl: 'https://your-custom-codepush-server.com', // Replace with your server URL
    deploymentKey: 'your-deployment-key-here', // Replace with your deployment key
    appVersion: '1.0.0',
    checkFrequency: 'ON_APP_START' as const,
    installMode: 'ON_NEXT_RESTART' as const,
    minimumBackgroundDuration: 0,
  };

  return (
    <CodePushProvider config={codePushConfig} autoCheck={true} checkOnResume={true}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <UpdateChecker />
      </SafeAreaView>
    </CodePushProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default App;