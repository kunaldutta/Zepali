import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import { post } from '../network/apiService';
import API from '../network/apiEndpoints';

export default function CityModal({
  visible,
  onSelect,
  onSkip,
  showSkip = true,
}) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      setSearchText('');
      loadCities();
    }
  }, [visible]);

  const loadCities = async () => {
    try {
      setLoading(true);

      const response = await post(API.GET_PRODUCT_CITY);

      if (response.status) {
        setCities(response.cities || []);
      } else {
        setCities([]);
      }
    } catch (e) {
      console.log('CITY ERROR', e);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(item =>
    item.city_name
      ?.toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const renderCity = ({ item }) => (
    <TouchableOpacity
      style={styles.cityButton}
      onPress={() =>
        onSelect({
          id: item.id,
          city_name: item.city_name,
          state: item.state,
        })
      }
    >
      <Text style={styles.cityText}>
        {item.city_name}
      </Text>

      {!!item.state && (
        <Text style={styles.stateText}>
          {item.state}
        </Text>
      )}
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
            Select City
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search city..."
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCity}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No city found
                </Text>
              }
            />
          )}

          {showSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>
          )}

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

  cityButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  cityText: {
    fontSize: 16,
    fontWeight: '500',
  },

  stateText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
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