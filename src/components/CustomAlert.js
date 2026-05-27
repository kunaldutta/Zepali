import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../styles/globalStyles';

const CustomAlert = ({
  visible,
  title = "Alert",
  message = "Message",
  onOk,
  onCancel,   // optional
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            
            {/* ✅ SHOW ONLY IF EXISTS */}
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelBtn]}
                onPress={onCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.okBtn]}
              onPress={onOk}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: colors.primary,
  },
  cancelBtn: {
    backgroundColor: colors.cancelButtonColor,
  },
  okBtn: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    color: '#cedfe0',
    fontWeight: '600',
  },
  okText: {
    color: '#fff',
    fontWeight: '600',
  },
});