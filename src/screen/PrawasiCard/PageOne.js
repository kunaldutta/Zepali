import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

import CustomInput from '../../components/CustomInput';
import DropdownField from '../../components/DropdownField';
import SelectionModal from '../../components/SelectionModal';
import {formatDOB, convertDOBToUI} from '../../utils/formatters';
import {
  savePersonalDetails,
  getPersonalDetails,
} from '../../services/prawasiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../network/apiClient'; 
import { colors } from '../../styles/globalStyles';
import CustomAlert from '../../components/CustomAlert';

const genderOptions = [
  'Male',
  'Female',
  'Other',
];

const forWhomOptions = [
  'self',
  'wife',
  'son',
  'daughter',
  'father',
  'mother',
];

const guardianRelations = [
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Husband',
  'Wife',
  'Uncle',
  'Aunty',
  'Friend',
  'Relative',
];

const PageOne = ({
  formData,
  updateForm,
  onNext,
}) => {

  useEffect(() => {
  getSavedApplicationId();
  loadSavedData();
}, []);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState('');

  const [modalData, setModalData] =
    useState([]);

  const [selectedField, setSelectedField] =
    useState('');
  const [loading, setLoading] = useState(false);

  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted =
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

  return (
    granted ===
    PermissionsAndroid.RESULTS.GRANTED
  );
};
   
  useEffect(() => {
    requestCameraPermission();
  }, []);

  
  const loadSavedData = async () => {

  try {
    setLoading(true);
    const applicationId =
      await AsyncStorage.getItem(
        'APPLICATION_ID',
      );
      console.log(
        'Saved Application ID => P1',
        applicationId,
      );
    if (!applicationId) {
      console.log(
        'No saved application ID found.',
      );
      return;
    }

    const response =
      await getPersonalDetails(
        applicationId,
      );

    console.log(
      'GET STEP 1 DATA => ',
      response,
    );

    if (response.status) {

      const data =
        response.data;
      
      updateForm({
        for_whom: data?.for_whom || '',
        
        fullName:
          data?.full_name || '',

        gender:
          data?.gender || '',

        dob:
          convertDOBToUI(
            data?.dob,
          ),

        guardianName:
          data?.guardian_name || '',

        guardianRelation:
          data?.guardian_relation || '',

        mobile:
          data?.mobile || '',

        address:
          data?.current_address || '',
        
        zipCode:
          data?.zip || '',

        nepalAddress:
          data?.nepal_address || '',

        companyName:
          data?.company_name || '',

        profession:
          data?.profession || '',

        profilePhoto:
        data.profile_photo
          ? {
              uri:
                `${BASE_URL}/${data.profile_photo}`,

              type: 'image/jpeg',

              name:
                data.profile_photo
                  .split('/')
                  .pop(),
            }
          : null,
        applicationStatus: data.status || null,
        paymentStatus: data.payment_status || null,
      });
    }

  } catch (error) {
    setLoading(false);
    console.log(
      'LOAD STEP 1 ERROR => ',
      error,
    );
  } finally {
    setLoading(false);
  }
};
  
  const openCamera = async () => {
    setIsAlertVisible(false);

    console.log('OPEN CAMERA CLICKED');

    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.7,
    });

    console.log('CAMERA RESULT =>', result);

    if (
      !result.didCancel &&
      result.assets?.length > 0
    ) {
      updateForm({
        profilePhoto: result.assets[0],
      });
    }
  };

  const openGallery = async () => {
    setIsAlertVisible(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (
      !result.didCancel &&
      result.assets?.length > 0
    ) {
      updateForm({
        profilePhoto: result.assets[0],
      });
    }
  };

  const pickProfileImage = () => {

    openCamera();
    // setIsAlertVisible(true);
    // setAlertTitle('Select Photo');
    // setAlertMessage('Choose an option');
     
    // if (formData.applicationStatus === 'PENDING') {
    //   return;
    // }
    // setIsAlertVisible(true);
    // setAlertTitle('Select Photo');
    // setAlertMessage('Choose an option');
  };

  const openModal = (
    title,
    data,
    field,
  ) => {

    setModalTitle(title);
    setModalData(data);
    setSelectedField(field);
    setModalVisible(true);

  };

  const getSavedApplicationId = async () => {

    try {

      const userSavedData = await AsyncStorage.getItem(
        'APPLICATION_ID',
      );
      console.log(
        'Saved Application ID => ',
        userSavedData,
      );
      return userSavedData;

    } catch (error) {

      console.log(
        'getSavedApplicationId ERROR => ',
        error,
      );

      return null;
    }
  };

  const handleSelect = item => {

    updateForm({
      [selectedField]: item,
    });

    setModalVisible(false);

  };

  const saveAndNext = async () => {
    setLoading(true);
  if( formData.applicationStatus === 'PENDING') {
    formData.applicationStatus === 'PENDING' && onNext();
    return;
  }
  try {

    const response =
      await savePersonalDetails(
        formData,
      );

    console.log(
      'STEP 1 RESPONSE => ',
      response,
    );
    console.log(
      'response ===',
      response,
    );
    if (response.status) {
      console.log(
        'Saving Application ID => P1 Response => ',
        response.application_id,
      );
      await AsyncStorage.setItem(
        'APPLICATION_ID',
        response.application_id.toString(),
      );

      onNext();

    } else {

      Alert.alert(response.message);

    }

  } catch (error) {
    console.log(
      'STEP 1 ERROR => ',
      error,
    );
    Alert.alert(
      'Something went wrong',
      'Please try again later.'
    );
  } finally {
    setLoading(false);
  }
};




  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Provide Your Details
      </Text>

      {/* PHOTO */}

      <Text style={styles.label}>
        Passport Size Photo
      </Text>
      {loading ? (
        <View style={{alignItems: 'center', marginVertical: 220, position: 'absolute', width: '100%'}}>
        <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: 20, position: 'absolute'}} />
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.photoContainer}
        onPress={pickProfileImage}>

        {formData.profilePhoto ? (

          <Image
            source={{
              uri: formData.profilePhoto.uri,
            }}
            style={styles.profileImage}
          />

        ) : (

          <Text style={styles.uploadText}>
            Upload Photo
          </Text>

        )}

      </TouchableOpacity>
      <DropdownField
        label="For Whom"
        value={formData.for_whom}
        placeholder="Select For Whom"
        onPress={() =>
          openModal(
            'Select For Whom',
            forWhomOptions,
            'for_whom',
          )
        }
      />
      {/* FULL NAME */}
      <View pointerEvents={formData.applicationStatus === 'PENDING' ? 'none' : 'auto'} style={{width: 'auto'}}>
      <CustomInput
        label="Full Name (According to Citizenship)"
        value={formData.fullName}
        placeholder="Enter Full Name"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            fullName: text,
          })
        }
      />

      {/* GENDER */}

      <DropdownField
        label="Gender"
        value={formData.gender}
        placeholder="Select Gender"
        onPress={() =>
          openModal(
            'Select Gender',
            genderOptions,
            'gender',
          )
        }
      />

      {/* DOB */}

      <CustomInput
        label="Date of Birth"
        value={formData.dob}
        placeholder="DD/MM/YYYY"
        placeholderTextColor={colors.placeholderTextColor}
        keyboardType="number-pad"
        onChangeText={text =>
            updateForm({
            dob: formatDOB(text),
            })
        }
        />

      {/* GUARDIAN NAME */}

      <CustomInput
        label="Father's Name / Husband's Name / or Any Guardian Name"
        value={formData.guardianName}
        placeholder="Enter Guardian Name"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            guardianName: text,
          })
        }
      />

      {/* GUARDIAN RELATION */}

      <DropdownField
        label="Guardian Relation"
        value={formData.guardianRelation}
        placeholder="Select Relation"
        onPress={() =>
          openModal(
            'Select Relation',
            guardianRelations,
            'guardianRelation',
          )
        }
      />

      {/* MOBILE */}

      <CustomInput
        label="Mobile Number"
        value={formData.mobile}
        keyboardType="phone-pad"
        placeholder="Enter Mobile Number"
        onChangeText={text =>
          updateForm({
            mobile: text,
          })
        }
      />

      {/* OTP */}

      <View style={styles.otpRow}>

        <View style={{flex: 1}}>

          <CustomInput
            label="Enter OTP"
            value={formData.otp}
            keyboardType="number-pad"
            placeholder="Enter OTP"
            onChangeText={text =>
              updateForm({
                otp: text
                  .replace(/[^0-9]/g, '')
                  .slice(0, 6),
              })
            }
          />

        </View>

        <TouchableOpacity
          style={styles.verifyBtn}>

          <Text style={styles.verifyText}>
            Verify OTP
          </Text>

        </TouchableOpacity>

      </View>

      {/* CURRENT ADDRESS */}

      <Text style={styles.label}>
        Current Address (Hyderabad)
      </Text>

      <TextInput
        multiline
        numberOfLines={4}
        style={styles.multilineInput}
        value={formData.address}
        placeholder="Enter Current Address"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            address: text,
          })
        }
      />

      <CustomInput
        label="Zip Code"
        value={formData.zipCode}
        placeholder="Enter Zip Code"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            zipCode: text,
          })
        }
      />

      {/* NEPAL ADDRESS */}

      <Text style={styles.label}>
        Permanent Address (Nepal)
      </Text>

      <TextInput
        multiline
        numberOfLines={4}
        style={styles.multilineInput}
        value={formData.nepalAddress}
        placeholder="Enter Nepal Address"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            nepalAddress: text,
          })
        }
      />

      {/* COMPANY */}

      <CustomInput
        label="Name of Hotel/Company"
        value={formData.companyName}
        placeholder="Enter Company Name"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            companyName: text,
          })
        }
      />

      {/* PROFESSION */}

      <CustomInput
        label="Profession / Job Type"
        value={formData.profession}
        placeholder="Enter Profession"
        placeholderTextColor={colors.placeholderTextColor}
        onChangeText={text =>
          updateForm({
            profession: text,
          })
        }
      />

      {/* BUTTON */}

      

      {/* MODAL */}

      <SelectionModal
        visible={modalVisible}
        title={modalTitle}
        data={modalData}
        onSelect={handleSelect}
        onClose={() =>
          setModalVisible(false)
        }
      />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={saveAndNext}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.btnText}>
            {formData.applicationStatus === 'PENDING'
              ? 'Next'
              : 'Save & Continue'}
          </Text>
        )}
      </TouchableOpacity>
      {isAlertVisible && (
          <CustomAlert
            visible={isAlertVisible}   // ✅ REQUIRED
            title={alertTitle}
            onOkText="Camera"
            onCancelText="Cancel"
            onThirdOptionText="Gallery"
            onOk={openCamera}   // ✅ FIX
            message={alertMessage}
            onCancel={() => setIsAlertVisible(false)}   // ✅ FIX
            onThirdOption={() => openGallery()}   // ✅ FIX
          />
        )}
    </ScrollView>
  );
};

export default PageOne;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 280,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },

  photoContainer: {
    height: 140,
    width: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 25,
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  uploadText: {
    color: '#666',
  },

  otpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  verifyBtn: {
    backgroundColor: '#2563EB',
    height: 50,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 10,
    marginBottom: 15,
  },

  verifyText: {
    color: '#fff',
    fontWeight: '600',
  },

  multilineInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 18,
  },

  button: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});