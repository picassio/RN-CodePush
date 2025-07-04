import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useCodePush } from '../src/sdk/CodePushProvider';

const SettingsScreen: React.FC = () => {
  const { config, updateConfig } = useCodePush();

  const handleToggleAutoDownload = () => {
    updateConfig({
      ...config,
      autoDownload: !config.autoDownload,
    });
  };

  const handleToggleAutoInstall = () => {
    updateConfig({
      ...config,
      autoInstall: !config.autoInstall,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Download</Text>
            <Switch
              value={config.autoDownload}
              onValueChange={handleToggleAutoDownload}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Install</Text>
            <Switch
              value={config.autoInstall}
              onValueChange={handleToggleAutoInstall}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Server URL:</Text>
            <Text style={styles.configValue}>{config.serverUrl}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Deployment Key:</Text>
            <Text style={styles.configValue}>{config.deploymentKey}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>App Version:</Text>
            <Text style={styles.configValue}>{config.appVersion}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  configRow: {
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  configValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
});

export default SettingsScreen; 