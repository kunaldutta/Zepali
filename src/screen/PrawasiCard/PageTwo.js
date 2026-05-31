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
import {
  getIdDetails,
} from '../../services/prawasiServices';
import AsyncStorage
from '@react-native-async-storage/async-storage';

import {
  saveIdDetails,
} from '../../services/prawasiServices';

import { BASE_URL } from '../../network/apiClient';
import { globalStyles, colors } from '../../styles/globalStyles';

const idTypes = [
  'Nepal Nagrikta',
  'Nepali Passport',
  'Nepali Voter-Id',
  'Nepali Driving Licence',
  'Rashtriya Parichay Patra',
];

const indiaAddressProofTypes = [
  'Rent Agreement',
  'Electricity Bill',
];

const PageTwo = ({
  formData,
  updateForm,
  onNext,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [showPrimaryModal, setShowPrimaryModal] =
    useState(false);

  const [showSecondModal, setShowSecondModal] =
    useState(false);
  const [showIndiaAddressModal, setShowIndiaAddressModal] =
    useState(false);

  // Remove already selected primary ID
  const secondIdOptions = idTypes.filter(
    item => item !== formData.primaryIdType,
  );

  useEffect(() => {

  loadSavedIds();

}, []);

const loadSavedIds = async () => {

  try {
    setLoading(true);
    const applicationId =
      await AsyncStorage.getItem(
        'APPLICATION_ID',
      );
      console.log(
        'LOADED APPLICATION ID => P-2 ',
        applicationId,
      );
    if (!applicationId) {
      return;
    }

    const response =
      await getIdDetails(
        applicationId,
      );

    console.log(
      'ID DETAILS RESPONSE => ',
      response,
    );

    if (response.status) {

      updateForm({

        // PRIMARY ID

        primaryIdType:
          response.primary
            ?.id_type || '',

        primaryIdNumber:
          response.primary
            ?.id_number || '',

        primaryFrontImage:
        response.primary?.front_image
          ? {
              uri:
                `${BASE_URL}/${response.primary.front_image}`,

              type: 'image/jpeg',

              name:
                response.primary.front_image
                  .split('/')
                  .pop(),
            }
          : null,
            //response.primary.back_image
        primaryBackImage:
          response.primary
            ?.back_image
            ? {
              uri:
                `${BASE_URL}/${response.primary.back_image}`,

              type: 'image/jpeg',

              name:
                response.primary.back_image
                  .split('/')
                  .pop(),
            }
          : null,


        // SECONDARY ID

        secondaryIdType:
          response.secondary
            ?.id_type || '',

        secondaryIdNumber:
          response.secondary
            ?.id_number || '',
            //response.secondary.front_image
        secondaryFrontImage:
          response.secondary
            ?.front_image
            ? {
              uri:
                `${BASE_URL}/${response.secondary.front_image}`,

              type: 'image/jpeg',

              name:
                response.secondary.front_image
                  .split('/')
                  .pop(),
            }
          : null,

        secondaryBackImage:
          response.secondary
            ?.back_image
            ? {
              uri:
                `${BASE_URL}/${response.secondary.back_image}`,

              type: 'image/jpeg',

              name:
                response.secondary.back_image
                  .split('/')
                  .pop(),
            }
          : null,
        
        // INDIA ADDRESS PROOF

        indiaAddressProofType:
          response.india_address_proof
            ?.proof_type || '',

        indiaAddressProofNumber:
          response.india_address_proof
            ?.proof_number || '',

        indiaAddressProofFront:
          response.india_address_proof
            ?.front_image
            ? {
              uri:
                `${BASE_URL}/${response.india_address_proof.front_image}`,

              type: 'image/jpeg',

              name:
                response.india_address_proof.front_image
                  .split('/')
                  .pop(),
            }
          : null,

        indiaAddressProofBack:
          response.india_address_proof
            ?.back_image
            ? {
              uri:
                `${BASE_URL}/${response.india_address_proof.back_image}`,

              type: 'image/jpeg',

              name:
                response.india_address_proof.back_image
                  .split('/')
                  .pop(),
            }
          : null,

        applicationStatus:
          response.application_status || null,
      });

    }

  } catch (error) {

    console.log(
      'LOAD IDS ERROR => ',
      error,
    );
  } finally {
    setLoading(false);
  }
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
        await saveIdDetails(
          formData,
        );

      console.log(
        'STEP 2 RESPONSE => ',
        response,
      );

      if (response.status) {

        onNext();

      } else {

        alert(response.message);

      }

    } catch (error) {

      console.log(
        'STEP 2 ERROR => ',
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
        Document Upload & Identification
      </Text>
      {loading ? (
        <View style={{alignItems: 'center', marginVertical: 220, position: 'absolute', width: '100%'}}>
        <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: 20, position: 'absolute'}} />
        </View>
      ) : null}
      {/* PRIMARY ID */}

      <Text style={styles.sectionTitle}>
        Primary ID
      </Text>

      <Text style={styles.label}>
        Select ID Type
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() =>
          setShowPrimaryModal(true)
        }>

        <Text
          style={[
            styles.dropdownText,
            !formData.primaryIdType && {
              color: '#999',
            },
          ]}>

          {formData.primaryIdType ||
            'Select Primary ID Type'}

        </Text>

        <Ionicons
          name="chevron-down"
          size={22}
          color="#444"
        />

      </TouchableOpacity>

      {/* PRIMARY ID NUMBER */}

      <CustomInput
        label="Primary ID Number"
        value={formData.primaryIdNumber}
        onChangeText={text =>
          updateForm({
            primaryIdNumber: text,
          })
        }
      />

      {/* PRIMARY ID FRONT */}

      <UploadBox
        label="Upload Primary ID Front"
        image={formData.primaryFrontImage}
        onSelect={img =>
            updateForm({
            primaryFrontImage: img,
            })
        }
        />

      {/* PRIMARY ID BACK */}

      <UploadBox
        label="Upload Primary ID Back"
        image={formData.primaryBackImage}
        onSelect={img =>
            updateForm({
            primaryBackImage: img,
            })
        }
      />

      {/* SECOND ID */}

      <Text style={styles.sectionTitle}>
        Secondary ID
      </Text>

      <Text style={styles.label}>
        Select Second ID Type
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() =>
          setShowSecondModal(true)
        }>

        <Text
          style={[
            styles.dropdownText,
            !formData.secondaryIdType && {
              color: '#999',
            },
          ]}>

          {formData.secondaryIdType ||
            'Select Secondary ID Type'}

        </Text>

        <Ionicons
          name="chevron-down"
          size={22}
          color="#444"
        />

      </TouchableOpacity>

      {/* SECOND ID NUMBER */}

      <CustomInput
        label="Secondary ID Number"
        value={formData.secondaryIdNumber}
        onChangeText={text =>
          updateForm({
            secondaryIdNumber: text,
          })
        }
      />

      {/* SECOND ID FRONT */}

      <UploadBox
        label="Upload Secondary ID Front"
        image={formData.secondaryFrontImage}
        onSelect={img =>
          updateForm({
            secondaryFrontImage: img,
          })
        }
      />

      {/* SECOND ID BACK */}

      <UploadBox
        label="Upload Secondary ID Back"
        image={formData.secondaryBackImage}
        onSelect={img =>
          updateForm({
            secondaryBackImage: img,
          })
        }
      />

      {/* INDIA ADDRESS PROOF */}
      
      <Text style={styles.sectionTitle}>
        India Address Proof
      </Text>

      <Text style={styles.label}>
        Select Address Proof Type
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() =>
          setShowIndiaAddressModal(true)
        }>

        <Text
          style={[
            styles.dropdownText,
            !formData.indiaAddressProofType && {
              color: '#999',
            },
          ]}>

          {formData.indiaAddressProofType ||
            'Select India Address Proof Type'}

        </Text>

        <Ionicons
          name="chevron-down"
          size={22}
          color="#444"
        />

      </TouchableOpacity>
      <CustomInput
        label="India Address Proof Number"
        value={formData.indiaAddressProofNumber || ''}
        onChangeText={text =>
          updateForm({
            indiaAddressProofNumber: text,
          })
        }
      />
      <UploadBox
        label="Upload India Address Proof Front"
        image={formData.indiaAddressProofFront}
        onSelect={img =>
          updateForm({
            indiaAddressProofFront: img,
          })
        }
      />

      {/* INDIA ADDRESS PROOF BACK */}



      <UploadBox
        label="Upload India Address Proof Back"
        image={formData.indiaAddressProofBack}
        onSelect={img =>
          updateForm({
            indiaAddressProofBack: img,
          })
        }
      />
      

      {/* CONTINUE BUTTON */}
        </View>
      <TouchableOpacity
        style={styles.button}
        onPress={saveAndNext}>
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

      {/* PRIMARY ID MODAL */}

      <SelectionModal
        visible={showPrimaryModal}
        title="Select Primary ID Type"
        data={idTypes}
        onSelect={item => {
          updateForm({
            primaryIdType: item,

            // Reset secondary if same
            secondaryIdType:
              formData.secondaryIdType === item
                ? ''
                : formData.secondaryIdType,
          });

          setShowPrimaryModal(false);
        }}
        onClose={() =>
          setShowPrimaryModal(false)
        }
      />

      {/* SECONDARY ID MODAL */}

      <SelectionModal
        visible={showSecondModal}
        title="Select Secondary ID Type"
        data={secondIdOptions}
        onSelect={item => {
          updateForm({
            secondaryIdType: item,
          });

          setShowSecondModal(false);
        }}
        onClose={() =>
          setShowSecondModal(false)
        }
      />

      <SelectionModal
        visible={showIndiaAddressModal}
        title="Select India Address Proof Type"
        data={indiaAddressProofTypes}
        onSelect={item => {
          updateForm({
            indiaAddressProofType: item,
          });

          setShowIndiaAddressModal(false);
        }}
        onClose={() =>
          setShowIndiaAddressModal(false)
        }
      />

    </ScrollView>
  );
};

export default PageTwo;

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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
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