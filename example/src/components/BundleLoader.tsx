import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useCodePush } from 'react-native-codepush-sdk';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

interface BundleLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const BundleLoader: React.FC<BundleLoaderProps> = ({ children, fallback }) => {
  const { currentUpdate, getBundleUrl } = useCodePush();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bundleContent, setBundleContent] = useState<string | null>(null);

  useEffect(() => {
    loadBundle();
  }, [currentUpdate]);

  const loadBundle = async () => {
    if (!currentUpdate) {
      // No custom bundle, use original
      setBundleContent(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bundleUrl = getBundleUrl();
      if (!bundleUrl) {
        throw new Error('No bundle URL available');
      }

      // Extract file path from URL
      const bundlePath = bundleUrl.replace('file://', '');
      
      // Read the bundle content
      const content = await RNFS.readFile(bundlePath, 'utf8');
      setBundleContent(content);
      
      console.log('✅ Bundle loaded successfully:', bundlePath);
      
    } catch (err) {
      console.error('❌ Failed to load bundle:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const executeBundle = () => {
    if (!bundleContent) {
      return children; // Use original bundle
    }

    try {
      // In a real implementation, you would use a JavaScript engine
      // to execute the bundle content. For now, we'll show a demo
      console.log('🚀 Executing downloaded bundle...');
      
      // This is a placeholder for actual bundle execution
      // In practice, you would need to:
      // 1. Parse the bundle
      // 2. Execute it in a controlled environment
      // 3. Replace the current app content
      
      return (
        <View style={styles.container}>
          <Text style={styles.title}>🎉 Downloaded Bundle Executed!</Text>
          <Text style={styles.subtitle}>Version: {currentUpdate?.label}</Text>
          <Text style={styles.description}>{currentUpdate?.description}</Text>
          <Text style={styles.bundleInfo}>
            Bundle Size: {Math.round((bundleContent.length / 1024) * 100) / 100} KB
          </Text>
          <Text style={styles.note}>
            Note: This is a demo. In a real implementation, the bundle would replace the entire app content.
          </Text>
        </View>
      );
      
    } catch (err) {
      console.error('❌ Failed to execute bundle:', err);
      setError(err instanceof Error ? err.message : 'Bundle execution failed');
      return fallback || children;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading downloaded bundle...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Bundle Loading Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.fallbackText}>Using original bundle</Text>
        {children}
      </View>
    );
  }

  return executeBundle();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  bundleInfo: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 10,
  },
  fallbackText: {
    fontSize: 12,
    color: '#28a745',
    fontStyle: 'italic',
  },
});

export default BundleLoader; 