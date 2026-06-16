import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";

import { getDataPacks } from "../../services/RechargeService";
import { colors } from "../../styles/globalStyles";
import Ionicons from 'react-native-vector-icons/Ionicons';

const DataPackList = ({ provider, number, onSelect }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedPack(null);
    fetchPacks();
  }, [provider]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const res = await getDataPacks(provider);
      setPacks(res?.detail?.packages || []);
    } catch (e) {
      console.log("Pack error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER LOGIC
  const filteredPacks = useMemo(() => {
    if (!search) return packs;

    const query = search.toLowerCase();

    return packs.filter((item) => {
      return (
        item.product_name?.toLowerCase().includes(query) ||
        item.short_detail?.toLowerCase().includes(query) ||
        String(item.amount).includes(query)
      );
    });
  }, [search, packs]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
            {/* ✅ SEARCH BAR */}
            <View style={styles.searchContainer}>
        {/* Input FIRST */}
        <TextInput
          placeholder="Search packs (e.g. 1GB, 199...)"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={colors.placeholderTextColor || "#999"}
        />

        {/* 🔍 Search Icon (RIGHT SIDE) */}
        <Ionicons
          name="search"
          size={18}
          color="#666"
          style={{ marginLeft: 6 }} // ✅ spacing from input
        />

        {/* ❌ Clear Button */}
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#e36f6f" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPacks}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No packs found</Text>
        )}
        renderItem={({ item }) => {
          // ✅ FIXED SELECTION LOGIC (NO INDEX)
          const isSelected =
            selectedPack?.product_name === item.product_name &&
            selectedPack?.amount === item.amount;

          return (
            <TouchableOpacity
              onPress={() => {
                setSelectedPack(item); // ✅ FIXED
                onSelect && onSelect(item);
              }}
              style={[
                styles.card,
                isSelected && styles.activeCard,
                {
                  elevation: isSelected ? 4 : 1,
                  height: 80,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { fontSize: 12 }]}>
                  {item.product_name}
                </Text>

                <Text
                  style={[
                    isSelected ? styles.activeSub : styles.sub,
                    { fontSize: 10 },
                  ]}
                >
                  {item.short_detail}
                </Text>
              </View>

              <Text style={[styles.price, { fontSize: 13 }]}>
                रु {item.amount}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default DataPackList;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    height: 44,
    elevation: 2,
  },
  searchInput: {
    flex: 1, // ✅ VERY IMPORTANT
    fontSize: 14,
    color: "#000",
    paddingVertical: 0,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },

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
    color: "#000",
  },

  sub: {
    color: "#666",
    marginTop: 2,
  },

  activeSub: {
    color: "#940b0b",
    marginTop: 2,
  },

  price: {
    fontWeight: "bold",
    color: "#000",
  },
});