import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { rechargeMobile, buyDataPack } from "../../services/RechargeService";
import {
  calculateAmount,
  createPayment,
  createRazorpayOrder,
  verifyRechargePayment,
  updatePaymentStatus
} from "../../services/paymentService";

import { colors, globalStyles } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import CustomAlert from "../../components/CustomAlert";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from "react-native-razorpay";
import i18n from "../../localization/i18n";
import { BASE_URL } from "../../network/apiClient";

const RechargeConfirm = ({ route, navigation }) => {
  const { payload } = route.params;
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [finalAmount, setFinalAmount] = useState(0);
  const [platformCharge, setPlatformCharge] = useState(0);

  useEffect(() => {
    fetchCalculation();
  }, []);

  const fetchCalculation = async () => {
    try {
      setLoading(true);

      const res = await calculateAmount({
        amount_npr: payload.amount
      });

      if (res?.status) {
        setFinalAmount(Number(res.amount_inr || 0));
        setPlatformCharge(Number(res.charge || 0));
      } else {
        showError(res?.message || "Calculation failed");
      }

    } catch (e) {
      console.log("CALC ERROR:", e);
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => {
    setAlertTitle("Error");
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const user = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = user ? JSON.parse(user) : null;
      console.log("USER DATA:", parsedUser);
      // ✅ USER VALIDATION
      if (!parsedUser?.id) {
        showError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      // ✅ CREATE TRANSACTION
      const paymentRes = await createPayment({
        amount_npr: payload.amount,
        user_id: parsedUser.id,
        recharge_type: payload.type,
        number: payload.number
      });

      if (!paymentRes?.status) {
        showError(paymentRes?.message || "Payment init failed");
        setLoading(false);
        return;
      }

      const txnId = paymentRes.transaction_id;

      // ✅ CREATE ORDER
      const orderRes = await createRazorpayOrder({
        amount_inr: paymentRes.final_amount,
        transaction_id: txnId
      });

      if (!orderRes?.status) {
        showError("Order creation failed");
        setLoading(false);
        return;
      }

      // ✅ RAZORPAY OPTIONS
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

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      };

      RazorpayCheckout.open(options)

        // ✅ SUCCESS
        .then(async (data) => {
          console.log("PAYMENT SUCCESS:", data);

          try {
            const verifyRes = await verifyRechargePayment({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              transaction_id: txnId
            });

            // 🔥 IMPORTANT FIX
            if (!verifyRes?.status) {

              await updatePaymentStatus({
                transaction_id: txnId,
                status: "FAILED"
              });

              showError("Payment verification failed");
              return;
            }

            // ✅ RECHARGE
            let rechargeRes;

            if (payload.type === "topup") {
              rechargeRes = await rechargeMobile({
                ...payload,
                transaction_id: txnId
              });
            } else {
              rechargeRes = await buyDataPack({
                ...payload,
                transaction_id: txnId
              });
            }

            if (rechargeRes?.status) {
              setAlertTitle("Success");
              setAlertMessage(rechargeRes?.state === 'Queued' ? "Recharge is being processed" : "Recharge Successful");
            } else {
              setAlertTitle("Pending");
              setAlertMessage("If your Recharge failed We will process for your refund soon.");
            }

            setAlertVisible(true);

          } catch (err) {
            console.log("POST PAYMENT ERROR:", err);
            showError("Something went wrong after payment");
          } finally {
            setLoading(false);
          }
        })

        // ❌ FAILED / CANCELLED
        .catch(async (error) => {
            console.log("PAYMENT FAILED:", error);

            const status = error?.code === 0 ? 'CANCELLED' : 'FAILED';

            try {
              await updatePaymentStatus({
                transaction_id: txnId,
                status: status
              });
            } catch (e) {
              console.log("STATUS UPDATE ERROR:", e);
            }

            if (status === 'CANCELLED') {
              setAlertTitle("Cancelled");
              setAlertMessage("Payment cancelled");
            } else {
              setAlertTitle("Failed");
              setAlertMessage("Payment failed. Try again");
            }

          setAlertVisible(true);
          setLoading(false);
        });

    } catch (e) {
      console.log("ERROR:", e);
      showError("Something went wrong");
      setLoading(false);
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
            <Text style={styles.label}>Recharge Amount (NPR): </Text>
            <Text style={styles.value}>रु {payload.amount}</Text>
          </View>
          <View style={styles.row}>
          <Text style={styles.label}>Payable Amount (INR)</Text>
          <Text style={styles.value}>₹ {finalAmount}</Text>
          </View>

          <View style={styles.row}>
          <Text style={styles.label}>Platform Charge</Text>
          <Text style={styles.value}>₹ {platformCharge}</Text>
          </View>

          <View style={styles.row}>
          <Text style={styles.label}>Total Payable</Text>
          <Text style={styles.amount}>
            ₹ {(finalAmount + platformCharge).toFixed(2)}
          </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
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
    width: "100%",
    backgroundColor: colors.background,
  },


  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    color: colors.primary,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },

  amount: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.price,
    marginTop: 5,
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