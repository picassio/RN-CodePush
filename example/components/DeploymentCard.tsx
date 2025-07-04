import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Calendar, Package } from 'lucide-react-native';
import { CodePushDeployment } from '@/types/codepush';

interface DeploymentCardProps {
  deployment: CodePushDeployment;
  onPress: () => void;
}

export default function DeploymentCard({ deployment, onPress }: DeploymentCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{deployment.name}</Text>
          <Text style={styles.key}>Key: {deployment.key.substring(0, 12)}...</Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>

      {deployment.package && (
        <View style={styles.packageInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {formatDate(deployment.package.timestamp)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Package size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              v{deployment.package.version} • {formatSize(deployment.package.packageSize)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: deployment.package ? '#ECFDF5' : '#F3F4F6' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: deployment.package ? '#10B981' : '#6B7280' }
          ]}>
            {deployment.package ? 'Active' : 'No Package'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  key: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  packageInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});