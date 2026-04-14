import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { getCities } from "../../services/busService";
import i18n from "../../localization/i18n";
import { globalStyles, colors } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import CitySelectionModal from './CitySelectionModal';

export default function BusSearchScreen({ navigation }) {
  const [cities, setCities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
const [modalType, setModalType] = useState(null); // 'source' or 'destination'

  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  // 🔹 Date states
  const [dateObj, setDateObj] = useState(new Date());
  const [date, setDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadCities();
    formatDate(new Date());
  }, []);

  // 🔹 Format date to YYYY-MM-DD
  const formatDate = (selectedDate) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    const formatted = `${day}-${month}-${year}`;
    setDate(formatted);
  };

  // 🔹 Load cities
  const loadCities = async () => {
    try {
      const res = await getCities();
      if (res?.status) {
        setCities(res.data || []);
      }
    } catch (error) {
      console.log("Cities error:", error);
    }
  };

  // 🔹 Date change handler
  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");

    if (selectedDate) {
      setDateObj(selectedDate);
      formatDate(selectedDate);
    }
  };

  const swapCities = () => {
  setSource(destination);
  setDestination(source);
  };

  // 🔹 Search
  const handleSearch = () => {
    if (!source || !destination) {
      Alert.alert("Error", "Please select source and destination");
      return;
    }

    if (source === destination) {
      Alert.alert("Error", "Source and destination cannot be same");
      return;
    }

    navigation.navigate("BusListScreen", {
      source,
      destination,
      date,
    });
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title={i18n.t("BUS_SERVICE") || "BUS SERVICE"}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />

      <View style={styles.container}>
        <View style={{ position: "relative" }}>
        {/* SOURCE */}
        <Text style={styles.label}>Source</Text>
        <View style={[globalStyles.pickerBox,{height: 45, alignContent: 'center', elevation: 5,}]} >
          <TouchableOpacity
          onPress={() => {
            setModalType('source');
            setModalVisible(true);
          }}
          style={[
            globalStyles.pickerBox,
            {
              width: '95%',
              left: '5%',
              height: '100%',
              justifyContent: 'center',
              borderWidth: 0,
              flexDirection: 'row',          // 👈 IMPORTANT
              alignItems: 'center',
              justifyContent: 'space-between', // 👈 space between text & arrow
              paddingHorizontal: 10,
            },
          ]}
        >
          {/* Text */}
          <Text style={{ fontSize: 14, color: source ? '#000' : '#999' }}>
            {source
              ? cities.find((c) => c.id === source)?.name
              : 'Select Source'}
          </Text>

          {/* Arrow */}
          <Text style={{ fontSize: 16, color: '#555' }}>▼</Text>
        </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={swapCities}
          style={{
            position: 'absolute',
            right: 20,
            top: 88, // 👈 adjust based on your UI
            zIndex: 10,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 50,
            elevation: 5,
            borderWidth: 1,
            borderColor: '#ddd',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>⇅</Text>
        </TouchableOpacity>
        {/* DESTINATION */}
        <Text style={[styles.label, { marginTop: 45 }]}>Destination</Text>
        <View style={[globalStyles.pickerBox,{height: 45, alignContent: 'center', elevation: 5,}]} >
          <TouchableOpacity
            onPress={() => {
              setModalType('destination');
              setModalVisible(true);
            }}
            style={[
              globalStyles.pickerBox,
              {
                width: '95%',
                left: '5%',
                height: '100%',
                justifyContent: 'center',
                borderWidth: 0,
                flexDirection: 'row',          // 👈 IMPORTANT
                alignItems: 'center',
                justifyContent: 'space-between', // 👈 space between text & arrow
                paddingHorizontal: 10,
              },
            ]}
          >
            <Text style={{ fontSize: 14, color: destination ? '#000' : '#999' }}>
              {destination
                ? cities.find((c) => c.id === destination)?.name
                : 'Select Destination'}
            </Text>
            <Text style={{ fontSize: 16, color: '#555' }}>▼</Text>
          </TouchableOpacity>
        </View>
            </View>
        {/* DATE PICKER */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={globalStyles.dateBox}
          onPress={() => setShowPicker(true)}
        >
          <Text>{date || "Select Date"}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            minimumDate={new Date()} // 🔥 prevent past dates
            onChange={onChangeDate}
          />
        )}
        <CitySelectionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          cities={cities}
          selected={modalType === 'source' ? source : destination}
          type={modalType}
          onSelect={(item) => {
            if (modalType === 'source') {
              setSource(item.id);
            } else {
              setDestination(item.id);
            }
          }}
        />

        {/* SEARCH BUTTON */}
      
        <View style={[globalStyles.bottomShadow,{marginTop: 25}]} >
                    <TouchableOpacity
                    style={[globalStyles.button, { height: 45 }]}
                      onPress={handleSearch}
                    >
                      <Text style={globalStyles.buttonText}>Search Buses</Text>
                    </TouchableOpacity>
                    </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
    flex: 1,
  },
  label: {
    marginTop: 15,
    fontWeight: "bold",
  }
});