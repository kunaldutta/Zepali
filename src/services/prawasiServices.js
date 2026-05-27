import AsyncStorage
from '@react-native-async-storage/async-storage';

import {get,post}
from '../network/apiService';

import API
from '../network/apiEndpoints';

const convertDOB = dob => {

  if (!dob) {
    return '';
  }

  const parts = dob.split('/');

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export const savePersonalDetails =
  async formData => {

    try {

      const user =
        await AsyncStorage.getItem(
          'USER_DATA',
        );

      const parsedUser =
        JSON.parse(user);

      // ✅ APPLICATION ID
      const applicationId =
        await AsyncStorage.getItem(
          'APPLICATION_ID',
        );

      const data = new FormData();

      console.log(
        'Saving personal details with data:',
        formData,
      );

      console.log(
        'Saving personal details with data-for_whom:',
        formData.for_whom,
      );

      /* =========================
         USER
      ========================= */

      data.append(
        'user_id',
        parsedUser.id,
      );

      // ✅ FOR UPDATE DRAFT

      if (applicationId) {

        data.append(
          'application_id',
          applicationId,
        );
      }

      /* =========================
         FOR WHOM
      ========================= */

      data.append(
        'for_whom',
        formData.for_whom,
      );

      /* =========================
         PERSONAL DETAILS
      ========================= */

      data.append(
        'full_name',
        formData.fullName,
      );

      data.append(
        'gender',
        formData.gender,
      );

      data.append(
        'dob',
        convertDOB(formData.dob),
      );

      data.append(
        'guardian_name',
        formData.guardianName,
      );

      data.append(
        'guardian_relation',
        formData.guardianRelation,
      );

      data.append(
        'mobile',
        formData.mobile,
      );

      data.append(
        'current_address',
        formData.address,
      );

      data.append(
        'nepal_address',
        formData.nepalAddress,
      );

      data.append(
        'company_name',
        formData.companyName,
      );

      data.append(
        'profession',
        formData.profession,
      );

      /* =========================
         PROFILE PHOTO
      ========================= */

      if (formData.profilePhoto) {

        data.append(
          'profile_photo',
          {
            uri:
              formData.profilePhoto.uri,

            type:
              formData.profilePhoto.type,

            name:
              formData.profilePhoto
                .fileName ||
              'profile.jpg',
          },
        );
      }

      /* =========================
         API CALL
      ========================= */

      return await post(
        API.SAVE_PERSONAL_DETAILS,
        data,
        true,
      );

    } catch (error) {

      console.log(
        'savePersonalDetails ERROR => ',
        error,
      );

      throw error;
    }
  };

  export const getPersonalDetails =
  async applicationId => {

    try {

      return await get(
        `${API.GET_PERSONAL_DETAILS}?application_id=${applicationId}`,
      );

    } catch (error) {

      console.log(
        'getPersonalDetails ERROR => ',
        error,
      );

      throw error;
    }
  };

  export const saveIdDetails =
  async formData => {

    try {

      const applicationId =
        await AsyncStorage.getItem(
          'APPLICATION_ID',
        );

      const data = new FormData();

      data.append(
        'application_id',
        applicationId,
      );

      // PRIMARY ID

      data.append(
        'primary_id_type',
        formData.primaryIdType,
      );

      data.append(
        'primary_id_number',
        formData.primaryIdNumber,
      );

      // SECONDARY ID

      data.append(
        'secondary_id_type',
        formData.secondaryIdType,
      );

      data.append(
        'secondary_id_number',
        formData.secondaryIdNumber,
      );

      // PRIMARY FRONT

      if (
        formData.primaryFrontImage
      ) {

        data.append(
          'primary_front_image',
          {
            uri:
              formData
                .primaryFrontImage.uri,

            type:
              formData
                .primaryFrontImage.type,

            name:
              formData
                .primaryFrontImage
                .fileName ||
              'primary_front.jpg',
          },
        );
      }

      // PRIMARY BACK

      if (
        formData.primaryBackImage
      ) {

        data.append(
          'primary_back_image',
          {
            uri:
              formData
                .primaryBackImage.uri,

            type:
              formData
                .primaryBackImage.type,

            name:
              formData
                .primaryBackImage
                .fileName ||
              'primary_back.jpg',
          },
        );
      }

      // SECONDARY FRONT

      if (
        formData.secondaryFrontImage
      ) {

        data.append(
          'secondary_front_image',
          {
            uri:
              formData
                .secondaryFrontImage.uri,

            type:
              formData
                .secondaryFrontImage.type,

            name:
              formData
                .secondaryFrontImage
                .fileName ||
              'secondary_front.jpg',
          },
        );
      }

      // SECONDARY BACK

      if (
        formData.secondaryBackImage
      ) {

        data.append(
          'secondary_back_image',
          {
            uri:
              formData
                .secondaryBackImage.uri,

            type:
              formData
                .secondaryBackImage.type,

            name:
              formData
                .secondaryBackImage
                .fileName ||
              'secondary_back.jpg',
          },
        );
      }

      return await post(
        API.SAVE_ID_DETAILS,
        data,
        true,
      );

    } catch (error) {

      console.log(
        'saveIdDetails ERROR => ',
        error,
      );

      throw error;
    }
  };

  export const getIdDetails =
    async applicationId => {

      try {

        return await get(
          `${API.GET_ID_DETAILS}?application_id=${applicationId}`,
        );

      } catch (error) {

        console.log(
          'getIdDetails ERROR => ',
          error,
        );

        throw error;
      }
  };

  export const saveJamaniDetails =
  async formData => {

    try {

      const applicationId =
        await AsyncStorage.getItem(
          'APPLICATION_ID',
        );

      const data = new FormData();

      data.append(
        'application_id',
        applicationId,
      );

      // JAMANI 1

      data.append(
        'jamani1_name',
        formData.jamani1Name,
      );

      data.append(
        'jamani1_mobile',
        formData.jamani1Mobile,
      );

      data.append(
        'jamani1_id_type',
        formData.jamani1IdType,
      );

      data.append(
        'jamani1_id_number',
        formData.jamani1IdNumber,
      );

      data.append(
        'jamani1_relation',
        formData.jamani1Relation,
      );

      // JAMANI 2

      data.append(
        'jamani2_name',
        formData.jamani2Name,
      );

      data.append(
        'jamani2_mobile',
        formData.jamani2Mobile,
      );

      data.append(
        'jamani2_id_type',
        formData.jamani2IdType,
      );

      data.append(
        'jamani2_id_number',
        formData.jamani2IdNumber,
      );

      data.append(
        'jamani2_relation',
        formData.jamani2Relation,
      );

      // JAMANI 3

      data.append(
        'jamani3_name',
        formData.jamani3Name,
      );

      data.append(
        'jamani3_mobile',
        formData.jamani3Mobile,
      );

      data.append(
        'jamani3_id_type',
        formData.jamani3IdType,
      );

      data.append(
        'jamani3_id_number',
        formData.jamani3IdNumber,
      );

      data.append(
        'jamani3_relation',
        formData.jamani3Relation,
      );

      // IMAGE HELPER

      const appendImage = (
        key,
        image,
      ) => {

        if (image?.uri) {

          data.append(key, {
            uri: image.uri,
            type:
              image.type ||
              'image/jpeg',
            name:
              image.fileName ||
              `${key}.jpg`,
          });
        }
      };

      // JAMANI 1 IMAGES

      appendImage(
        'jamani1_front_image',
        formData.jamani1Image,
      );

      appendImage(
        'jamani1_back_image',
        formData.jamani1ImageBack,
      );

      // JAMANI 2 IMAGES

      appendImage(
        'jamani2_front_image',
        formData.jamani2Image,
      );

      appendImage(
        'jamani2_back_image',
        formData.jamani2ImageBack,
      );

      // JAMANI 3 IMAGES

      appendImage(
        'jamani3_front_image',
        formData.jamani3Image,
      );

      appendImage(
        'jamani3_back_image',
        formData.jamani3ImageBack,
      );

      return await post(
        API.SAVE_JAMANI_DETAILS,
        data,
        true,
      );

    } catch (error) {

      console.log(
        'saveJamaniDetails ERROR => ',
        error,
      );

      throw error;
    }
  };

  export const getJamaniDetails =
  async applicationId => {

    try {

      return await get(
        `${API.GET_JAMANI_DETAILS}?application_id=${applicationId}`,
      );

    } catch (error) {

      console.log(
        'getJamaniDetails ERROR => ',
        error,
      );

      throw error;
    }
  };

  export const savePayment =
  async data => {

    try {

      const formData =
        new FormData();

      Object.keys(data).forEach(
        key => {

          formData.append(
            key,
            data[key],
          );
        },
      );

      console.log(
        'Saving payment with data:',
        data,
      );

      return await post(

        API.SAVE_APPLICATION_PAYMENT,

        formData,

        true // IMPORTANT

      );

    } catch (error) {

      console.log(
        'savePayment ERROR => ',
        error,
      );

      throw error;
    }
  };

  // ===============================
// prawasiServices.js
// ===============================

export const getMyApplications =
  async user_id => {

    try {

      return await get(
        `${API.GET_MY_APPLICATIONS}?user_id=${user_id}`
      );

    } catch (error) {

      console.log(
        'getMyApplications ERROR => ',
        error,
      );

      throw error;
    }
  };

  export const getPrawasiCardCost =
  async () => {

    try {

      return await get(
        API.GET_PRAWASI_CARD_COST
      );

    } catch (error) {

      console.log(
        'getPrawasiCardCost ERROR => ',
        error,
      );

      throw error;
    }
  };