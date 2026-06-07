import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { colors } from '../../styles/globalStyles';

const ForceUpdateScreen = ({ route }) => {
  const versionData = route?.params?.versionData || {};

  const openStore = () => {
    if (versionData.storeUrl) {
      Linking.openURL(versionData.storeUrl);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Update Required
      </Text>

      <Text style={styles.message}>
        {versionData.updateMessage ||
          'Please update the app to continue.'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={openStore}>
        <Text style={styles.buttonText}>
          Update Now
        </Text>
      </TouchableOpacity>
    <Text style={styles.versionText}>
        Latest Version: {versionData.latestVersion}
      </Text>
      <Text style={styles.versionText}>
        Current Version: {versionData.currentVersion}
      </Text>

    </View>
  );
};

export default ForceUpdateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  button: {
    height: 50,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  versionText: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
});