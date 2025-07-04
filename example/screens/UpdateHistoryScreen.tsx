import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useCodePush } from '../src/sdk/CodePushProvider';
import HistoryItem from '../components/HistoryItem';

const UpdateHistoryScreen: React.FC = () => {
  const { updateHistory } = useCodePush();

  const renderHistoryItem = ({ item }: { item: any }) => (
    <HistoryItem item={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Update History</Text>
        <Text style={styles.subtitle}>
          {updateHistory.length} update{updateHistory.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {updateHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No updates yet</Text>
          <Text style={styles.emptySubtext}>
            Updates will appear here as they are installed
          </Text>
        </View>
      ) : (
        <FlatList
          data={updateHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
});

export default UpdateHistoryScreen; 