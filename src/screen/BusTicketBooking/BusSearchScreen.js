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

export default function BusSearchScreen({ navigation }) {
  const [cities, setCities] = useState([]);

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

    const formatted = `${year}-${month}-${day}`;
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
        <View style={globalStyles.pickerBox}>
          <Picker
            selectedValue={source}
            onValueChange={(value) => setSource(value)}
            dropdownIconColor="#000"
            style={{
            color: 'black',
            backgroundColor: '#fff',  // 👈 add this
          }}
          >
            <Picker.Item label="Select Source" value={null} />
            {cities.map((item) => (
              <Picker.Item
                key={item.id}
                label={item.name}
                value={item.id}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          onPress={swapCities}
          style={{
            position: 'absolute',
            right: 20,
            top: 92, // 👈 adjust based on your UI
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
        <View style={[globalStyles.pickerBox, { marginBottom: 15 }]}>
          <Picker
            selectedValue={destination}
            onValueChange={(value) => setDestination(value)}
            dropdownIconColor="#000"
            style={{
            color: 'black',
            backgroundColor: '#fff',  // 👈 add this
          }}
          >
            <Picker.Item label="Select Destination" value={null} />
            {cities.map((item) => (
              <Picker.Item
                key={item.id}
                label={item.name}
                value={item.id}
              />
            ))}
          </Picker>
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

        {/* SEARCH BUTTON */}
        <View style={{ marginTop: 20 }}>
          <Button title="Search Buses" onPress={handleSearch} />
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