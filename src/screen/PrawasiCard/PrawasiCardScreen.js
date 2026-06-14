import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';


import i18n from '../../localization/i18n';
import {globalStyles, colors} from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import {submitPrawasiCard} from '../../services/prawasiServices';

const PrawasiCardScreen = ({navigation}) => {
  const [form, setForm] = useState({
    nepalId1: '',
    nepalId1Name: '',
    nepalId2: '',
    nepalId2Name: '',
    contactNumber: '',
    nepalContactNumber: '',
    nepalAddress: '',
    indiaAddress: '',
    gender: '',
    dob: '',
  });

  const [nepalProof, setNepalProof] = useState(null);
  const [indiaProof, setIndiaProof] = useState(null);
  const [id_1, setId_1] = useState(null);
  const [id_2, setId_2] = useState(null);

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const pickImage = async type => {
        try {
            const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
            });


            if (result.didCancel) {
            return;
            }

            if (result.errorCode) {
            Alert.alert(
                'Error',
                result.errorMessage || 'Image picker error',
            );
            return;
            }

            const asset = result.assets?.[0];

            if (!asset) {
            Alert.alert('Error', 'No image selected');
            return;
            }

            if (type === 'nepal') {
            setNepalProof(asset);
            } else if (type === 'india') {
            setIndiaProof(asset);
            } else if (type === 'id_1') {
            setId_1(asset);
            } else if (type === 'id_2') {
            setId_2(asset);
            }
            
        } catch (error) {
            console.log('PICK IMAGE ERROR => ', error);
            Alert.alert('Error', 'Failed to open gallery');
        }
    };

  const validateForm = () => {
    if (!form.nepalId1.trim()) {
      Alert.alert('Validation', 'Please enter Nepal ID-1');
      return false;
    }

    if (!form.nepalId2.trim()) {
      Alert.alert('Validation', 'Please enter Nepal ID-2');
      return false;
    }

    if (!form.contactNumber.trim()) {
      Alert.alert('Validation', 'Please enter Contact Number');
      return false;
    }
    if (!form.nepalContactNumber.trim()) {
      Alert.alert('Validation', 'Please enter Nepal Contact Number');
      return false;
    }

    if (!form.nepalAddress.trim()) {
      Alert.alert('Validation', 'Please enter Nepal Address');
      return false;
    }

    if (!form.indiaAddress.trim()) {
      Alert.alert('Validation', 'Please enter Current India Address');
      return false;
    }

    return true;
  };

  const renderLabelWithInfo = (
    label,
    title,
    message,
  ) => {
    return (
      <View style={styles.labelRow}>

        <Text style={[styles.label, {marginBottom: 0}]}>
          {label}
        </Text>

        <TouchableOpacity
        style={{left:4, top:1,  borderRadius: 9999, backgroundColor: colors.safeAreaColor
        }}
          onPress={() =>
            Alert.alert(title, message)
          }>
            
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#334155"
          />

        </TouchableOpacity>

      </View>
    );
  };
  const handleSubmit = async () => {
    Alert.alert('Work in progress.');
    return;
    if (!validateForm()) {
        return;
    }

    const response = await submitPrawasiCard({
        nepalId1: form.nepalId1,
        nepalId2: form.nepalId2,
        contactNumber: form.contactNumber,
        nepalAddress: form.nepalAddress,
        indiaAddress: form.indiaAddress,
        nepalProof,
        indiaProof,
    });


    if (response?.status === 'success') {

        Alert.alert(
        'Success',
        response?.message || 'Submitted Successfully',
        );

    } else {

        Alert.alert(
        'Error',
        response?.message || 'Something went wrong',
        );
    }
    };

    

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      
      <AppHeader
          title={i18n.t("TELANGANA_NEPALI_SABHA") || "Telangana Nepali Sabha"}
          onBackPress={() => navigation.goBack()}
          showCart={false}
        />
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Prawasi Card Registration</Text>

      {/* Nepal ID 1 */}
      <View style={styles.inputContainer}>
        {renderLabelWithInfo(
          i18n.t("INFO") || "INFO",
          "Name Of ID-1 and Details",
          "Enter the name of ID like Aadhar-card, PAN card, etc.. and enter number of that ID in the next field. The age must be mentioned in either ID-1 or ID-2.",
        )}
        <Text style={styles.label}>{i18n.t("ID_1_NAME") || "ID-1 Name"}</Text>
        <TextInput
          placeholder={i18n.t("ENTER_NAME_FOR_ID_1") || "Enter Name for ID-1 of Nepal"}
          value={form.nepalId1Name}
          onChangeText={text => handleChange('nepalId1Name', text)}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>{i18n.t("ID_1_OF_NEPAL") || "ID-1 of Nepal"}</Text>

        <TextInput
          placeholder={i18n.t("ENTER_ID_1_OF_NEPAL") || "Enter ID-1 of Nepal"}
          value={form.nepalId1}
          onChangeText={text => handleChange('nepalId1', text)}
          style={styles.input}
          placeholderTextColor="#888"
        />
      </View>

      {/* Nepal ID 2 */}
      <View style={styles.inputContainer}>
        {renderLabelWithInfo(
          i18n.t("INFO") || "INFO",
          "Name Of ID-2 and Details",
          "Enter the name of ID like Aadhar-card, PAN card, etc.. and enter number of that ID in the next field. The age must be mentioned in either ID-1 or ID-2.",
        )}
        <Text style={styles.label}>{i18n.t("ID_2_NAME") || "ID-2 Name"}</Text>
        <TextInput
          placeholder={i18n.t("ENTER_NAME_FOR_ID_2") || "Enter Name for ID-2 of Nepal"}
          value={form.nepalId2Name}
          onChangeText={text => handleChange('nepalId2Name', text)}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>{i18n.t("ID_2_OF_NEPAL") || "ID-2 of Nepal"}</Text>

        <TextInput
          placeholder={i18n.t("ENTER_ID_2_OF_NEPAL") || "Enter ID-2 of Nepal"}
          value={form.nepalId2}
          onChangeText={text => handleChange('nepalId2', text)}
          style={styles.input}
          placeholderTextColor="#888"
        />
      </View>

      {/* Contact Number */}
      <View style={styles.inputContainer}>

  {/* India Number */}
  <Text style={styles.label}>
    {i18n.t("INDIA_CONTACT_NUMBER_LABEL") || "Contact Number of India"}
  </Text>

  <View style={styles.phoneContainer}>

    <View style={styles.countryCodeContainer}>
      <Text style={styles.countryCodeText}>
        +91
      </Text>
    </View>

    <TextInput
      placeholder={i18n.t("ENTER_INDIA_CONTACT_NUMBER") || "Enter Contact Number of India"}
      value={form.contactNumber}
      onChangeText={text =>
        handleChange('contactNumber', text)
      }
      style={styles.phoneInput}
      keyboardType="phone-pad"
      maxLength={10}
      placeholderTextColor="#888"
    />
  </View>

  {/* Nepal Number */}
  <Text style={[styles.label, {marginTop: 16}]}>
    {i18n.t("NEPAL_CONTACT_NUMBER_LABEL") || "Contact Number of Nepal"}
  </Text>

  <View style={styles.phoneContainer}>

    <View style={styles.countryCodeContainer}>
      <Text style={styles.countryCodeText}>
        +977
      </Text>
    </View>

    <TextInput
      placeholder={i18n.t("ENTER_NEPAL_CONTACT_NUMBER") || "Enter Contact Number of Nepal"}
      value={form.nepalContactNumber}
      onChangeText={text =>
        handleChange('nepalContactNumber', text)
      }
      style={styles.phoneInput}
      keyboardType="phone-pad"
      maxLength={10}
      placeholderTextColor="#888"
    />
  </View>

</View>
      {/* Gender & Age */}
      <View style={styles.inputContainer}>

        <View style={styles.rowContainer}>

          {/* Gender */}
          <View style={styles.halfContainer}>

            <Text style={styles.label}>
              {i18n.t("GENDER")}
            </Text>

            <View style={styles.genderContainer}>

              {/* Male */}
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  form.gender === 'Male' &&
                    styles.genderButtonActive,
                ]}
                onPress={() =>
                  handleChange('gender', 'Male')
                }>

                <Text
                  style={[
                    styles.genderText,
                    form.gender === 'Male' &&
                      styles.genderTextActive,
                  ]}>
                  {i18n.t("GENDER_MALE") || "Male"}
                </Text>
              </TouchableOpacity>

              {/* Female */}
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  form.gender === 'Female' &&
                    styles.genderButtonActive,
                ]}
                onPress={() =>
                  handleChange('gender', 'Female')
                }>

                <Text
                  style={[
                    styles.genderText,
                    form.gender === 'Female' &&
                      styles.genderTextActive,
                  ]}>
                  {i18n.t("GENDER_FEMALE") || "Female"}
                </Text>
              </TouchableOpacity>

              {/* Other */}
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  form.gender === 'Other' &&
                    styles.genderButtonActive,
                ]}
                onPress={() =>
                  handleChange('gender', 'Other')
                }>

                <Text
                  style={[
                    styles.genderText,
                    form.gender === 'Other' &&
                      styles.genderTextActive,
                  ]}>
                  {i18n.t("GENDER_OTHER") || "Other"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* DOB */}
          

        </View>
        <View style={styles.halfContainer}>

            <Text style={styles.label}>
              {i18n.t("DOB")}
            </Text>

            <TextInput
              placeholder={i18n.t("DOB_PLACEHOLDER") || "DD/MM/YYYY"}
              value={form.dob}
              onChangeText={text =>
                handleChange('dob', text)
              }
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#888"
            />
          </View>
      </View>

      {/* Nepal Address */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {i18n.t("NEPAL_ADDRESS")}
        </Text>

        <TextInput
          placeholder={i18n.t("ENTER_NEPAL_ADDRESS") || "Enter Nepal Address"}
          value={form.nepalAddress}
          onChangeText={text => handleChange('nepalAddress', text)}
          style={[styles.input, styles.multilineInput]}
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />
      </View>

      {/* India Address */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {i18n.t("INDIA_ADDRESS")}
        </Text>

        <TextInput
          placeholder={i18n.t("ENTER_INDIA_ADDRESS") || "Enter Current India Address"}
          value={form.indiaAddress}
          onChangeText={text => handleChange('indiaAddress', text)}
          style={[styles.input, styles.multilineInput]}
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />
      </View>

      {/* Upload Nepal Proof */}
      <TouchableOpacity
        style={styles.uploadButton}
        activeOpacity={0.8}
        onPress={() => pickImage('nepal')}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />

        <Text style={styles.uploadText}>
          {i18n.t("UPLOAD_NEPAL_ADDRESS_PROOF")}
        </Text>
      </TouchableOpacity>

      {nepalProof && (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: nepalProof.uri}}
            style={styles.previewImage}
          />

          <Text style={styles.fileName}>
            {nepalProof.fileName || 'Nepal Proof Selected'}
          </Text>
        </View>
      )}

      {/* Upload India Proof */}
      <TouchableOpacity
        style={styles.uploadButton}
        activeOpacity={0.8}
        onPress={() => pickImage('india')}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />

        <Text style={styles.uploadText}>
          {i18n.t("UPLOAD_INDIA_PROOF")}
        </Text>
      </TouchableOpacity>

      {indiaProof && (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: indiaProof.uri}}
            style={styles.previewImage}
          />

          <Text style={styles.fileName}>
            {indiaProof.fileName || 'India Proof Selected'}
          </Text>
        </View>
      )}
      <Text style={[styles.label, {marginTop: 20, fontSize: 13}]}>
       {i18n.t("Either_in_ID_1_or_ID_2_Age_should_be_mentioned")}
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        activeOpacity={0.8}
        onPress={() => pickImage('id_1')}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />

        <Text style={styles.uploadText}>
          {i18n.t("UPLOAD_ID_1_PROOF")}
        </Text>
      </TouchableOpacity>

      {id_1 && (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: id_1.uri}}
            style={styles.previewImage}
          />

          <Text style={styles.fileName}>
            {id_1.fileName || 'Nepal ID-1 Selected'}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.uploadButton}
        activeOpacity={0.8}
        onPress={() => pickImage('id_2')}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />

        <Text style={styles.uploadText}>
          {i18n.t("UPLOAD_ID_2_PROOF")}
        </Text>
      </TouchableOpacity>
      {id_2 && (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: id_2.uri}}
            style={styles.previewImage}
          />

          <Text style={styles.fileName}>
            {id_2.fileName || 'Nepal ID-2 Selected'}
          </Text>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitButton}
        activeOpacity={0.8}
        onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {i18n.t("SUBMIT_APPLICATION")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

export default PrawasiCardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 25,
  },

  inputContainer: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },

  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  uploadButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    elevation: 5,
  },

  uploadText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },

  previewContainer: {
    marginTop: 12,
    marginBottom: 16,
    alignItems: 'center',
  },

  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 8,
  },

  fileName: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
  },

  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,

    elevation: 6,
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  phoneContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#CBD5E1',
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
},

countryCodeContainer: {
  paddingHorizontal: 14,
  paddingVertical: 14,
  backgroundColor: '#E2E8F0',
  borderRightWidth: 1,
  borderRightColor: '#CBD5E1',
},

countryCodeText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#0F172A',
},

phoneInput: {
  flex: 1,
  paddingHorizontal: 14,
  paddingVertical: 14,
  fontSize: 15,
  color: '#000',
},
rowContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

halfContainer: {
  width: '100%',
},

genderContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 2,
},

genderButton: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#CBD5E1',
  borderRadius: 12,
  paddingVertical: 15,
  alignItems: 'center',
  marginRight: 6,
  backgroundColor: '#FFFFFF',
  width: 20,
},

genderButtonActive: {
  backgroundColor: '#334155',
  borderColor: '#334155',
},

genderText: {
  color: '#334155',
  fontWeight: '600',
  fontSize: 10,
},

genderTextActive: {
  color: '#FFFFFF',
},
labelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 5,
  marginLeft: '0%',
},
});