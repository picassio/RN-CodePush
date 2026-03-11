import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, CircleAlert as AlertCircle, Clock, Download } from 'lucide-react-native';

interface StatusCardProps {
  status: 'up-to-date' | 'update-available' | 'updating' | 'error';
  title: string;
  description: string;
  onAction?: () => void;
  actionText?: string;
  progress?: number;
}

export default function StatusCard({ 
  status, 
  title, 
  description, 
  onAction, 
  actionText,
  progress 
}: StatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'up-to-date':
        return {
          icon: <Check size={24} color="#10B981" />,
          color: '#10B981',
          backgroundColor: '#ECFDF5',
          borderColor: '#D1FAE5'
        };
      case 'update-available':
        return {
          icon: <Download size={24} color="#F59E0B" />,
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA'
        };
      case 'updating':
        return {
          icon: <Clock size={24} color="#3B82F6" />,
          color: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#DBEAFE'
        };
      case 'error':
        return {
          icon: <AlertCircle size={24} color="#EF4444" />,
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { 
      backgroundColor: config.backgroundColor,
      borderColor: config.borderColor 
    }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {config.icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.color }]}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: config.color 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}

      {onAction && actionText && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: config.color }]}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    width: 40,
    textAlign: 'right',
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});