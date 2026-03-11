import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BundleLoader from '../src/components/BundleLoader';

const RuntimeBundleScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <BundleLoader fallback={<Text style={styles.text}>Loading original demo...</Text>}>
        <Text style={styles.text}>Original demo content</Text>
      </BundleLoader>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});

export default RuntimeBundleScreen; 