import React, {createContext, useState, useContext} from 'react';
import {getUserPointsAPI} from '../services/userCreditPointsServices';

const PointsContext = createContext();

export const PointsProvider = ({children}) => {
  const [points, setPoints] = useState(0);
  const [rupees, setRupees] = useState(0);

  // 🔥 MAIN FUNCTION
  const fetchUserPoints = async (user_id) => {
    console.log('USER_ID ==',user_id)
    try {
      const res = await getUserPointsAPI({user_id});

      if (res?.status) {
        setPoints(res.data.total_points);
        setRupees(res.data.rupees);
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