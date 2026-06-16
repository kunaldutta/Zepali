import React, {createContext, useState, useContext} from 'react';
import {getUserPointsAPI} from '../services/userCreditPointsServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PointsContext = createContext();

export const PointsProvider = ({children}) => {
  const [points, setPoints] = useState(0);
  const [rupees, setRupees] = useState(0);

  // 🔥 MAIN FUNCTION
  const fetchUserPoints = async (user_id) => {
    try {
      const res = await getUserPointsAPI({user_id});

      if (res?.status) {
        setPoints(res?.data.total_points);
        setRupees(res?.data.rupees);

        const existingUser = await AsyncStorage.getItem('USER_DATA');

        const oldData = existingUser ? JSON.parse(existingUser) : {};

        const updatedUser = {
          ...oldData,
          ...res?.data?.user_details,
        };

        await AsyncStorage.setItem(
          'USER_DATA',
          JSON.stringify(updatedUser),
        );
        console.log('UPDATED USER ===',updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.log("Points Error:", error);
    }
  };

  return (
    <PointsContext.Provider
      value={{
        points,
        rupees,
        fetchUserPoints,
      }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);