import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';

export default function AreaModal({
  visible,
  areas = [],
  onSelect,
  onSkip,
}) {
  const [searchText, setSearchText] = useState('');

  const filteredAreas = areas.filter(item =>
    (
      item.area_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.pincode?.toString().includes(searchText)
    )
  );

  const renderArea = ({ item }) => (
    <TouchableOpacity
      style={styles.areaButton}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.areaText}>
        {item.area_name}
      </Text>

      <Text style={styles.pincodeText}>
        {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>
            Select Area
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search area or pincode..."
            value={searchText}
            onChangeText={setSearchText}
          />

          <FlatList
            data={filteredAreas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderArea}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No area found
              </Text>
            }
          />

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipText}>
              Close
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '70%',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  areaButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  areaText: {
    fontSize: 16,
    fontWeight: '500',
  },

  pincodeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },

  skipButton: {
    marginTop: 15,
    backgroundColor: '#4f6ae1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  skipText: {
    color: '#fff',
    fontWeight: '600',
  },
});