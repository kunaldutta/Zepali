import React from 'react';
import { Modal, TouchableOpacity, View, Text } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { colors } from '../styles/globalStyles';

const ImageZoomModal = ({ visible, images, index = 0, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* ✅ CLOSE BUTTON */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 10,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 24 }}>
            ✕
          </Text>
        </TouchableOpacity>

        {/* ✅ IMAGE VIEWER */}
        <ImageViewer
          imageUrls={images}
          index={index}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          onCancel={onClose}
          saveToLocalByLongPress={false}
          backgroundColor={colors.background}

         
          renderIndicator={(currentIndex, allSize) => (
            <View
              style={{
                position: 'absolute',
                top: 40,
                alignSelf: 'center',
                backgroundColor: colors.primary,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14 }}>
                {currentIndex} / {allSize}
              </Text>
            </View>
          )}
        />

      </View>
    </Modal>
  );
};

export default ImageZoomModal;