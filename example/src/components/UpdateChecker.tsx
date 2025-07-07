import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCodePush } from 'react-native-codepush-sdk';

const UpdateChecker: React.FC = () => {
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

  // If an update is already installed, do not render the updater UI
  if (currentUpdate) {
    return null;
  }

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

  const handleRollback = () => {
    Alert.alert(
      'Rollback Update',
      'Are you sure you want to rollback to the previous version? This will restart the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rollback', style: 'destructive', onPress: rollback },
      ]
    );
  };

  const handleClearUpdates = () => {
    Alert.alert(
      'Clear Updates',
      'This will remove all downloaded updates and reset to the original app version.',
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Custom CodePush</Text>
        <Text style={styles.subtitle}>Over-the-Air Updates</Text>
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

      {/* Current Version Info */}
      {/* {currentUpdate && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Current Version</Text>
          <Text style={styles.infoText}>Label: {currentUpdate.label}</Text>
          <Text style={styles.infoText}>Version: {currentUpdate.appVersion}</Text>
          <Text style={styles.infoText}>Hash: {currentUpdate.packageHash.substring(0, 8)}...</Text>
          <Text style={styles.infoText}>Size: {formatBytes(currentUpdate.packageSize)}</Text>
          {currentUpdate.description && (
            <Text style={styles.infoDescription}>{currentUpdate.description}</Text>
          )}
        </View>
      )} */}

      {/* Available Update Info */}
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
            <Text style={styles.infoDescription}>{availableUpdate.description}</Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={checkForUpdate}
          disabled={isChecking}
        >
          <Text style={styles.buttonText}>Check for Updates</Text>
        </TouchableOpacity>

        {availableUpdate && (
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={syncUpdate}
            disabled={isDownloading || isInstalling}
          >
            <Text style={styles.buttonText}>
              {availableUpdate.isMandatory ? 'Install Now (Required)' : 'Install Update'}
            </Text>
          </TouchableOpacity>
        )}

        {currentUpdate && (
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleRollback}
            disabled={isDownloading || isInstalling}
          >
            <Text style={styles.buttonText}>Rollback</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  infoDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
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
});

export default UpdateChecker;