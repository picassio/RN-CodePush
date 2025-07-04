import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UpdateHistoryItem {
  id: string;
  version: string;
  label: string;
  timestamp: number;
  status: 'SUCCESS' | 'FAILED' | 'ROLLBACK';
  description: string;
  size: number;
}

const UpdateHistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<UpdateHistoryItem[]>([]);

  useEffect(() => {
    // Load mock history data
    const mockHistory: UpdateHistoryItem[] = [
      {
        id: '1',
        version: '1.0.3',
        label: 'v1.0.3',
        timestamp: Date.now() - 86400000, // 1 day ago
        status: 'SUCCESS',
        description: 'Bug fixes and performance improvements',
        size: 2048576,
      },
      {
        id: '2',
        version: '1.0.2',
        label: 'v1.0.2',
        timestamp: Date.now() - 172800000, // 2 days ago
        status: 'SUCCESS',
        description: 'New features and UI improvements',
        size: 3145728,
      },
      {
        id: '3',
        version: '1.0.1',
        label: 'v1.0.1',
        timestamp: Date.now() - 259200000, // 3 days ago
        status: 'ROLLBACK',
        description: 'Critical bug fix rollback',
        size: 1536000,
      },
      {
        id: '4',
        version: '1.0.0',
        label: 'v1.0.0',
        timestamp: Date.now() - 345600000, // 4 days ago
        status: 'FAILED',
        description: 'Initial release with authentication',
        size: 4194304,
      },
    ];

    setHistory(mockHistory);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return {
          color: '#28a745',
          backgroundColor: '#d4edda',
          text: 'Installed',
          icon: '✓',
        };
      case 'FAILED':
        return {
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          text: 'Failed',
          icon: '✗',
        };
      case 'ROLLBACK':
        return {
          color: '#ffc107',
          backgroundColor: '#fff3cd',
          text: 'Rolled Back',
          icon: '↶',
        };
      default:
        return {
          color: '#6c757d',
          backgroundColor: '#e9ecef',
          text: 'Unknown',
          icon: '?',
        };
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleItemPress = (item: UpdateHistoryItem) => {
    Alert.alert(
      `Update ${item.label}`,
      `Status: ${item.status}\nSize: ${formatBytes(item.size)}\nDate: ${formatDate(item.timestamp)}\n\nDescription:\n${item.description}`,
      [{ text: 'OK' }]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all update history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => setHistory([])
        },
      ]
    );
  };

  const getStats = () => {
    const successful = history.filter(item => item.status === 'SUCCESS').length;
    const failed = history.filter(item => item.status === 'FAILED').length;
    const rollbacks = history.filter(item => item.status === 'ROLLBACK').length;
    
    return { successful, failed, rollbacks };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.successful}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.rollbacks}</Text>
            <Text style={styles.statLabel}>Rollbacks</Text>
          </View>
        </View>

        {/* History List */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Update History</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Update History</Text>
              <Text style={styles.emptyDescription}>
                Update history will appear here once you start installing updates.
              </Text>
            </View>
          ) : (
            history.map((item) => {
              const config = getStatusConfig(item.status);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemLeft}>
                      <View style={[styles.statusIcon, { backgroundColor: config.backgroundColor }]}>
                        <Text style={[styles.statusIconText, { color: config.color }]}>
                          {config.icon}
                        </Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemVersion}>{item.label}</Text>
                        <Text style={styles.itemDate}>{formatDate(item.timestamp)}</Text>
                      </View>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={[styles.itemStatus, { color: config.color }]}>
                        {config.text}
                      </Text>
                      <Text style={styles.itemSize}>{formatBytes(item.size)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Demo Note */}
        <View style={styles.demoNote}>
          <Text style={styles.demoNoteTitle}>Demo Note</Text>
          <Text style={styles.demoNoteText}>
            This is mock data for demonstration. In a real app, this would show 
            actual update installation history from your CodePush deployments.
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  clearButton: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
  },
  historyItem: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    color: '#6c757d',
  },
  itemDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
  demoNote: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  demoNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 8,
  },
  demoNoteText: {
    fontSize: 14,
    color: '#004085',
    lineHeight: 18,
  },
});

export default UpdateHistoryScreen;