import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';

const CitySelectionModal = ({
  visible,
  onClose,
  cities,
  selected,
  type,
  onSelect,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      
      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
        }}
      >
        {/* Content */}
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: '#fff',
            margin: 20,
            borderRadius: 12,
            maxHeight: '60%',
          }}
        >
          {/* Header */}
          <View style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#eee'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              Select {type === 'source' ? 'Source' : 'Destination'}
            </Text>
          </View>

          {/* List */}
          <FlatList
            data={cities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selected === item.id;

              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: isSelected ? colors.safeAreaColor : '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    color: isSelected ? colors.primary : '#000'
                  }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CitySelectionModal;