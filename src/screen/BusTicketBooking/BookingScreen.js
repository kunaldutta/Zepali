import React, { useState, useEffect, useRef, use } from "react";
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
  createTempBooking,
  verifyBusPayment,
  updateBookingPayment,
  termsAndConditions,
} from "../../services/bookingService";
import { BASE_URL } from "../../network/apiClient";
import TermsCheckbox from "../../components/TermsCheckbox";

export default function BookingScreen({ route, navigation }) {
  const { bus, date } = route.params;
  const inputRefs = useRef([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [termsVersion, setTermsVersion] = useState(null);

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsUrl, setTermsUrl] = useState('');

  useEffect(() => {
      const showSub = Keyboard.addListener("keyboardDidShow", () => {
        setIsKeyboardVisible(true);
      });

      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setIsKeyboardVisible(false);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);
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
  useEffect(() => {
    termsAndConditions({ type: "bus_booking" })
    .then((res) => {
      console.log("Terms and conditions updated:", res);
      setTermsVersion(res?.data?.version);
      setTermsUrl(BASE_URL + res.data.content);
    })
    .catch((e) => console.log(e));
  }, []);

  const acceptTerms = () => {
    setTermsAccepted(true);
  };
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
    console.log("Booking with passengers:", passengers, "Terms accepted:", termsAccepted);
    if(!termsAccepted) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return;
    }
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

    // STEP 1: CREATE ORDER
    const orderRes = await createBookingOrder({
      amount: totalAmount,
    });

    if (!orderRes?.status || !orderRes?.order_id) {
      Alert.alert("Error", "Order creation failed");
      return;
    }

    // STEP 2: CREATE TEMP BOOKING
    const tempRes = await createTempBooking({
      user_id: parsedUser.id,
      bus_id: bus.bus_id,
      schedule_id: bus.schedule_id,
      booking_date: date,
      passengers: passengers,
      total_amount: totalAmount,
      razorpay_order_id: orderRes.order_id,
      terms_condition_version: termsVersion, // 🔥 send version or identifier of T&C
    });

    if (!tempRes?.status) {
      Alert.alert("Error", "Unable to start booking");
      return;
    }

    const transactionId = tempRes.transaction_id;

    // STEP 3: PAYMENT
    const options = {
      description: "Bus Booking",
      currency: "INR",
      key: "rzp_test_Sb1UJwd853g7gw",

      amount: orderRes.amount,
      order_id: orderRes.order_id,

      name: "Zepali", // ✅ App name

      image: BASE_URL + "/logo/zepali_foreground.png", // ✅ LOGO (IMPORTANT)

      theme: {
        color: colors.safeAreaColor, // 🔥 your primary color
      },

      prefill: {
        email: parsedUser?.email_id ?? "",
        contact: parsedUser?.mobile_number ?? "",
        name: parsedUser?.name ?? "",
      },

      notes: {
        app: "Zepali Bus Booking",
      },
    };

    RazorpayCheckout.open(options)
      .then(async (data) => {
        try {
          const verifyRes = await verifyBusPayment({
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
            transaction_id: transactionId,
          });

          if (!verifyRes?.status) {
            throw new Error("Verification failed");
          }

          Alert.alert("Success 🎉", "Booking Confirmed");

        } catch (err) {
          Alert.alert(
            "Error",
            "Payment done but booking verification failed"
          );
        }
      })
      .catch(async (error) => {

          console.log("PAYMENT FAILED:", error?.code);

          // 🔥 update backend
          await updateBookingPayment({
            transaction_id: transactionId,
            status: "FAILED"
          });

          Alert.alert("Failed", "Payment failed or cancelled");
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // ✅ IMPORTANT
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              padding: 0,
              backgroundColor: colors.background,
              flex: 1,
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 8, left: 10, top: 5 }}>
              {i18n.t("BOOKING_FOR_BUS", {
                bus: bus.operator_name,
              })}
            </Text>

            <FlatList
              data={passengers}
              keyExtractor={(_, i) => i.toString()}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{
                paddingBottom: keyboardHeight + 20,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    marginBottom: 15,
                    width: "96%",
                    left: "2%",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    elevation: 2,
                  }}
                >
                  {passengers.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removePassenger(index)}
                      activeOpacity={0.7}
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 10,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",

                        elevation: 5,     // Android
                        zIndex: 999,      // iOS + Android
                      }}
                    >
                      <Text style={{ fontSize: 15, color: "#add207", fontWeight: "bold" }}>X</Text>
                    </TouchableOpacity>
                  )}

                  <Text>Passenger {index + 1}</Text>

                  <TextInput
                      placeholder={i18n.t("NAME") || "Name"}
                      ref={(ref) => (inputRefs.current[`${index}-name`] = ref)}
                      value={item.name}
                      onChangeText={(text) =>
                        updatePassenger(index, "name", text)
                      }
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        inputRefs.current[`${index}-age`]?.focus();
                      }}
                      style={[globalStyles.input, { height: 45, paddingVertical: 0, textAlignVertical: 'center', top: 15 }]}
                    />

                  <TextInput
                      placeholder={i18n.t("AGE") || "Age"}
                      ref={(ref) => (inputRefs.current[`${index}-age`] = ref)}
                      keyboardType="numeric"
                      value={item.age}
                      onChangeText={(text) =>
                        updatePassenger(index, "age", text)
                      }
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        inputRefs.current[`${index}-phone`]?.focus();
                      }}

                      style={[globalStyles.input, { height: 45, paddingVertical: 0, textAlignVertical: 'center', top: 12 }]}
                    />

                  <TextInput
                    placeholder={i18n.t("PHONE_NUMBER") || "Phone Number"}
                    ref={(ref) => (inputRefs.current[`${index}-phone`] = ref)}
                    keyboardType="phone-pad"
                    value={item.phone}
                    onChangeText={(text) =>
                      handlePhoneChange(index, text)
                    }

                    returnKeyType="done"

                    onSubmitEditing={() => {
                      if (index < passengers.length - 1) {
                        inputRefs.current[`${index + 1}-name`]?.focus();
                      } else {
                        Keyboard.dismiss();
                      }
                    }}

                    style={[globalStyles.input, { height: 45, paddingVertical: 0, textAlignVertical: 'center', top: 10 }]}
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
                      { marginTop: 5, justifyContent: "center", top: 8, width: 150 },
                    ]}
                  >
                    <Text
                      style={{
                        color: item.gender
                          ? "#000"
                          : colors.placeholderTextColor, fontSize: 12,
                      }}
                    >
                      {item.gender || i18n.t("SELECT_GENDER") || "Select Gender"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
              {keyboardHeight === 0 && (<View style={{ height: '22%', marginBottom: 0, width: '100%', backgroundColor: colors.safeAreaColor }} >
            <View style={{ height: 10, top: 0 }} />
            <TermsCheckbox
              accepted={termsAccepted}
              setAccepted={setTermsAccepted}
              onOpenTerms={() => {
                if (termsUrl) {
                  navigation.navigate("WebViewScreen", { url: termsUrl });
                } else {
                  //alert("Terms not available");
                }
              }}
            />
            
            <View style={[globalStyles.bottomShadow,{marginBottom: 1, width: '90%', left: '5%', top: 2}]} >
                        <TouchableOpacity
                        style={[globalStyles.button, { height: 40, padding:6, width: '100%' }]}
                          onPress={addPassenger}
                        >
                          <Text style={globalStyles.buttonText}>{i18n.t("ADD_PASSENGER")}</Text>
                        </TouchableOpacity>
                        </View>

            <View style={{ height: 10 }} />
            <View style={[globalStyles.bottomShadow,{marginBottom: 10, width: '90%', left: '5%'}]} >
                        <TouchableOpacity
                        style={[globalStyles.button, { height: 40, padding:6, width: '100%' }]}
                          onPress={bookTicket}
                        >
                          <Text style={globalStyles.buttonText}>{i18n.t("BOOK_NOW")}</Text>
                        </TouchableOpacity>
                        </View>
            </View>)}
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