import React, { useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/globalStyles';

const ImageZoomModal = ({
  visible,
  images = [],
  index = 0,
  onClose,
}) => {

  const insets = useSafeAreaInsets();

  const [viewerIndex, setViewerIndex] = useState(null);

  const displayIndex =
    viewerIndex === null ? index : viewerIndex;

  const handleClose = () => {
    setViewerIndex(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>

        {/* =========================
            TOP SAFE AREA + HEADER
        ========================== */}

        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top,
              height: insets.top + 55,
            },
          ]}
        >

          {/* INDICATOR */}
          {images.length > 0 && (
            <View style={styles.indicator}>
              <Text style={styles.indicatorText}>
                {displayIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* CLOSE BUTTON */}
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            style={[
              styles.closeButton,
              {
                top: insets.top + 10,
              },
            ]}
          >
            <Ionicons
              name="close"
              size={25}
              color="#fff"
            />
          </TouchableOpacity>

        </View>


        {/* =========================
            IMAGE VIEWER
        ========================== */}

        <View style={styles.viewerContainer}>

          {images.length > 0 && (
            <ImageViewer
              key={`${visible}-${index}`}

              imageUrls={images}

              index={index}

              enableSwipeDown={true}

              onSwipeDown={handleClose}

              onCancel={handleClose}

              saveToLocalByLongPress={false}

              backgroundColor={colors.background}

              renderIndicator={() => null}

              onChange={(newIndex) => {

                if (typeof newIndex === 'number') {
                  setViewerIndex(newIndex);
                }

              }}
            />
          )}

        </View>


        {/* BOTTOM SAFE AREA */}
        <View
          style={{
            height: insets.bottom,
            backgroundColor: colors.background,
          }}
        />

      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },


  // ========================
  // HEADER
  // ========================

  header: {
    width: '100%',

    justifyContent: 'flex-end',
    alignItems: 'center',

    paddingBottom: 10,

    backgroundColor: colors.background,
  },


  // ========================
  // INDICATOR
  // ========================

  indicator: {
    backgroundColor: colors.primary,

    paddingHorizontal: 12,
    paddingVertical: 5,

    borderRadius: 12,
  },

  indicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },


  // ========================
  // CLOSE
  // ========================

  closeButton: {
    position: 'absolute',

    right: 20,

    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: 'rgba(0,0,0,0.75)',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 100,
  },


  // ========================
  // IMAGE
  // ========================

  viewerContainer: {
    flex: 1,
  },

});


export default ImageZoomModal;