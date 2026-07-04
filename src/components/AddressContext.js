import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  fetchAddressesAPI,
  addAddressAPI,
  deleteAddressAPI,
} from '../services/productService';

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [selectedAddress, setSelectedAddressState] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  /* ================= INIT ================= */
  useEffect(() => {
    loadUser();
    loadSavedAddress();
  }, []);

  /* ================= LOAD USER ================= */
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("USER_DATA");
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (parsedUser?.id) {
        setUserId(parsedUser.id);

        // ✅ FIX: call immediately (no timing issue)
        fetchAddresses();
      }
    } catch (err) {
      console.log("User load error:", err);
      setError("Failed to load user data");
    }
  };

  /* ================= LOAD SAVED ADDRESS ================= */
  const loadSavedAddress = async () => {
    try {
      const saved = await AsyncStorage.getItem("SELECTED_ADDRESS");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedAddressState(parsed);
      }
    } catch (err) {
      console.log("Load saved address error:", err);
    }
  };

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async (idParam) => {
    let id = idParam || userId;

    if (!id) {
      const userData = await AsyncStorage.getItem("USER_DATA");
      const parsedUser = userData ? JSON.parse(userData) : null;
      id = parsedUser?.id;
    }

    if (!id) {
      return;
    }

    setAddressLoading(true);
    setError(null);

    try {
      const response = await fetchAddressesAPI();

      if (response?.success) {
        const addressList = response.addresses || [];

        if (addressList.length === 0) {
          setAddresses([]);
          setSelectedAddressState(null);
          setError("No addresses found");
          return;
        }

        const sorted = [...addressList].sort((a, b) =>
          b.default_value.localeCompare(a.default_value)
        );

        setAddresses(sorted);

        const defaultAddr =
          sorted.find(addr => addr.default_value === 'Y') || sorted[0];

        setSelectedAddressState(prev => {
          if (prev) {
            const exists = sorted.find(addr => addr.id === prev.id);
            if (exists) {
              saveSelectedAddress(exists);
              return exists;
            }
          }

          saveSelectedAddress(defaultAddr);
          return defaultAddr;
        });

      } else {
        setError(response?.message || "Failed to fetch addresses");
        setAddresses([]);
        setSelectedAddressState(null);
      }

    } catch (error) {
      if (error?.message?.includes('Network Error')) {
        setError(error.response?.data?.message || "Server error");
        return;
      }
      if (error?.response) {
        setError(error.response?.data?.message || "Server error");
      } else if (error?.request) {
        setError("No internet connection");
      } else {
        setError("Something went wrong");
      }

      setAddresses([]);
      setSelectedAddressState(null);

    } finally {
      setAddressLoading(false);
    }
  };

  /* ================= ADD ADDRESS ================= */
  const addAddress = async (data) => {
    try {
      const response = await addAddressAPI(data);

      if (response?.success) {
        await fetchAddresses(); // refresh list
      }

      return response;
    } catch (error) {
      console.log("Add Address ERROR:", error);
      throw error;
    }
  };

  /* ================= DELETE ADDRESS ================= */
  const deleteAddress = async (address) => {
    try {
      const response = await deleteAddressAPI({
        user_id: address.usr_id,
        address_id: address.id,
      });

      if (response?.success) {
        await fetchAddresses(); // refresh list
      }

      return response;
    } catch (error) {
      console.log("Delete Address ERROR:", error);
      throw error;
    }
  };

  /* ================= SET + SAVE ================= */
  const updateSelectedAddress = async (address) => {
    setSelectedAddressState(address);
    await saveSelectedAddress(address);
  };

  const saveSelectedAddress = async (address) => {
    try {
      await AsyncStorage.setItem(
        "SELECTED_ADDRESS",
        JSON.stringify(address)
      );
    } catch (err) {
      console.log("Save address error:", err);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        selectedAddress,
        setSelectedAddress: updateSelectedAddress,
        addresses,
        fetchAddresses,
        addAddress,
        deleteAddress,
        addressLoading,
        error,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);