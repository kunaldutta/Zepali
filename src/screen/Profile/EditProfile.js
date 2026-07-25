import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';

import { BASE_URL } from '../../network/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { colors, globalStyles } from '../../styles/globalStyles';
import i18n from '../../localization/i18n';
import { useNavigation } from '@react-navigation/native';
import { updateUserProfile } from '../../services/userProfileUpdate';

export default function EditProfile() {

  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Full image popup
  const [imageModalVisible, setImageModalVisible] = useState(false);

  /* ================= LOAD USER ================= */

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('USER_DATA');

      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.log('Load user error:', error);
    }
  };

  /* ================= IMAGE PICKER + CROP ================= */

  const pickImage = async () => {

    try {

      // Close preview popup first
      setImageModalVisible(false);

      const selectedImage = await ImagePicker.openPicker({
        width: 600,
        height: 600,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        freeStyleCropEnabled: false,
      });

      if (selectedImage) {

        setImage({
          uri: selectedImage.path,
          type: selectedImage.mime || 'image/jpeg',
          fileName:
            selectedImage.filename ||
            `profile_${Date.now()}.jpg`,
        });

      }

    } catch (error) {

      // User cancelled picker/crop
      if (
        error?.code === 'E_PICKER_CANCELLED' ||
        error?.message?.toLowerCase()?.includes('cancel')
      ) {
        return;
      }

      console.log('Image picker error:', error);

      Alert.alert(
        'Error',
        'Unable to select image'
      );
    }
  };

  /* ================= GET PROFILE IMAGE ================= */

  const getProfileImage = () => {

    if (image?.uri) {
      return { uri: image.uri };
    }

    if (user?.user_image) {
      return {
        uri: BASE_URL + '/' + user.user_image
      };
    }

    return require('../../../src/Assets/LoginLogo/user.jpg');
  };

  /* ================= UPDATE PROFILE ================= */

  const updateProfile = async () => {

    if (!user?.name?.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append('id', user.id);
      formData.append('name', user.name.trim());
      formData.append('mobile_number', user.mobile_number || '');
      formData.append('email_id', user.email_id || '');

      if (image) {

        formData.append('user_image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'profile.jpg',
        });

      }

      const res = await updateUserProfile(formData);

      if (res?.status === 'success') {

        const updatedUser = res.user;

        await AsyncStorage.setItem(
          'USER_DATA',
          JSON.stringify(updatedUser)
        );

        await AsyncStorage.setItem(
          'HOME_UPDATE_REQUIRED',
          'YES'
        );

        setUser(updatedUser);
        setImage(null);

        Alert.alert(
          'Success',
          'Profile updated'
        );

      } else {

        Alert.alert(
          'Error',
          res?.message || 'Update failed'
        );

      }

    } catch (err) {

      console.log('Update profile error:', err);

      if (
        err?.message?.includes('Network Error') ||
        err?.message?.includes('timeout')
      ) {

        Alert.alert(
          'Connection error',
          'Please check your connection'
        );

        return;
      }

      Alert.alert(
        'Error',
        'Something went wrong'
      );

    } finally {

      setLoading(false);

    }
  };

  /* ================= LOADING ================= */

  if (!user) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );

  }

  return (

    <SafeAreaView style={globalStyles.safeArea}>

      <AppHeader
        title={i18n.t('EDIT_PROFILE') || 'Edit Profile'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <View style={styles.container}>

        {/* ================= PROFILE IMAGE ================= */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setImageModalVisible(true)}
        >

          <Image
            source={getProfileImage()}
            style={styles.image}
          />

        </TouchableOpacity>

        {/* Separate Change Image button */}

        <TouchableOpacity
          onPress={pickImage}
        >

          <Text style={styles.changeText}>
            Change Image
          </Text>

        </TouchableOpacity>


        {/* ================= NAME ================= */}

        <TextInput
          style={[
            globalStyles.input,
            {
              height: 45,
              paddingVertical: 0,
              textAlignVertical: 'center',
              top: 15,
            },
          ]}
          placeholder="Name"
          placeholderTextColor={colors.placeholderTextColor}
          value={user.name}
          onChangeText={(t) =>
            setUser({
              ...user,
              name: t,
            })
          }
        />


        {/* ================= MOBILE ================= */}

        <TextInput
          placeholder="Mobile"
          placeholderTextColor={colors.placeholderTextColor}
          value={user.mobile_number}
          editable={false}
          style={[
            globalStyles.input,
            {
              height: 45,
              paddingVertical: 0,
              textAlignVertical: 'center',
              top: 15,
              color: '#999',
            },
          ]}
          keyboardType="numeric"
        />


        {/* ================= EMAIL ================= */}

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.placeholderTextColor}
          value={user.email_id}
          onChangeText={(t) =>
            setUser({
              ...user,
              email_id: t,
            })
          }
          style={[
            globalStyles.input,
            {
              height: 45,
              paddingVertical: 0,
              textAlignVertical: 'center',
              top: 15,
            },
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
        />


        {/* ================= UPDATE BUTTON ================= */}

        <View
          style={[
            globalStyles.bottomShadow,
            {
              marginBottom: 1,
              width: '90%',
              left: '5%',
              top: 30,
            },
          ]}
        >

          <TouchableOpacity
            style={[
              globalStyles.button,
              {
                height: 45,
                padding: 6,
                width: '100%',
              },
            ]}
            onPress={updateProfile}
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator color="#fff" />

            ) : (

              <Text style={globalStyles.buttonText}>
                Update Profile
              </Text>

            )}

          </TouchableOpacity>

        </View>

      </View>


      {/* =====================================================
          FULL IMAGE PREVIEW MODAL
      ===================================================== */}

      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setImageModalVisible(false)
        }
      >

        <View style={styles.modalContainer}>

          {/* Close when background clicked */}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() =>
              setImageModalVisible(false)
            }
          />

          {/* CLOSE BUTTON */}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() =>
              setImageModalVisible(false)
            }
          >

            <Text style={styles.closeText}>
              ✕
            </Text>

          </TouchableOpacity>


          {/* FULL IMAGE */}

          <Image
            source={getProfileImage()}
            style={styles.fullImage}
            resizeMode="contain"
          />


          {/* CHANGE IMAGE */}

          <TouchableOpacity
            style={styles.modalChangeButton}
            onPress={pickImage}
          >

            <Text style={styles.modalChangeText}>
              Change Image
            </Text>

          </TouchableOpacity>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    backgroundColor: '#eee',
  },

  changeText: {
    textAlign: 'center',
    color: colors.primary || 'blue',
    marginVertical: 10,
    fontWeight: '600',
  },

  /* ================= MODAL ================= */

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width: '92%',
    height: '70%',
  },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,

    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: 'rgba(255,255,255,0.2)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },

  modalChangeButton: {
    position: 'absolute',
    bottom: 50,

    backgroundColor: '#fff',

    paddingHorizontal: 30,
    paddingVertical: 13,

    borderRadius: 25,
  },

  modalChangeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },

});