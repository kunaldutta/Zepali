import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import i18n from "../../localization/i18n";
import { globalStyles, colors } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RazorpayCheckout from "react-native-razorpay";

import {
  createBookingOrder,
  bookingInit,
  updateBookingPayment,
  confirmBooking,
  createTempBooking,
  refundDirect,
  refundBooking
} from "../../services/bookingService";

export default function BookingScreen({ route, navigation }) {
  const { bus, date } = route.params;

  const [passengers, setPassengers] = useState([
    { name: "", age: "", gender: "", phone: "" },
  ]);
  console.log("Initial passengers state:", date);
  const [genderModal, setGenderModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // ✅ NEW: Same number checkbox
  const [sameNumberForAll, setSameNumberForAll] = useState(true);

  // ✅ keyboard
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ Update passenger
  const updatePassenger = (index, key, value) => {
    const updated = [...passengers];
    updated[index][key] = value;
    setPassengers(updated);
  };

  // ✅ NEW: phone handler
  const handlePhoneChange = (index, value) => {
    const updated = [...passengers];

    if (sameNumberForAll && index === 0) {
      updated.forEach((p) => (p.phone = value));
    } else {
      updated[index].phone = value;
    }

    setPassengers(updated);
  };

  // ✅ Toggle checkbox
  const toggleSameNumber = () => {
    const newValue = !sameNumberForAll;
    setSameNumberForAll(newValue);

    if (newValue) {
      const firstPhone = passengers[0]?.phone || "";
      const updated = passengers.map((p) => ({
        ...p,
        phone: firstPhone,
      }));
      setPassengers(updated);
    }
  };

  // ✅ Add passenger
  const addPassenger = () => {
    const firstPhone = passengers[0]?.phone || "";

    setPassengers([
      ...passengers,
      {
        name: "",
        age: "",
        gender: "",
        phone: sameNumberForAll ? firstPhone : "",
      },
    ]);
  };

  const removePassenger = (index) => {
    const updated = passengers.filter((_, i) => i !== index);
    setPassengers(updated);
  };

  const validatePassengers = () => {
    return passengers.every(
      (p) =>
        p.name?.trim() &&
        p.age &&
        p.gender &&
        p.phone &&
        p.phone.length >= 10
    );
  };

  const bookTicket = async () => {
  if (!validatePassengers()) {
    Alert.alert("Error", "Please fill all passenger details properly");
    return;
  }

  try {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = user ? JSON.parse(user) : null;

    if (!parsedUser?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    const totalAmount = bus.price * passengers.length;

    // =========================
    // STEP 1: CREATE ORDER
    // =========================
    const orderRes = await createBookingOrder({
      amount: totalAmount,
    });

    console.log("ORDER RESPONSE:", orderRes);

    if (!orderRes?.status || !orderRes?.order_id) {
      Alert.alert("Error", "Order creation failed");
      return;
    }

    // =========================
    // 🔥 STEP 2: SAVE TEMP BOOKING (IMPORTANT)
    // =========================
    const tempRes = await createTempBooking({
      user_id: parsedUser.id,
      bus_id: bus.bus_id,
      schedule_id: bus.schedule_id,
      booking_date: date,
      passengers: passengers,
      total_amount: totalAmount,
      razorpay_order_id: orderRes.order_id,
    });

    if (!tempRes?.status) {
      Alert.alert("Error", "Unable to start booking. Try again.");
      return;
    }

    // =========================
    // STEP 3: OPEN RAZORPAY
    // =========================
    const options = {
      description: "Bus Booking",
      currency: "INR",
      key: "rzp_test_Sb1UJwd853g7gw",
      amount: orderRes.amount,
      order_id: orderRes.order_id,
      name: "Zepali",
      prefill: {
        email: parsedUser?.email_id ?? "",
        contact: parsedUser?.mobile_number ?? "",
      },
      theme: { color: colors.primary },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
    };

    RazorpayCheckout.open(options)

      // =========================
      // ✅ SUCCESS
      // =========================
      .then(async (data) => {
        console.log("PAYMENT SUCCESS:", data);

        let bookingId = null;

        try {
          // =========================
          // STEP 4: CREATE BOOKING (fallback if webhook delayed)
          // =========================
          const bookingRes = await bookingInit({
            user_id: parsedUser.id,
            bus_id: bus.bus_id,
            schedule_id: bus.schedule_id,
            booking_date: date,
            total_passengers: passengers.length,
            total_amount: totalAmount,
            razorpay_order_id: data.razorpay_order_id,
          });

          if (!bookingRes?.status) {
            throw new Error("Booking init failed");
          }

          bookingId = bookingRes.booking_id;

          // =========================
          // STEP 5: UPDATE PAYMENT
          // =========================
          const paymentRes = await updateBookingPayment({
            booking_id: bookingId,
            status: "SUCCESS",
            payment_id: data.razorpay_payment_id,
          });

          if (!paymentRes?.status) {
            throw new Error("Payment update failed");
          }

          // =========================
          // STEP 6: INSERT PASSENGERS
          // =========================
          const passengerRes = await confirmBooking({
            booking_id: bookingId,
            passengers: passengers,
          });

          if (!passengerRes?.status) {
            throw new Error("Passenger insert failed");
          }

          // =========================
          // ✅ SUCCESS FLOW
          // =========================
          Alert.alert(
            "Booking Pending",
            "Your booking is under review. Admin will confirm shortly."
          );

        } catch (err) {
          console.log("CRITICAL ERROR AFTER PAYMENT:", err);

          // =========================
          // 🔥 REFUND LOGIC
          // =========================
          try {
            if (bookingId) {
              await refundBooking({ booking_id: bookingId });
            } else {
              await refundDirect({
                payment_id: data.razorpay_payment_id,
                amount: totalAmount,
              });
            }

            Alert.alert(
              "Refund Initiated",
              "Something went wrong. Amount will be refunded shortly."
            );

          } catch (refundErr) {
            console.log("REFUND FAILED:", refundErr);

            Alert.alert(
              "Error",
              "Payment done but refund failed. Please contact support."
            );
          }
        }
      })

      // =========================
      // ❌ FAILED / CANCELLED
      // =========================
      .catch((error) => {
        console.log("PAYMENT FAILED:", error);

        if (error?.code === 0) {
          Alert.alert("Cancelled", "Payment cancelled");
        } else {
          Alert.alert("Failed", "Payment failed. Try again");
        }
      });

  } catch (error) {
    console.log("MAIN ERROR:", error);
    Alert.alert("Error", "Something went wrong");
  }
};

  const openGenderModal = (index) => {
    setSelectedIndex(index);
    setGenderModal(true);
  };

  const selectGender = (gender) => {
    if (selectedIndex !== null) {
      updatePassenger(selectedIndex, "gender", gender);
    }
    setGenderModal(false);
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title={i18n.t("BUS_SERVICE") || "BUS SERVICE"}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              padding: 20,
              backgroundColor: colors.background,
              flex: 1,
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              {i18n.t("BOOKING_FOR_BUS", {
                bus: bus.operator_name,
              })}
            </Text>

            <FlatList
              data={passengers}
              keyExtractor={(_, i) => i.toString()}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: keyboardHeight + 20,
                flexGrow: 1,
              }}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    marginBottom: 15,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    elevation: 2,
                  }}
                >
                  {passengers.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removePassenger(index)}
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                        elevation: 4,
                      }}
                    >
                      <Text style={{ fontSize: 18, color: "red" }}>✕</Text>
                    </TouchableOpacity>
                  )}

                  <Text>Passenger {index + 1}</Text>

                  <TextInput
                    placeholder="Name"
                    value={item.name}
                    onChangeText={(text) =>
                      updatePassenger(index, "name", text)
                    }
                    style={[globalStyles.input, { marginTop: 10, fontSize: 12 }]}
                    placeholderTextColor={colors.placeholderTextColor}
                  />

                  <TextInput
                    placeholder="Age"
                    keyboardType="numeric"
                    value={item.age}
                    onChangeText={(text) =>
                      updatePassenger(index, "age", text)
                    }
                    style={[globalStyles.input, { marginTop: 15, fontSize: 12 }]}
                    placeholderTextColor={colors.placeholderTextColor}
                  />

                  <TextInput
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={item.phone}
                    onChangeText={(text) =>
                      handlePhoneChange(index, text)
                    }
                    editable={!sameNumberForAll || index === 0}
                    style={[globalStyles.input, { marginTop: 15, height: 45, fontSize: 12 }]}
                    placeholderTextColor={colors.placeholderTextColor}
                  />

                  {/* ✅ Checkbox only on first passenger */}
                  {index === 0 && passengers.length > 1 && (
                    <TouchableOpacity
                      onPress={toggleSameNumber}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 1,
                          borderColor: "#333",
                          marginRight: 8,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: sameNumberForAll
                            ? "#333"
                            : "#fff",
                        }}
                      >
                        {sameNumberForAll && (
                          <Text style={{ color: "#fff" }}>✓</Text>
                        )}
                      </View>

                      <Text>Same number for all</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => openGenderModal(index)}
                    style={[
                      globalStyles.input,
                      { marginTop: 15, justifyContent: "center" },
                    ]}
                  >
                    <Text
                      style={{
                        color: item.gender
                          ? "#000"
                          : colors.placeholderTextColor, fontSize: 12,
                      }}
                    >
                      {item.gender || "Select Gender"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <View style={[globalStyles.bottomShadow,{marginBottom: 2}]} >
                        <TouchableOpacity
                        style={[globalStyles.button, { height: 40, padding:6 }]}
                          onPress={addPassenger}
                        >
                          <Text style={globalStyles.buttonText}>Book Now</Text>
                        </TouchableOpacity>
                        </View>
            {/* <Button title="Add Passenger" onPress={addPassenger} /> */}
            <View style={{ height: 10 }} />
            <View style={[globalStyles.bottomShadow,{marginBottom: 2}]} >
                        <TouchableOpacity
                        style={[globalStyles.button, { height: 40, padding:6 }]}
                          onPress={bookTicket}
                        >
                          <Text style={globalStyles.buttonText}>Book Now</Text>
                        </TouchableOpacity>
                        </View>
            {/* <Button title="Confirm Booking" onPress={bookTicket} /> */}

            <Modal visible={genderModal} transparent animationType="fade">
              <TouchableWithoutFeedback onPress={() => setGenderModal(false)}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      padding: 20,
                      borderRadius: 10,
                      width: "80%",
                    }}
                  >
                    {["MALE", "FEMALE", "TRANSGENDER"].map((g) => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => selectGender(g)}
                        style={{
                          paddingVertical: 12,
                          borderBottomWidth: 0.5,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}