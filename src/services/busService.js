import { get, post } from '../network/apiService';
import API from '../network/apiEndpoints';
import i18n from '../localization/i18n';
import AsyncStorage from "@react-native-async-storage/async-storage";


// 🔹 SEARCH BUSES
export const searchBuses = async ({ source, destination, date }) => {
  console.log("searchBuses called with:", { source, destination, date });

  // 🔥 Prevent bad API calls
  if (!source || !destination || !date) {
    return { status: false, message: "Missing parameters" };
  }

  try {
    const response = await get(API.SEARCH_BUSES, {
      source_city_id: source,
      destination_city_id: destination,
      date: date,
      lang: i18n.locale,
    });

    console.log("searchBuses response:", response);

    return response;

  } catch (error) {
    console.log("searchBuses error:", error);
    return { status: false, message: "Something went wrong" };
  }
};


// 🔹 BOOK TICKET
export const bookBusTicket = async ({ bus_id, schedule_id, booking_date, passengers }) => {
  try {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = JSON.parse(user);
    console.log("bookBusTicket called with:", passengers);
    return await post(API.BOOK_TICKET, {
      user_id: parsedUser?.id,
      bus_id: bus_id,
      schedule_id: schedule_id,
      booking_date: booking_date,
      passengers: passengers,
    });

  } catch (error) {
    console.log("bookBusTicket error:", error);
    return { status: false, message: "Something went wrong" };
  }
};

export const getCities = async () => {
  return await get(API.GET_CITIES, {
    lang: i18n.locale,
  });
};

export const getUserBookings = async (user_id) => {
  return await get(API.GET_USER_BOOKINGS, {
    user_id: user_id,
    lang: i18n.locale,   // ✅ ADD THIS
  });
};

export const cancelBooking = async (data) => {
  console.log("API CALL - Cancel Booking with data:", data);
  return await post(API.CANCEL_BOOKING, data);
};