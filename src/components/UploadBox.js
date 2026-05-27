import React from 'react';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
} from 'react-native';

import {launchImageLibrary} from 'react-native-image-picker';

const UploadBox = ({
  label,
  onSelect,
  image,
}) => {

  const openGallery = async () => {

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (
      !result.didCancel &&
      result.assets?.length > 0
    ) {

      onSelect(result.assets[0]);

    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity
        style={styles.box}
        onPress={openGallery}>

        {image?.uri ? (

          <Image
            source={{uri: image.uri}}
            style={styles.image}
          />

        ) : (

          <Text style={styles.uploadText}>
            Upload Image
          </Text>

        )}

      </TouchableOpacity>

    </View>
  );
};

export default UploadBox;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  box: {
    height: 160,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },

  uploadText: {
    color: '#666',
    fontSize: 15,
  },

  image: {
    width: '100%',
    height: '100%',
  },
});