import React from 'react';

import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


const SelectionModal = ({
  visible,
  title,
  data,
  onSelect,
  onClose,
}) => {
  const capitalizeFirstLetter = str => {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide">

      <View style={styles.modalContainer}>

        <View style={styles.modalContent}>

          <Text style={styles.modalTitle}>
            {title}
          </Text>

          <FlatList
            data={data}
            keyExtractor={(item, index) =>
              index.toString()
            }
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => onSelect(item)}>

                <Text style={styles.optionText}>
                  {capitalizeFirstLetter(item)}
                </Text>

              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}>

            <Text style={styles.closeText}>
              Close
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    </Modal>
  );
};

export default SelectionModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '70%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  optionText: {
    fontSize: 16,
    color: '#111',
  },

  closeBtn: {
    backgroundColor: '#DC2626',
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  closeText: {
    color: '#fff',
    fontWeight: '700',
  },
});