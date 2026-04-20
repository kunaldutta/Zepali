import React, { useState, useRef, useEffect } from "react";
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
  Keyboard,
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

  const handleRecharge = () => {
  if (number.length !== 10) {
    setAlertVisible(true);
    setAlertTitle("Invalid");
    setAlertMessage("Enter valid 10-digit number");
    return;
  }

  if (mode === "datapack" && !selectedPack) {
    setAlertVisible(true);
    setAlertTitle("Select Pack");
    setAlertMessage("Please select a data pack");
    return;
  }

  if (mode === "topup" && (!amount || amount < 20 || amount > 25000)) {
    setAlertVisible(true);
    setAlertTitle("Invalid");
    setAlertMessage("Enter amount between 20 and 25000");
    return;
  }

  // ✅ Prepare payload here
  let payload;

  if (mode === "topup") {
    payload = {
      type: "topup",
      number,
      amount,
      provider,
      remarks: "Topup",
    };
  } else {
    payload =
      provider === "ncell"
        ? {
            type: "datapack",
            number,
            provider,
            product_code: selectedPack.product_code,
            amount: selectedPack.amount,
            remarks: "Data Pack",
            packDetails: selectedPack,
          }
        : {
            type: "datapack",
            number,
            provider,
            package_id: selectedPack.package_id,
            amount: selectedPack.amount,
            remarks: "Data Pack",
            packDetails: selectedPack,
          };
  }

  // ✅ Navigate instead of API call
  navigation.navigate("RechargeConfirm", { payload });
};

  const ProviderBtn = ({ label, value }) => (
    <TouchableOpacity
      style={[
        globalStyles.providerBtn,
        provider === value && globalStyles.activeProvider,
        {height: 30, paddingVertical: 0, justifyContent: "center", marginTop: 0}
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
       {height: 30, paddingVertical: 0, justifyContent: "center", marginTop: 0}
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

          {/* MODE SWITCH */}
          <View style={styles.providerRow}>
            <PlanBtn label="Top-Up" value="topup" />
            <PlanBtn label="Data Pack" value="datapack" />
          </View>

          {/* Provider */}
          <View style={[styles.providerRow, {marginTop: 5}]}>
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
              setKeyboardHeight(10);
            }}
            keyboardType="numeric"
            maxLength={10}
              style={[globalStyles.input, {height: 40,               // ✅ FIXED HEIGHT (IMPORTANT)
                  paddingVertical: 0,       // ✅ prevents jump
                  textAlignVertical: 'center',} ]}
            scrollEnabled={false}
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
            style={[globalStyles.input, {height: 40,               // ✅ FIXED HEIGHT (IMPORTANT)
                paddingVertical: 0,       // ✅ prevents jump
                textAlignVertical: 'center',marginBottom: 5} ]}
            scrollEnabled={false}
          />
          {(failureReason?.amount) && (
            <Text style={{ color: "red", marginTop: 1 }}>
              Invalid amount
            </Text>
          )}
          {selectedPack&&(
            <Text style={{ color: "#b05c0e", marginTop: 0, marginBottom: 5, fontWeight:"600", fontSize: 12 }}>
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
      {keyboardHeight === 0 && (
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
      </View>)}
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
    marginBottom: 10,
    height: 30, // ✅ FIXED HEIGHT
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