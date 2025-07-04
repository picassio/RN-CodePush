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
import { StatusCard } from '../components/StatusCard';
import { DeploymentCard } from '../components/DeploymentCard';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    checkForUpdate, 
    syncInProgress, 
    updateInfo, 
    syncStatus, 
    downloadProgress,
    currentPackage 
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
      await checkForUpdate(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to force update');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <StatusCard
          syncStatus={syncStatus}
          syncInProgress={syncInProgress}
          downloadProgress={downloadProgress}
          updateInfo={updateInfo}
        />

        <DeploymentCard
          currentPackage={currentPackage}
          updateInfo={updateInfo}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCheckForUpdate}
            disabled={syncInProgress}
          >
            <Text style={styles.buttonText}>
              {syncInProgress ? 'Checking...' : 'Check for Updates'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleForceUpdate}
            disabled={syncInProgress}
          >
            <Text style={styles.buttonTextSecondary}>
              Force Update
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonTextSecondary}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('UpdateHistory')}
          >
            <Text style={styles.buttonTextSecondary}>
              Update History
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About CodePush Demo</Text>
          <Text style={styles.infoText}>
            This demo showcases the CodePush SDK functionality including:
          </Text>
          <Text style={styles.infoText}>• Automatic update checking</Text>
          <Text style={styles.infoText}>• Manual update triggers</Text>
          <Text style={styles.infoText}>• Update progress tracking</Text>
          <Text style={styles.infoText}>• Deployment management</Text>
          <Text style={styles.infoText}>• Update history</Text>
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