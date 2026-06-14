import React,{useState, useEffect} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';

import RazorpayCheckout
from 'react-native-razorpay';

import AsyncStorage
from '@react-native-async-storage/async-storage';

import {
  savePayment,
  getPrawasiCardCost,
} from '../../services/prawasiServices';
import { BASE_URL } from '../../network/apiClient';
import { globalStyles, colors } from '../../styles/globalStyles';
import { getPaymentConfig } from '../../services/paymentService';
import { compareVersions } from '../../utils/versionUtils';
import DeviceInfo from 'react-native-device-info';

const ReviewPage = ({formData, onBack}) => {
  const [cardCost,
  setCardCost] =
  useState(null);


 useEffect(() => {

  loadCardCost();

}, []);

const loadCardCost =
  async () => {

    try {

      const response =
        await getPrawasiCardCost();


      if (response.status) {

        setCardCost(
          formData.applicationStatus === 'DRAFT' ? response.data.creating_cost : formData.applicationStatus === 'OLD CARD UPDATE' ? response.data.update_cost : response.data.creating_cost,
          //response.data,
        );
      }

    } catch (error) {

      console.log(
        'CARD COST ERROR => ',
        error,
      );
    }
  };

 const handleSubmit = async () => {

  try {
    const config = await getPaymentConfig();
          if (!config.status) {
            showAlert("Error", "Unable to load payment configuration");
            setProcessingPayment(false);
            return;
          }
    const pltFormVersion   = Platform.OS === 'ios' ? config?.versions?.ios : config?.versions?.android;
    const currentVersion = DeviceInfo.getVersion();
    if (
              compareVersions(
                currentVersion,
                pltFormVersion?.minimum_version
              ) < 0
            ) {
    
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'ForceUpdateScreen',
                      params: {
                        versionData: {
                          latestVersion: pltFormVersion?.latest_version,
                          updateMessage: pltFormVersion?.update_message,
                          storeUrl: pltFormVersion?.store_url,
                          currentVersion,
                        },
                      },
                    },
                  ],
                });
              }, 300);
    
              return;
        }
    const applicationId =
      await AsyncStorage.getItem(
        'APPLICATION_ID',
      );

    const user =
      await AsyncStorage.getItem(
        'USER_DATA',
      );

    const parsedUser =
      user
        ? JSON.parse(user)
        : null;

    if (!parsedUser?.id) {

      alert(
        'User not found. Please login again.',
      );

      return;
    }

    const options = {

      description:
        'Nepal Prawasi Card Fee',

      currency: 'INR',

      key:
        config.razorpay_key_id,

      amount: Number(cardCost)*100,

      name: 'Zepali Prawasi Card',

      image:
        `${BASE_URL}/logo/zepali_foreground.png`,

      prefill: {

        email:
          parsedUser?.email_id ??
          'test@test.com',

        contact:
          parsedUser?.mobile_number ??
          '9999999999',

        name:
          parsedUser?.full_name ??
          'Prawasi User',
      },

      theme: {
        color: '#16A34A',
      },
    };


    RazorpayCheckout.open(
      options,
    )

    .then(async paymentData => {

      try {


        const response =
          await savePayment({

            application_id:
              applicationId,

            user_id:
              parsedUser.id,

            payment_id:
              paymentData
                .razorpay_payment_id,

            order_id:
              paymentData
                .razorpay_order_id,

            signature:
              paymentData
                .razorpay_signature,

            amount: cardCost,
          });


        if (response.status) {

          await AsyncStorage.removeItem(
            'APPLICATION_ID',
          );

          alert(
            'Application Submitted Successfully',
          );

        } else {

          alert(
            response.message,
          );
        }

      } catch (saveError) {

        console.log(
          'SAVE PAYMENT ERROR => ',
          saveError,
        );

        alert(
          'Payment successful but saving failed.',
        );
      }
    })

    .catch(error => {

      console.log(
        'PAYMENT FAILED => ',
        JSON.stringify(
          error,
          null,
          2,
        ),
      );

      if (error?.code === 0) {

        alert(
          'Payment Cancelled',
        );

      } else {

        alert(
          error?.description ||
          'Payment Failed',
        );
      }
    });

  } catch (error) {

    console.log(
      'SUBMIT ERROR => ',
      error,
    );

    alert(
      'Something went wrong',
    );
  }
};

  const ReviewItem = ({label, value}) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemLabel}>
        {label}
      </Text>

      <Text style={styles.itemValue}>
        {value || '-'}
      </Text>
    </View>
  );

  const ReviewImage = ({label, image}) => (
    <View style={styles.imageContainer}>

      <Text style={styles.imageLabel}>
        {label}
      </Text>

      {image?.uri ? (
        <Image
          source={{uri: image.uri}}
          style={styles.image}
        />
      ) : (
        <Text style={styles.noImage}>
          No Image Uploaded
        </Text>
      )}

    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Review Application
      </Text>
    
      {/* PAGE 1 */}

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Personal Details
        </Text>

        <ReviewImage
          label="Profile Photo"
          image={formData.profilePhoto}
        />

        <ReviewItem
          label="Full Name"
          value={formData.fullName}
        />

        <ReviewItem
        label="Gender"
        value={formData.gender}
        />

        <ReviewItem
        label="Date of Birth"
        value={formData.dob}
        />

        <ReviewItem
        label="Guardian Name"
        value={formData.guardianName}
        />

        <ReviewItem
        label="Guardian Relation"
        value={formData.guardianRelation}
        />

        <ReviewItem
          label="Mobile Number"
          value={formData.mobile}
        />

        <ReviewItem
          label="Current Address"
          value={formData.address}
        />

        <ReviewItem
          label="Zip Code"
          value={formData.zipCode}
        />

        <ReviewItem
          label="Nepal Address"
          value={formData.nepalAddress}
        />

        <ReviewItem
          label="Company Name"
          value={formData.companyName}
        />

        <ReviewItem
          label="Profession"
          value={formData.profession}
        />

      </View>

      {/* PAGE 2 */}

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Primary ID Details
        </Text>

        <ReviewItem
          label="Primary ID Type"
          value={formData.primaryIdType}
        />

        <ReviewItem
          label="Primary ID Number"
          value={formData.primaryIdNumber}
        />

        <ReviewImage
          label="Primary Front Image"
          image={formData.primaryFrontImage}
        />

        <ReviewImage
          label="Primary Back Image"
          image={formData.primaryBackImage}
        />

      </View>

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Secondary ID Details
        </Text>

        <ReviewItem
          label="Secondary ID Type"
          value={formData.secondaryIdType}
        />

        <ReviewItem
          label="Secondary ID Number"
          value={formData.secondaryIdNumber}
        />

        <ReviewImage
          label="Secondary Front Image"
          image={formData.secondaryFrontImage}
        />

        <ReviewImage
          label="Secondary Back Image"
          image={formData.secondaryBackImage}
        />

      </View>

      {/* PAGE 3 */}

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Jamani 1 Details
        </Text>

        <ReviewItem
          label="Name"
          value={formData.jamani1Name}
        />

        <ReviewItem
          label="Mobile"
          value={formData.jamani1Mobile}
        />

        <ReviewItem
          label="Citizenship No"
          value={formData.jamani1IdNumber}
        />

        <ReviewItem
          label="Relation"
          value={formData.jamani1Relation}
        />

        <ReviewImage
          label="Citizenship Image"
          image={formData.jamani1Image}
        />
        <ReviewImage
          label="Citizenship Image"
          image={formData.jamani1ImageBack}
        />

      </View>

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Jamani 2 Details
        </Text>

        <ReviewItem
          label="Name"
          value={formData.jamani2Name}
        />

        <ReviewItem
          label="Mobile"
          value={formData.jamani2Mobile}
        />

        <ReviewItem
          label="Citizenship No"
          value={formData.jamani2IdNumber}
        />

        <ReviewItem
          label="Relation"
          value={formData.jamani2Relation}
        />

        <ReviewImage
          label="Citizenship Image"
          image={formData.jamani2Image}
        />
        <ReviewImage
          label="Citizenship Image"
          image={formData.jamani2ImageBack}
        />


      </View>

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Jamani 3 Details
        </Text>

        <ReviewItem
          label="Name"
          value={formData.jamani3Name}
        />

        <ReviewItem
          label="Mobile"
          value={formData.jamani3Mobile}
        />

        <ReviewItem
          label="ID Number"
          value={formData.jamani3IdNumber}
        />

        <ReviewItem
          label="Relation"
          value={formData.jamani3Relation}
        />

        <ReviewImage
          label="ID Image"
          image={formData.jamani3Image}
        />
        <ReviewImage
          label="ID Image"
          image={formData.jamani3ImageBack}
        />
        <View style={{marginTop: 10, borderTopWidth: 1, borderColor: colors.border}} >
        <Text style={{marginTop: 10, fontSize: 18, color: colors.price, fontWeight: '600'}}>
          {(formData?.paymentStatus === 'PAID' ? 'Paid Amount' : 'Payment Amount')}: ₹{cardCost}
        </Text>
          </View>
      </View>

      {/* SUBMIT BUTTON */}

      <TouchableOpacity
        style={[styles.button, {backgroundColor: (cardCost === null || formData.applicationStatus === 'PENDING') ? '#999' : colors.primary}]}
        onPress={handleSubmit}
        disabled={(cardCost === null || formData.applicationStatus === 'PENDING') ? true : false}>
        <Text style={styles.btnText}>
          Pay and Submit Application
        </Text>

      </TouchableOpacity>

      {/* BACK BUTTON */}


    </ScrollView>
  );
};

export default ReviewPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#111',
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
    color: '#111',
  },

  itemRow: {
    marginBottom: 14,
  },

  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },

  itemValue: {
    fontSize: 16,
    color: '#111',
  },

  imageContainer: {
    marginBottom: 18,
  },

  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },

  image: {
    width: 140,
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  noImage: {
    color: '#999',
    fontStyle: 'italic',
  },

  button: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  backBtn: {
    marginTop: 18,
    alignItems: 'center',
    marginBottom: 20,
  },

  backText: {
    fontSize: 15,
    color: '#444',
  },
});