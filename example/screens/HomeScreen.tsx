import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCodePush } from 'react-native-codepush-sdk';
import StatusCard from '../components/StatusCard';
import DeploymentCard from '../components/DeploymentCard';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    checkForUpdate, 
    syncUpdate,
    isChecking,
    isDownloading,
    isInstalling,
    syncStatus, 
    currentUpdate,
    availableUpdate
  } = useCodePush();

  const handleCheckForUpdate = async () => {
    try {
      await checkForUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to check for updates');
    }
  };

  const handleForceUpdate = async () => {
    try {
      console.log('handleForceUpdate');
      await syncUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to force update');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <StatusCard
          status={isChecking || isDownloading || isInstalling ? 'updating' : availableUpdate ? 'update-available' : 'up-to-date'}
          title={isChecking ? 'Checking for Updates' : availableUpdate ? 'Update Available' : 'App is Up to Date'}
          description={isChecking ? 'Checking for new updates...' : availableUpdate ? `Version ${availableUpdate.appVersion} is available` : 'Your app is running the latest version'}
          onAction={availableUpdate ? handleForceUpdate : undefined}
          actionText={availableUpdate ? 'Install Update' : undefined}
          progress={syncStatus?.progress}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCheckForUpdate}
            disabled={isChecking || isDownloading || isInstalling}
          >
            <Text style={styles.buttonText}>
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleForceUpdate}
            disabled={isChecking || isDownloading || isInstalling || !availableUpdate}
          >
            <Text style={styles.buttonTextSecondary}>
              Install Update
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Text style={styles.buttonTextSecondary}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('UpdateHistory' as never)}
          >
            <Text style={styles.buttonTextSecondary}>
              Update History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('RuntimeBundle' as never)}
          >
            <Text style={styles.buttonTextSecondary}>
              Runtime Bundle
            </Text>
          </TouchableOpacity>
          
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
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default HomeScreen; 