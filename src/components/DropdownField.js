import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const DropdownField = ({
  label,
  value,
  placeholder,
  onPress,
}) => {
  const capitalizeFirstLetter = str => {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
};
  return (
    <View style={styles.container}>

      <Text style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={onPress}>

        <Text
          style={[
            styles.dropdownText,
            !value && {
              color: '#999',
            },
          ]}>

          {capitalizeFirstLetter(value) || placeholder}

        </Text>

        <Ionicons
          name="chevron-down"
          size={22}
          color="#444"
        />

      </TouchableOpacity>

    </View>
  );
};

export default DropdownField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },

  dropdown: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownText: {
    fontSize: 15,
    color: '#111',
  },
});