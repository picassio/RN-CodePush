import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCodePush } from '../../src/sdk/CodePushProvider';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    currentUpdate,
    availableUpdate,
    syncStatus,
    isChecking,
    isDownloading,
    isInstalling,
    checkForUpdate,
    syncUpdate,
    rollback,
    clearUpdates,
  } = useCodePush();

  const [updateHistory, setUpdateHistory] = useState<any[]>([]);

  const getStatusMessage = () => {
    if (isChecking) return 'Checking for updates...';
    if (isDownloading) return 'Downloading update...';
    if (isInstalling) return 'Installing update...';
    if (availableUpdate) return 'Update available!';
    return 'App is up to date';
  };

  const getStatusColor = () => {
    if (isChecking || isDownloading || isInstalling) return '#007bff';
    if (availableUpdate) return '#ffc107';
    return '#28a745';
  };

  const handleCheckForUpdates = async () => {
    try {
      await checkForUpdate();
      Alert.alert(
        'Update Check Complete',
        availableUpdate ? 'New update available!' : 'No updates available'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check for updates');
    }
  };

  const handleInstallUpdate = async () => {
    if (!availableUpdate) return;

    Alert.alert(
      'Install Update',
      `Install ${availableUpdate.label}?\n\n${availableUpdate.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: availableUpdate.isMandatory ? 'Install Now' : 'Install', 
          onPress: syncUpdate 
        },
      ]
    );
  };

  const handleRollback = () => {
    Alert.alert(
      'Rollback Update',
      'This will revert to the previous version and restart the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rollback', style: 'destructive', onPress: rollback },
      ]
    );
  };

  const handleClearUpdates = () => {
    Alert.alert(
      'Clear All Updates',
      'This will remove all downloaded updates.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearUpdates },
      ]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CodePush Demo</Text>
          <Text style={styles.subtitle}>Over-the-Air Updates Example</Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusMessage()}
            </Text>
            {(isChecking || isDownloading || isInstalling) && (
              <ActivityIndicator size="small" color={getStatusColor()} />
            )}
          </View>

          {syncStatus?.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${syncStatus.progress}%`,
                      backgroundColor: getStatusColor(),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(syncStatus.progress)}%</Text>
            </View>
          )}
        </View>

        {/* Current Version */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Current Version</Text>
          {currentUpdate ? (
            <>
              <Text style={styles.infoText}>Label: {currentUpdate.label}</Text>
              <Text style={styles.infoText}>Version: {currentUpdate.appVersion}</Text>
              <Text style={styles.infoText}>Hash: {currentUpdate.packageHash.substring(0, 8)}...</Text>
              <Text style={styles.infoText}>Size: {formatBytes(currentUpdate.packageSize)}</Text>
              {currentUpdate.description && (
                <Text style={styles.description}>{currentUpdate.description}</Text>
              )}
            </>
          ) : (
            <Text style={styles.infoText}>Original app bundle (no updates installed)</Text>
          )}
        </View>

        {/* Available Update */}
        {availableUpdate && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Available Update</Text>
            <Text style={styles.infoText}>Label: {availableUpdate.label}</Text>
            <Text style={styles.infoText}>Version: {availableUpdate.appVersion}</Text>
            <Text style={styles.infoText}>Size: {formatBytes(availableUpdate.packageSize)}</Text>
            <Text style={[
              styles.infoText,
              { color: availableUpdate.isMandatory ? '#dc3545' : '#28a745' }
            ]}>
              {availableUpdate.isMandatory ? 'Mandatory Update' : 'Optional Update'}
            </Text>
            {availableUpdate.description && (
              <Text style={styles.description}>{availableUpdate.description}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCheckForUpdates}
            disabled={isChecking}
          >
            <Text style={styles.buttonText}>
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </Text>
          </TouchableOpacity>

          {availableUpdate && (
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleInstallUpdate}
              disabled={isDownloading || isInstalling}
            >
              <Text style={styles.buttonText}>
                {isDownloading ? 'Downloading...' : 
                 isInstalling ? 'Installing...' :
                 availableUpdate.isMandatory ? 'Install Now (Required)' : 'Install Update'}
              </Text>
            </TouchableOpacity>
          )}

          {currentUpdate && (
            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPress={handleRollback}
              disabled={isDownloading || isInstalling}
            >
              <Text style={styles.buttonText}>Rollback to Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearUpdates}
            disabled={isDownloading || isInstalling}
          >
            <Text style={styles.buttonText}>Clear All Updates</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Text style={[styles.buttonText, { color: '#007bff' }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('UpdateHistory' as never)}
          >
            <Text style={[styles.buttonText, { color: '#007bff' }]}>Update History</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Instructions</Text>
          <Text style={styles.demoText}>
            1. Start the mock server: cd example/mock-server && npm start{'\n'}
            2. Tap "Check for Updates" to simulate checking{'\n'}
            3. Install updates to see the process{'\n'}
            4. Use rollback to revert changes{'\n'}
            5. Check settings for configuration options
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    minWidth: 40,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 20,
  },
  navContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderColor: '#007bff',
    flex: 0.48,
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});

export default HomeScreen;