import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";

import { rechargeMobile, buyDataPack } from "../../services/RechargeService";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, colors } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import i18n from "../../localization/i18n";
import CustomAlert from "../../components/CustomAlert";

// ✅ IMPORT YOUR COMPONENT
import DataPackList from "./DataPackList";

const RechargeScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("ntc");
  const [loading, setLoading] = useState(false);
  const [failureReason, setFailureReason] = useState(null);

  // ✅ NEW STATES
  const [mode, setMode] = useState("topup"); // topup | datapack
  const [selectedPack, setSelectedPack] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("success"); // success | error
  const [alertVisible, setAlertVisible] = useState(false);

  const handleRecharge = async () => {
  if (number.length !== 10) {
    Alert.alert("Invalid", "Enter valid 10-digit number");
    return;
  }

  // ✅ Data Pack validation
  if (mode === "datapack" && !selectedPack) {
    Alert.alert("Select Pack", "Please select a data pack");
    return;
  }

  if (mode === "topup" && !amount) {
    Alert.alert("Invalid", "Enter amount");
    return;
  }

  try {
    setLoading(true);

    let res;

    // ✅ DIFFERENT API BASED ON MODE
    if (mode === "topup") {
      const payload = {
        number,
        amount,
        provider,
        remarks: "Topup",
      };

      res = await rechargeMobile(payload);

      if (res?.data?.status) {
      Alert.alert("Success", "Recharge Successful");
      setNumber("");
      setAmount("");
      setSelectedPack(null);
    } else {
      setFailureReason(res?.data?.details || "Recharge failed");
      if (res?.data?.details?.amount) {
        setAlertVisible(true);
        setAlertTitle("Failed");
        setAlertMessage("Invalid amount");
        
      }else if (res?.data?.details?.number) {
        
        setAlertVisible(true);
        setAlertTitle("Failed");
        setAlertMessage("Invalid number");
      } else {
       
        setAlertVisible(true);
        setAlertTitle("Failed");
        setAlertMessage(failureReason);
      }
    }


    } else {
      const payload = provider === "ncell" ? {
        number,
        provider,
        product_code: selectedPack.product_code, // ✅ IMPORTANT
        remarks: "Data Pack",
        amount: selectedPack.amount, // ✅ send pack amount
      }: {
        number,
        provider,
        package_id: selectedPack.package_id, // ✅ IMPORTANT
        remarks: "Data Pack",
        amount: selectedPack.amount, // ✅ send pack amount
      };
      console.log("Buying pack with payload:", payload);
      res = await buyDataPack(payload); // ✅ HERE YOU USE IT

      if (res?.status) {
        let successMessage = "Data Pack Purchased, it will be activated shortly";
        setAlertVisible(true);
        setAlertTitle("success");
        setAlertMessage(successMessage);
        setNumber("");
        setSelectedPack(null);
      }else {
        setAlertVisible(true);
        setAlertTitle("Error");
        setAlertMessage("Its failed, Something went wrong");
      }
    }

    // ✅ Common response handling
    
  } catch (err) {
    Alert.alert("Error", "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  const ProviderBtn = ({ label, value }) => (
    <TouchableOpacity
      style={[
        globalStyles.providerBtn,
        provider === value && globalStyles.activeProvider,
      ]}
      onPress={() => {
        setAmount("");
        setSelectedPack(null);
        setProvider(value)}}
    >
      <Text
        style={{
          color: provider === value ? "#fff" : "#333",
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  const PlanBtn = ({ label, value }) => (
    <TouchableOpacity
      style={[
        globalStyles.providerBtn,
        mode === value && globalStyles.activeProvider,
      ]}
      onPress={() => {
        setMode(value);
        setSelectedPack(null);
        setFailureReason(null);
        setAmount("");
      }}
    >
      <Text
        style={{
          color: mode === value ? "#fff" : "#333",
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // ✅ HANDLE PACK SELECT
  const handlePackSelect = (pack) => {
    console.log("Selected Pack:", pack);
    setSelectedPack(pack);
    setAmount(String(pack.amount)); // autofill amount
    
    //setMode("topup"); // hide list
    scrollRef.current?.scrollTo({
    y: 0,
    animated: true,
  });
  };

  const renderContent = () => (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
          title={i18n.t("RECHARGE") || "RECHARGE"}
          onBackPress={() => navigation.goBack()}
          showCart={false}
        />
      {/* ✅ SCROLLABLE CONTENT */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
      >
        

        <View style={globalStyles.centerContainer}>
          {console.log('Selected Pack in UI ===', failureReason?.number)}
          <Text style={globalStyles.title2}>
            {i18n.t("MOBILE_RECHARGE_AND_TOP_UP") ||
              "Mobile Recharge And Top Up"}
          </Text>

          {/* MODE SWITCH */}
          <View style={styles.providerRow}>
            <PlanBtn label="Top-Up" value="topup" />
            <PlanBtn label="Data Pack" value="datapack" />
          </View>

          {/* Provider */}
          <View style={styles.providerRow}>
            <ProviderBtn label="NTC" value="ntc" />
            <ProviderBtn label="Ncell" value="ncell" />
            {mode === "topup" && (
              <ProviderBtn label="Khalti" value="khalti" />
            )}
          </View>

          {/* Inputs */}
          <TextInput
            placeholder= {mode !== "topup" ? i18n.t("ENTER_MOBILE") || "Enter Mobile No." : i18n.t("ENTER_MOBILE_KHALTI") || "Enter Mobile No./ Khalti ID"}
            placeholderTextColor={colors.placeholderTextColor}
            value={number}
            onChangeText={(text) => {
              setNumber(text);
              setFailureReason(null);
            }}
            keyboardType="numeric"
            maxLength={10}
            style={[globalStyles.input, {marginBottom: failureReason?.number ? 1 : 15} ]}
          />
          {(failureReason?.number) && (
            <Text style={{ color: "red", marginTop: 1 }}>
              Invalid number
            </Text>
          )}
          <TextInput
            placeholder={mode === "topup" ? i18n.t("ENTER_AMOUNT") || "Enter Amount (20 - 25000)" : i18n.t("SELECT_PACK") || "Select Recharge Pack"}
            placeholderTextColor={colors.placeholderTextColor}
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setFailureReason(null);
            }}
            keyboardType="numeric"
            editable={mode === "topup"}
            style={[globalStyles.input, {marginBottom:failureReason?.amount ? 1 : 15, marginTop: failureReason?.number ? 10 : 0} ]}
          />
          {(failureReason?.amount) && (
            <Text style={{ color: "red", marginTop: 1 }}>
              Invalid amount
            </Text>
          )}
          {selectedPack&&(
            <Text style={{ color: "#312929", marginTop: 0, marginBottom: 5, fontWeight:"600" }}>
            Selected Pack: {selectedPack?.product_name}{"\n"}Validity: {selectedPack?.validity}
            </Text>
          )}
          {/* Data Pack */}
          {mode === "datapack" && (
            <DataPackList
              provider={provider}
              number={number}
              onSelect={handlePackSelect}
            />
          )}
        </View>
      </ScrollView>

      {/* ✅ FIXED BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[globalStyles.button, { width: "90%", marginLeft: "5%" }]}
          onPress={handleRecharge}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.buttonText}>
              {i18n.t("RECHARGE_NOW") || "Recharge Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onOk={() => {
          setAlertVisible(false);
        }}
      />


    </View>
);

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={["top"]}>
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </SafeAreaView>
  );
};

export default RechargeScreen;

const styles = StyleSheet.create({
  providerRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },
});