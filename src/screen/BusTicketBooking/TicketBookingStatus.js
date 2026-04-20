import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import { getUserBookings } from "../../services/busService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, colors } from "../../styles/globalStyles";
import i18n from "../../localization/i18n";
import AppHeader from "../../components/AppHeader";
import { useNavigation } from "@react-navigation/native";
import CancelBookingButton from "../../components/CancelBookingButton";

export default function TicketBookingStatus() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    loadBookings();
  }, []);

  // ✅ Helper for language
  const t = (obj) => obj?.[i18n.locale] || obj?.en || "";

  const loadBookings = async () => {
    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;

    try {
      const res = await getUserBookings(parsedUser?.id);

      if (res?.status) {
        setBookings(res.data || []);
      }
    } catch (error) {
      console.log("Booking Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPassenger = (p, index) => (
    <View key={index} style={styles.passenger}>
      <Text style={globalStyles.title}>👤 {p.name}</Text>
      <View style={{flexDirection:'row', alignItems:'center'}}>
            <Text style={globalStyles.sideLabel}>
                {i18n.t("AGE") || "Age"}: </Text> 
            <Text style={globalStyles.label}> {p.age}</Text>
        </View>

        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Text style={globalStyles.sideLabel}>
                {i18n.t("GENDER") || "Gender"}:  </Text> 
            <Text style={globalStyles.label}> {p.gender}</Text>
        </View>
      
      <Text style={[globalStyles.sideLabel, { marginTop: 15 }]}>📞 {p.phone}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={[styles.title,]}>
        🚌 {item?.bus_name} ({item?.bus_type})
      </Text>

      {/* ✅ Bus Number */}
      
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Text style={globalStyles.sideLabel}>
             {i18n.t("BUS_NO") || "Bus No"}: </Text> 
        <Text style={globalStyles.label}> {item?.bus_number}</Text>
      </View>

      {/* ✅ Operator (MULTI LANG FIX) */}
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Text style={globalStyles.sideLabel}>
            {i18n.t("OPERATOR") || "Operator"}: </Text> 
        <Text style={[globalStyles.label,{numberOfLines: 2, width: '80%'}]}> {t(item?.operator_name)}</Text>
        
      </View>
      

      {/* ✅ Route (MULTI LANG FIX) */}
      <View style={{flexDirection:'row', alignItems:'center'}}>
      <Text style={globalStyles.sideLabel}>
        {t(item?.source)} → {t(item?.destination)}
      </Text>
      </View>

      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Text style={globalStyles.sideLabel}>
            {i18n.t("TOTAL") || "Total"}: </Text> 
        <Text style={globalStyles.label}> ₹{item?.total_amount}</Text>
      </View>
      

        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Text style={globalStyles.sideLabel}>
                {i18n.t("PASSENGERS") || "Passengers"}: </Text> 
            <Text style={globalStyles.label}> {item?.total_passengers}</Text>
        </View>

      {/* ✅ Operator Phone */}
      <View style={{flexDirection:'row', alignItems:'center'}}>
            <Text style={globalStyles.sideLabel}>
                {i18n.t("OPERATOR_PHONE") || "Operator Phone"}: </Text> 
            <Text style={globalStyles.label}> {item?.operator_phone}</Text>
        </View>
      
    <View style={{flexDirection:'row', alignItems:'center', backgroundColor: item.status === "Confirmed" ? "#0dc714" : "#d21e2d", padding: 5, borderRadius: 5, marginTop: 10}}>
      <Text
        style={[
          globalStyles.sideLabel,
          item.status === "Confirmed"
            ? [globalStyles.sideLabel, { color: "white", marginLeft: 15 }]
            : [globalStyles.sideLabel, { color: "white", marginLeft: 15 }],
        ]}
      >
        {item.status}
      </Text>
      </View>

        
      <Text style={globalStyles.sideLabel}>
        {i18n.t("PASSENGERS") || "Passengers"}:
      </Text>

      {item.passengers?.map(renderPassenger)}

      <CancelBookingButton
        bookingId={item.booking_id}
        status={item.status}
        refundStatus={item.refund_status}
        onSuccess={loadBookings}
      />
    </View>
  );

  // ✅ Loader
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ✅ Empty State
  if (!bookings.length) {
    return (
      <View style={styles.center}>
        <Text>{i18n.t("NO_BOOKINGS") || "No Bookings Found"}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title={i18n.t("TICKET_BOOKING_STATUS") || "Ticket Booking Status"}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
    
      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.booking_id.toString()}
        contentContainerStyle={{ paddingBottom: 35, paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={false}
        backgroundColor={colors.background}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 3
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  },
  label: {
    fontSize: 14,
    marginTop: 2
  },
  status: {
    marginTop: 5,
    fontWeight: "bold"
  },
  confirmed: {
    color: "green"
  },
  pending: {
    color: "orange"
  },
  subTitle: {
    marginTop: 10,
    fontWeight: "bold"
  },
  passenger: {
    marginTop: 5,
    padding: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 6
  },
  passengerText: {
    fontSize: 13
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});