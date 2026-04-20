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
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL } from '../../network/apiClient';
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { colors, globalStyles } from '../../styles/globalStyles';
import i18n from '../../localization/i18n';
import { useNavigation } from '@react-navigation/native';
import { updateUserProfile } from '../../services/userProfileUpdate'; // ✅ NEW SERVICE

export default function EditProfile() {

  const navigation = useNavigation(); // ✅ FIX

  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('USER_DATA');
    if (data) setUser(JSON.parse(data));
  };

  /* ================= IMAGE PICKER ================= */
  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (!result.didCancel && result.assets?.length > 0) {
      setImage(result.assets[0]);
    }
  };


const updateProfile = async () => {

  if (!user?.name) {
    Alert.alert('Validation', 'Name is required');
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append('id', user.id);
    formData.append('name', user.name);
    formData.append('mobile_number', user.mobile_number);
    formData.append('email_id', user.email_id);
    formData.append('address1', user.address1);

    if (image) {
      formData.append('user_image', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'profile.jpg',
      });
    }

    // ✅ USE COMMON API
    const res = await updateUserProfile(formData);

    if (res?.status === 'success') {

      const updatedUser = res.user;

      await AsyncStorage.setItem(
        'USER_DATA',
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);
      setImage(null);

      Alert.alert('Success', 'Profile updated');

    } else {
      Alert.alert('Error', res?.message || 'Update failed');
    }

  } catch (err) {
    console.log(err);
    Alert.alert('Error', 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

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
        title={i18n.t("EDIT_PROFILE") || "Edit Profile"} // ✅ FIXED
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <View style={styles.container}>

        {/* IMAGE */}
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              image
                ? { uri: image?.uri }
                : user?.user_image
                ? { uri: BASE_URL + '/' + user?.user_image }
                : require('../../../src/Assets/LoginLogo/user.jpg')
            }
            style={styles.image}
          />
          <Text style={styles.changeText}>Change Image</Text>
        </TouchableOpacity>

        {/* INPUTS */}
        <TextInput
          placeholder="Name"
          value={user.name}
          onChangeText={(t) => setUser({ ...user, name: t })}
          style={[globalStyles.input, { height: 45, paddingVertical: 0, textAlignVertical: 'center', top: 15 }]}
        />

        <TextInput
          placeholder="Mobile"
          value={user.mobile_number}
          onChangeText={(t) => setUser({ ...user, mobile_number: t })}
          editable={false}
          style={[globalStyles.input, { height: 45, paddingVertical: 0, textAlignVertical: 'center', top: 15, color: '#999' }]}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Email"
          value={user.email_id}
          onChangeText={(t) => setUser({ ...user, email_id: t })}
          style={[globalStyles.input, { height: 45, paddingVertical: 0, textAlignVertical: 'center', top: 15 }]}
        />

        {/* BUTTON */}
        <View style={[globalStyles.bottomShadow,{marginBottom: 1, width: '90%', left: '5%', top: 30}]} >
        <TouchableOpacity
          style={[globalStyles.button, { height: 45, padding:6, width: '100%', }]}
          onPress={updateProfile}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Text>
        </TouchableOpacity>
        </View>

      </View>
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
  },
  changeText: {
    textAlign: 'center',
    color: 'blue',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});