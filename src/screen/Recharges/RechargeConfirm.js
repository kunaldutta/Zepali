import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  rechargeMobile,
  buyDataPack,
} from "../../services/RechargeService";

import {
  calculateAmount,
  createPayment,
  createRazorpayOrder,
  verifyRechargePayment,
  updatePaymentStatus,
} from "../../services/paymentService";

import { colors, globalStyles } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import CustomAlert from "../../components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RazorpayCheckout from "react-native-razorpay";
import { BASE_URL } from "../../network/apiClient";

const RechargeConfirm = ({ route, navigation }) => {
  const { payload } = route.params;

  console.log("Payload:", payload);

  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [finalAmount, setFinalAmount] = useState(0);
  const [platformCharge, setPlatformCharge] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCalculation();
  }, []);

  const showAlert = (title, msg) => {
    setAlertTitle(title);
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const fetchCalculation = async () => {
    try {
      setLoading(true);

      const res = await calculateAmount({
        amount_npr: payload.amount,
      });

      if (res?.status) {
        const amount = Number(res.amount_inr || 0);
        const charge = Number(res.charge || 0);

        setFinalAmount(amount);
        setPlatformCharge(charge);
        setTotalAmount(amount + charge);
      } else {
        showAlert("Error", res?.message || "Calculation failed");
      }
    } catch (e) {
      showAlert("Error", "Failed to calculate amount");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (loading || processingPayment) return;

    setProcessingPayment(true);

    try {
      const user = await AsyncStorage.getItem("USER_DATA");
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser?.id) {
        showAlert("Error", "User not found. Please login again.");
        setProcessingPayment(false);
        return;
      }

      // ✅ STEP 1: Create transaction
      const paymentRes = await createPayment({
        amount_npr: payload.amount,
        user_id: parsedUser.id,
        recharge_type: payload.type,
        number: payload.number,

        package_id: payload.package_id ?? "",
        product_code: payload.product_code ?? "",

        // 🔥 ADD THIS LINE
        provider: payload.provider,
      });

      if (!paymentRes?.status) {
        showAlert("Error", paymentRes?.message || "Payment init failed");
        setProcessingPayment(false);
        return;
      }

      const txnId = paymentRes.transaction_id;

      // ✅ STEP 2: Create Razorpay order
      const orderRes = await createRazorpayOrder({
        amount_inr: paymentRes.final_amount,
        transaction_id: txnId,
      });

      if (!orderRes?.status) {
        showAlert("Error", "Order creation failed");
        setProcessingPayment(false);
        return;
      }

      // ✅ STEP 3: Razorpay Checkout
      const options = {
        description: "Recharge Payment",
        currency: "INR",
        key: "rzp_test_Sb1UJwd853g7gw",
        amount: orderRes.amount,
        order_id: orderRes.order_id,
        name: "Zepali",
        image: `${BASE_URL}/logo/zepali_foreground.png`,
        prefill: {
          email: parsedUser?.email_id ?? "",
          contact: parsedUser?.mobile_number ?? "",
        },
        theme: { color: colors.safeAreaColor },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          try {
            // ✅ STEP 4: Verify payment
            const verifyRes = await verifyRechargePayment({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              transaction_id: txnId,
            });

            if (!verifyRes?.status) {
              showAlert(
                "Verification Failed",
                "Payment verification failed. If amount was deducted, refund will be processed."
              );
              return;
            }

            // ✅ SUCCESS
            showAlert(
              "Payment Successful",
              "Your payment is successful. Recharge is being processed."
            );

          } catch (err) {
            showAlert(
              "Processing Error",
              "Payment done but processing failed. Please contact support."
            );
          } finally {
            setProcessingPayment(false);
          }
        })

        .catch((error) => {
          const status = error?.code === 0 ? "CANCELLED" : "FAILED";

          showAlert(
            status === "CANCELLED" ? "Cancelled" : "Failed",
            status === "CANCELLED"
              ? "Payment cancelled"
              : "Payment failed. Try again"
          );

          setProcessingPayment(false);
        });

    } catch (e) {
      showAlert("Error", "Something went wrong");
      setProcessingPayment(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title="Confirm Recharge"
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <View style={styles.container}>
        <View style={styles.subContainer}>
          <View style={styles.card}>
            <Text style={styles.label}>Mobile Number</Text>
            <Text style={styles.value}>{payload.number}</Text>

            <Text style={styles.label}>Provider</Text>
            <Text style={styles.value}>
              {payload.provider.toUpperCase()}
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>Recharge (NPR)</Text>
              <Text style={styles.value}>रु {payload.amount}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Amount (INR)</Text>
              <Text style={styles.value}>₹ {finalAmount}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Platform Charge</Text>
              <Text style={styles.value}>₹ {platformCharge}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Total Payable</Text>
              <Text style={styles.amount}>
                ₹ {totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleConfirm}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirm & Pay</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onOk={() => {
          setAlertVisible(false);
          if (alertTitle === "Success") {
            navigation.popToTop();
          }
        }}
      />
    </SafeAreaView>
  );
};


export default RechargeConfirm;

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: colors.primary,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  amount: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.price,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});