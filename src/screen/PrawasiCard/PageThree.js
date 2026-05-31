import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomInput from '../../components/CustomInput';
import UploadBox from '../../components/UploadBox';
import SelectionModal from '../../components/SelectionModal';
import DropdownField from '../../components/DropdownField';
import {
  saveJamaniDetails,
  getJamaniDetails
} from '../../services/prawasiServices';

import AsyncStorage
from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../network/apiClient';
import { globalStyles, colors } from '../../styles/globalStyles';

const relationTypes1 = [
  'Friend',
  'Relative',
  'Community Leader',
  'Colleague',
  'Hotel Owner',
  'Wife',
  'Husband',
  'Father',
  'Mother',
];

const relationTypes2 = [
  'Friend',
  'Colleague',
];

const relationTypes3 = [
  'Security',
  'Hotel Owner',
  'Housewife',
];

const idTypes = [
  'Nepal Nagrikta',
  'Nepali Passport',
  'Nepali Voter-Id',
  'Nepali Driving Licence',
  'Rashtriya Parichay Patra',
  'Aadhaar Card',
];

const PageThree = ({
  formData,
  updateForm,
  onNext,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState('');

  const [modalData, setModalData] =
    useState([]);

  const [selectedField, setSelectedField] =
    useState('');

  useEffect(() => {

  loadJamaniDetails();

  }, []);



const loadJamaniDetails =
  async () => {

    try {
      setLoading(true);
      const applicationId =
        await AsyncStorage.getItem(
          'APPLICATION_ID',
        );

      if (!applicationId) {
        return;
      }

      const response =
        await getJamaniDetails(
          applicationId,
        );

      console.log(
        'JAMANI DETAILS => ',
        response,
      );

      if (response.status) {

        const jamani1 =
          response.data['1'];

        const jamani2 =
          response.data['2'];

        const jamani3 =
          response.data['3'];

        updateForm({

          // JAMANI 1

          jamani1Name:
            jamani1?.name || '',

          jamani1Mobile:
            jamani1?.mobile || '',

          jamani1IdType:
            jamani1?.id_type || '',

          jamani1IdNumber:
            jamani1?.id_number || '',

          jamani1Relation:
            jamani1?.relation_name || '',
          
            // uri:
            //         BASE_URL + '/' +
            //         jamani1.front_image,
          jamani1Image:
          jamani1?.front_image
            ? {
                uri:
                  `${BASE_URL}/${jamani1.front_image}`,

                type: 'image/jpeg',

                name:
                  jamani1.front_image
                    .split('/')
                    .pop(),
              }
            : null,

          jamani1ImageBack:
          jamani1?.back_image
            ? {
                uri:
                  `${BASE_URL}/${jamani1.back_image}`,

                type: 'image/jpeg',

                name:
                  jamani1.back_image
                    .split('/')
                    .pop(),
              }
            : null,

          // JAMANI 2

          jamani2Name:
            jamani2?.name || '',

          jamani2Mobile:
            jamani2?.mobile || '',

          jamani2IdType:
            jamani2?.id_type || '',

          jamani2IdNumber:
            jamani2?.id_number || '',

          jamani2Relation:
            jamani2?.relation_name || '',

            
            
          jamani2Image:
            jamani2?.front_image
              ? {
                uri:
                  `${BASE_URL}/${jamani2.front_image}`,

                type: 'image/jpeg',

                name:
                  jamani2.front_image
                    .split('/')
                    .pop(),
              }
            : null,

          jamani2ImageBack:
            jamani2?.back_image
              ? {
                uri:
                  `${BASE_URL}/${jamani2.back_image}`,

                type: 'image/jpeg',

                name:
                  jamani2.back_image
                    .split('/')
                    .pop(),
              }
            : null,

          // JAMANI 3

          jamani3Name:
            jamani3?.name || '',

          jamani3Mobile:
            jamani3?.mobile || '',

          jamani3IdType:
            jamani3?.id_type || '',

          jamani3IdNumber:
            jamani3?.id_number || '',

          jamani3Relation:
            jamani3?.relation_name || '',

          jamani3Image:
            jamani3?.front_image
              ? {
                uri:
                  `${BASE_URL}/${jamani3.front_image}`,

                type: 'image/jpeg',

                name:
                  jamani3.front_image
                    .split('/')
                    .pop(),
              }
            : null,

          jamani3ImageBack:
            jamani3?.back_image
              ? {
                uri:
                  `${BASE_URL}/${jamani3.back_image}`,

                type: 'image/jpeg',

                name:
                  jamani3.back_image
                    .split('/')
                    .pop(),
              }
            : null,
        });
      }

    } catch (error) {

      console.log(
        'LOAD JAMANI ERROR => ',
        error,
      );
    } finally {
      setLoading(false);
    }
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

  const handleSelect = item => {

    updateForm({
      [selectedField]: item,
    });

    setModalVisible(false);

  };

  const saveAndNext = async () => {
    if(formData.applicationStatus === 'PENDING') {
      alert(
        'Your application has already been submitted. You cannot make changes now.',
      );
      onNext();
      return;
    }
  try {
    setLoading(true);

    const response =
      await saveJamaniDetails(
        formData,
      );

    console.log(
      'STEP 3 RESPONSE => ',
      response,
    );

    if (response.status) {

      onNext();

    } else {

      alert(response.message);
    }

  } catch (error) {

    console.log(
      'STEP 3 ERROR => ',
      error,
    );

    alert(
      'Something went wrong',
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View pointerEvents={formData.applicationStatus === 'PENDING' ? 'none' : 'auto'} style={{width: 'auto'}}>
      <Text style={styles.title}>
        Jamani Details
      </Text>

      {/* JAMANI 1 */}

      <Text style={styles.section}>
        Jamani 1 (Main Nepali Citizen/Leader)
      </Text>

      {loading ? (
        <View style={{alignItems: 'center', marginVertical: 220, position: 'absolute', width: '100%'}}>
        <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: 20, position: 'absolute'}} />
        </View>
      ) : null}

      <CustomInput
        label="Name"
        value={formData.jamani1Name}
        onChangeText={text =>
          updateForm({
            jamani1Name: text,
          })
        }
      />

      <CustomInput
        label="Mobile"
        value={formData.jamani1Mobile}
        keyboardType="phone-pad"
        onChangeText={text =>
          updateForm({
            jamani1Mobile: text,
          })
        }
      />

      <DropdownField
        label="ID Type"
        value={formData.jamani1IdType}
        placeholder="Select ID Type"
        onPress={() =>
          openModal(
            'Select ID Type',
            idTypes,
            'jamani1IdType',
          )
        }
      />

      <CustomInput
        label="ID Number"
        value={formData.jamani1IdNumber}
        onChangeText={text =>
          updateForm({
            jamani1IdNumber: text,
          })
        }
      />

      <UploadBox
        label="Upload Front ID Image"
        image={formData.jamani1Image}
        onSelect={img =>
          updateForm({
            jamani1Image: img,
          })
        }
      />
      <UploadBox
        label="Upload Back ID Image"
        image={formData.jamani1ImageBack}
        onSelect={img =>
          updateForm({
            jamani1ImageBack: img,
          })
        }
      />


      <DropdownField
        label="Relation"
        value={formData.jamani1Relation}
        placeholder="Select Relation"
        onPress={() =>
          openModal(
            'Select Relation',
            relationTypes1,
            'jamani1Relation',
          )
        }
      />

      {/* JAMANI 2 */}

      <Text style={styles.section}>
        Jamani 2 (Second Nepali Citizen/Friend)
      </Text>

      <CustomInput
        label="Name"
        value={formData.jamani2Name}
        onChangeText={text =>
          updateForm({
            jamani2Name: text,
          })
        }
      />

      <CustomInput
        label="Mobile"
        value={formData.jamani2Mobile}
        keyboardType="phone-pad"
        onChangeText={text =>
          updateForm({
            jamani2Mobile: text,
          })
        }
      />

      <DropdownField
        label="ID Type"
        value={formData.jamani2IdType}
        placeholder="Select ID Type"
        onPress={() =>
          openModal(
            'Select ID Type',
            idTypes,
            'jamani2IdType',
          )
        }
      />

      <CustomInput
        label="ID Number"
        value={formData.jamani2IdNumber}
        onChangeText={text =>
          updateForm({
            jamani2IdNumber: text,
          })
        }
      />

      <UploadBox
        label="Upload Front ID Image"
        image={formData.jamani2Image}
        onSelect={img =>
          updateForm({
            jamani2Image: img,
          })
        }
      />

      <UploadBox
        label="Upload Back ID Image"
        image={formData.jamani2ImageBack}
        onSelect={img =>
          updateForm({
            jamani2ImageBack: img,
          })
        }
      />

      <DropdownField
        label="Relation"
        value={formData.jamani2Relation}
        placeholder="Select Relation"
        onPress={() =>
          openModal(
            'Select Relation',
            relationTypes1,
            'jamani2Relation',
          )
        }
      />

      {/* JAMANI 3 */}

      <Text style={styles.section}>
        Jamani 3 (Nepali Local Reference)
      </Text>

      <CustomInput
        label="Name"
        value={formData.jamani3Name}
        onChangeText={text =>
          updateForm({
            jamani3Name: text,
          })
        }
      />

      <CustomInput
        label="Mobile"
        value={formData.jamani3Mobile}
        keyboardType="phone-pad"
        onChangeText={text =>
          updateForm({
            jamani3Mobile: text,
          })
        }
      />

      <DropdownField
        label="ID Type"
        value={formData.jamani3IdType}
        placeholder="Select ID Type"
        onPress={() =>
          openModal(
            'Select ID Type',
            idTypes,
            'jamani3IdType',
          )
        }
      />

      <CustomInput
        label="ID Number"
        value={formData.jamani3IdNumber}
        onChangeText={text =>
          updateForm({
            jamani3IdNumber: text,
          })
        }
      />

      <UploadBox
        label="Upload Front ID Image"
        image={formData.jamani3Image}
        onSelect={img =>
          updateForm({
            jamani3Image: img,
          })
        }
      />

      <UploadBox
        label="Upload Back ID Image"
        image={formData.jamani3ImageBack}
        onSelect={img =>
          updateForm({
            jamani3ImageBack: img,
          })
        }
      />

      <DropdownField
        label="Relation"
        value={formData.jamani3Relation}
        placeholder="Select Relation"
        onPress={() =>
          openModal(
            'Select Relation',
            relationTypes1,
            'jamani3Relation',
          )
        }
      />
      </View>
      {/* REVIEW BUTTON */}

      <TouchableOpacity
        style={styles.button}
        onPress={saveAndNext}>
          {loading ? (
        <ActivityIndicator size="small" color="#fff" />
                            ) : (
        <Text style={styles.btnText}>
          {formData.applicationStatus === 'PENDING' ? 'Next' : 'Review'}
        </Text> )}

      </TouchableOpacity>

      {/* COMMON MODAL */}

      <SelectionModal
        visible={modalVisible}
        title={modalTitle}
        data={modalData}
        onSelect={handleSelect}
        onClose={() =>
          setModalVisible(false)
        }
      />

    </ScrollView>
  );
};

export default PageThree;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
  },

  section: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
    marginTop: 10,
    color: '#111',
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
    marginBottom: 18,
  },

  dropdownText: {
    fontSize: 15,
    color: '#111',
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

  backBtn: {
    marginTop: 18,
    alignItems: 'center',
  },

  backText: {
    fontSize: 15,
    color: '#444',
  },
});