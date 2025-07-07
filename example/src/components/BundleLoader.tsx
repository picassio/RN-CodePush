import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
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
  const [bundleModule, setBundleModule] = useState<any>(null);

  // Whenever currentUpdate changes, load the bundle file
  useEffect(() => {
    loadBundle();
  }, [currentUpdate]);

  useEffect(() => {
    // Once the bundle code is loaded, evaluate it as a CommonJS module
    if (bundleContent) {
      try {
        const moduleObj: any = { exports: {} };
        // Wrap and execute bundle code
        new Function('module', 'exports', bundleContent)(moduleObj, moduleObj.exports);
        setBundleModule(moduleObj.exports);
        console.log('✅ Bundle module evaluated');
      } catch (err) {
        console.error('Failed to evaluate bundle module:', err);
        setBundleModule(null);
      }
    }
  }, [bundleContent]);

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
    // No update or still loading => render fallback children
    if (!bundleModule) {
      return children;
    }
    // Use the bundle's render output
    const info = bundleModule.getInfo?.();
    const output = bundleModule.render?.();
    return (
      <ScrollView style={styles.container}>
        {info?.title && <Text style={styles.title}>{info.title}</Text>}
        {info?.version && <Text style={styles.subtitle}>Version: {info.version}</Text>}
        {info?.description && <Text style={styles.description}>{info.description}</Text>}
        {Array.isArray(info?.features) && (
          <Text style={styles.bundleInfo}>Features: {info.features.join(', ')}</Text>
        )}
        <View style={styles.divider} />
        <Text style={styles.rawTitle}>Render Output:</Text>
        <Text style={styles.rawText}>{JSON.stringify(output, null, 2)}</Text>
      </ScrollView>
    );
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
  divider: {
      height: 1,
      backgroundColor: '#ccc',
      marginVertical: 16,
    },
    rawTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      color: '#333',
    },
    rawText: {
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 12,
      color: '#444',
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