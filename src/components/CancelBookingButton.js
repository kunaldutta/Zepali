import React from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelBooking } from "../services/busService";
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

export default function CancelBookingButton({
  bookingId,
  status,
  refundStatus,
  onSuccess,   // callback after cancel
  style
}) {
  const [loading, setLoading] = React.useState(false);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this ticket?\n\nRefund will be processed as per policy.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          onPress: confirmCancel
        }
      ]
    );
  };

  const confirmCancel = async () => {
    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem("USER_DATA");


      const res = await cancelBooking({
        booking_id: bookingId,
        app_version: DeviceInfo.getVersion(),
        platform: Platform.OS,
      });

      if (res?.status) {
        Alert.alert(
          "Success",
          `Booking cancelled.\nRefund: ₹${res.refund_amount}`
        );

        onSuccess && onSuccess(); // 🔄 refresh parent
      } else {
        Alert.alert("Error", res?.message || "Failed to cancel");
      }
    } catch (e) {
      if (e?.message?.includes('Network Error')|| e?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
          }
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Hide button if already cancelled
  if (status === "Cancelled") return null;

  // ⏳ Show processing state
  if (refundStatus === "PROCESSING") {
    return (
      <Text style={{ color: "orange", marginTop: 10 }}>
        Refund Processing...
      </Text>
    );
  }

  return (
    <TouchableOpacity
      style={[
        {
          marginTop: 10,
          backgroundColor: "#ff3b30",
          padding: 10,
          borderRadius: 6,
          alignItems: "center",
          opacity: loading ? 0.6 : 1
        },
        style
      ]}
      disabled={loading}
      onPress={handleCancel}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Cancel Ticket
        </Text>
      )}
    </TouchableOpacity>
  );
}