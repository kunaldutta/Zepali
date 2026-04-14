import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { searchBuses } from "../../services/busService"; // ✅ updated import
import i18n from "../../localization/i18n";
import { globalStyles, colors } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { stringify } from "uuid";

export default function BusListScreen({ route, navigation }) {
  const { source, destination, date } = route.params;

  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBuses();
  }, []);

  // 🔹 Load buses
  const loadBuses = async () => {
    setLoading(true);

    try {
      const res = await searchBuses({
        source,
        destination,
        date,
      });

      if (res?.status) {
        console.log("Buses found:", res.data);
        setBusList(res.data || []);
      } else {
        setBusList([]);
      }
    } catch (error) {
      console.log("Bus load error:", error);
      setBusList([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loader
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔹 Empty state
  if (!busList.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No buses available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title={i18n.t("BUS_SERVICE") || "BUS SERVICE"}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
      <View style={{
            padding: 20,
            backgroundColor: colors.background,
            flex: 1,
        }}>
        <FlatList
          data={busList}
          keyExtractor={(item) => item.schedule_id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 10,
                borderBottomWidth: 0,
                borderColor: "#dad8d8",
              }}
            >
              <View style={{backgroundColor: '#fff', padding: 8, borderRadius: 8, elevation: 3}}>
              <Text style={{ fontWeight: "bold" }}>
                {item.operator_name}
              </Text>

              <Text>{item.bus_type}</Text>

              <Text style={globalStyles.dateTimeText}>₹ {item.price}</Text>

              <Text>
                <Text style={globalStyles.dateTimeText}>Date:</Text> {date}{'\n'}
                <Text style={globalStyles.dateTimeText}>Time:</Text> {item.departure_time} - {item.arrival_time}
              </Text>

              <Text>Seats left: {item.available_seats}</Text>

              <View style={{ marginTop: 8 }}>
                
                <View style={[globalStyles.bottomShadow,{marginTop: 25}]} >
                <TouchableOpacity
                style={[globalStyles.button, { height: 40, padding:6 }]}
                  onPress={() =>
                    navigation.navigate("BookingScreen", { bus: item, date: date })
                  }
                >
                  <Text style={globalStyles.buttonText}>Book Now</Text>
                </TouchableOpacity>
                </View>
                </View>
                </View>
            </View>
            
          
          )}
        />
    </View>
     </SafeAreaView>
  );
}