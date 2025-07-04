import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen: React.FC = () => {
  const [autoCheck, setAutoCheck] = useState(true);
  const [checkOnResume, setCheckOnResume] = useState(true);
  const [installMode, setInstallMode] = useState<'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME'>('ON_NEXT_RESTART');
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const [deploymentKey, setDeploymentKey] = useState('demo-deployment-key-12345');

  const handleInstallModeChange = () => {
    const modes: Array<'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME'> = [
      'IMMEDIATE',
      'ON_NEXT_RESTART', 
      'ON_NEXT_RESUME'
    ];
    const labels = ['Install Immediately', 'Install on Restart', 'Install on Resume'];
    const currentIndex = modes.indexOf(installMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    
    Alert.alert(
      'Install Mode',
      `Changed to: ${labels[nextIndex]}`,
      [{ text: 'OK' }]
    );
    
    setInstallMode(modes[nextIndex]);
  };

  const getInstallModeLabel = () => {
    switch (installMode) {
      case 'IMMEDIATE': return 'Install Immediately';
      case 'ON_NEXT_RESTART': return 'Install on Restart';
      case 'ON_NEXT_RESUME': return 'Install on Resume';
    }
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your settings have been saved successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setAutoCheck(true);
            setCheckOnResume(true);
            setInstallMode('ON_NEXT_RESTART');
            setServerUrl('http://localhost:3000');
            setDeploymentKey('demo-deployment-key-12345');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Update Behavior Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Behavior</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto Check for Updates</Text>
                <Text style={styles.settingDescription}>
                  Automatically check for updates when app starts
                </Text>
              </View>
              <Switch
                value={autoCheck}
                onValueChange={setAutoCheck}
                trackColor={{ false: '#e9ecef', true: '#007bff' }}
                thumbColor={autoCheck ? '#ffffff' : '#6c757d'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Check on Resume</Text>
                <Text style={styles.settingDescription}>
                  Check for updates when app comes to foreground
                </Text>
              </View>
              <Switch
                value={checkOnResume}
                onValueChange={setCheckOnResume}
                trackColor={{ false: '#e9ecef', true: '#007bff' }}
                thumbColor={checkOnResume ? '#ffffff' : '#6c757d'}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.settingCard} onPress={handleInstallModeChange}>
            <Text style={styles.settingTitle}>Install Mode</Text>
            <Text style={styles.settingValue}>{getInstallModeLabel()}</Text>
            <Text style={styles.settingDescription}>
              When to apply downloaded updates
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Server URL</Text>
            <TextInput
              style={styles.textInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="Enter server URL"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.settingDescription}>
              Your custom CodePush server endpoint
            </Text>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Deployment Key</Text>
            <TextInput
              style={styles.textInput}
              value={deploymentKey}
              onChangeText={setDeploymentKey}
              placeholder="Enter deployment key"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
            />
            <Text style={styles.settingDescription}>
              Authentication key for your deployment
            </Text>
          </View>
        </View>

        {/* App Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SDK Version:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>React Native</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveSettings}
          >
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleResetSettings}
          >
            <Text style={[styles.buttonText, { color: '#6c757d' }]}>Reset to Default</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Note */}
        <View style={styles.demoNote}>
          <Text style={styles.demoNoteTitle}>Demo Note</Text>
          <Text style={styles.demoNoteText}>
            In a real app, these settings would be persisted and used to configure 
            the CodePush SDK. For this demo, changes are temporary.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007bff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#495057',
    marginTop: 8,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoNote: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  demoNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  demoNoteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
  },
});

export default SettingsScreen;