import apiClient from './apiClient';

export const get = async (
  url,
  params = {},
) => {

  try {

    const response =
      await apiClient.get(url, {
        params: params,
      });

    console.log(
      'GET API:',
      url,
      params,
    );

    return response.data;

  } catch (error) {

    console.log(
      'API ERROR:',
      error,
    );

    throw error;
  }
};

export const post = async (
  url,
  data = {},
  isFormData = false,
) => {

  try {

    const config = {};

    // FOR IMAGE UPLOAD APIs

    if (isFormData) {

      config.headers = {
        'Content-Type':
          'multipart/form-data',
      };

    }

    const response =
      await apiClient.post(
        url,
        data,
        config,
      );

    return response.data;

  } catch (error) {

    console.log(
      'POST API ERROR:',
      error,
    );

    throw error;
  }
};