import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, X, RotateCcw, Calendar, Download } from 'lucide-react-native';
import { UpdateHistory } from '../../types/codepush';

interface HistoryItemProps {
  item: UpdateHistory;
}

export default function HistoryItem({ item }: HistoryItemProps) {
  const getStatusConfig = () => {
    switch (item.status) {
      case 'SUCCESS':
        return {
          icon: <Check size={20} color="#10B981" />,
          color: '#10B981',
          backgroundColor: '#ECFDF5',
          text: 'Installed'
        };
      case 'FAILED':
        return {
          icon: <X size={20} color="#EF4444" />,
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          text: 'Failed'
        };
      case 'ROLLBACK':
        return {
          icon: <RotateCcw size={20} color="#F59E0B" />,
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          text: 'Rolled Back'
        };
    }
  };

  const config = getStatusConfig();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusIcon, { backgroundColor: config.backgroundColor }]}>
          {config.icon}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.version}>v{item.version}</Text>
            <Text style={[styles.status, { color: config.color }]}>
              {config.text}
            </Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.metaText}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Download size={14} color="#6B7280" />
          <Text style={styles.metaText}>{formatSize(item.downloadSize)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  status: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 4,
  },
});