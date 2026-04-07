import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { getDataPacks } from "../../services/RechargeService";
import { colors } from "../../styles/globalStyles";

const DataPackList = ({ provider, number, onSelect }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    setSelectedPack(null);
    fetchPacks();
  }, [provider]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const res = await getDataPacks(provider);

      // ✅ Correct mapping from Khalti API
      setPacks(res?.detail?.packages || []);
    } catch (e) {
      console.log("Pack error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  return (
    <FlatList
      data={packs}
      keyExtractor={(item, index) => index.toString()} // ✅ FIXED
      scrollEnabled={false} // ✅ FIX VirtualizedList error
      contentContainerStyle={{ paddingBottom: 20 }}
      renderItem={({ item, index }) => {
        const isSelected = selectedPack?.index === index;

        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedPack({ ...item, index }); // ✅ store index
              onSelect && onSelect(item); // send back to parent
            }}
            style={[
              styles.card,
              isSelected && styles.activeCard,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {item.product_name}
              </Text>

              <Text style={isSelected ? styles.activeSub : styles.sub}>
                {item.short_detail}
              </Text>
            </View>

            <Text style={styles.price}>
              रु {item.amount}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default DataPackList;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activeCard: {
    backgroundColor: colors.rowSelectBackground,
    borderColor: colors.border,
  },

  title: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
  },
  

  sub: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activeSub: {
    fontSize: 12,
    color: "#940b0b",
    marginTop: 2,
  },

  price: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
});