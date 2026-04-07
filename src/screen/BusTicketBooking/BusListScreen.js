import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  ActivityIndicator,
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
            padding: 12,
            borderBottomWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            {item.operator_name}
          </Text>

          <Text>{item.bus_type}</Text>

          <Text>₹ {item.price}</Text>

          <Text>
            {item.departure_time} - {item.arrival_time}
          </Text>

          <Text>Seats left: {item.available_seats}</Text>

          <View style={{ marginTop: 8 }}>
            <Button
              title="Book Now"
              onPress={() =>
                navigation.navigate("BookingScreen", { bus: item })
              }
            />
          </View>
        </View>
       
      )}
    />
    </View>
     </SafeAreaView>
  );
}