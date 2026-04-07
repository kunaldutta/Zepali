import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, colors } from '../../styles/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../localization/i18n';
import AppHeader from '../../components/AppHeader';
import { BASE_URL } from '../../network/apiClient';

import { removeFromWishlistAPI, getWishlistAPI } from '../../services/wishlistService';

const WishlistScreen = ({navigation}) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // ✅ GET USER
  const loadUser = async () => {
    const user = await AsyncStorage.getItem("USER_DATA");
    const parsed = JSON.parse(user);
    setUserId(parsed?.id);
  };

  // ✅ FETCH WISHLIST (same API)
  const fetchWishlist = async () => {
  try {
    setLoading(true);

    const response = await getWishlistAPI();

    if (response?.status) {
      setWishlist(response.wishlist || []);
    } else {
      console.log("Wishlist API error:", response?.message);
      setWishlist([]);
    }

  } catch (error) {
    console.log('Wishlist Error:', error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const onRefresh = useCallback(() => {
    fetchWishlist();
  }, [userId]);

  // ✅ REMOVE ITEM
  const handleRemove = async (item) => {
    console.log("Attempting to remove item:", item);
    try {
      const response = await removeFromWishlistAPI(item.wishlist_id);

      if (response?.status) {
        // ✅ REMOVE FROM UI
        setWishlist(prev =>
          prev.filter(w => w.wishlist_id !== item.wishlist_id)
        );
      } else {
        Alert.alert("Error", response?.message || "Failed to remove");
      }

    } catch (e) {
      console.log("Remove error:", e);
    }
  };

  // ✅ ITEM UI
  const renderItem = ({ item }) => {
    const savedAmount =
      (parseFloat(item.price) - parseFloat(item.final_price)).toFixed(2);

    return (
      <TouchableOpacity
      onPress={()=>{
        console.log('Selected variant ==', item);
        navigation.navigate("ProductDetailScreen",{
            productId:item.product_id,
            colorCode: item.color,
            size: item.size
        })}}    
       style={styles.card}>
        <Image source={{ uri: BASE_URL + item.image }} style={styles.image} resizeMode="contain" />

        <View style={styles.details}>
          <Text numberOfLines={2} style={styles.name}>
            {item.product_name}
          </Text>

          <View style={styles.row}>
            <Text style={styles.meta}>Size: {item.size}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.finalPrice}>₹{item.final_price}</Text>
            <Text style={styles.oldPrice}>₹{item.price}</Text>
          </View>

          {item.offer_percent > 0 && (
            <Text style={styles.saving}>
              Save ₹{savedAmount} ({item.offer_percent}% OFF)
            </Text>
          )}
        </View>

        {/* ❤️ REMOVE */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => handleRemove(item)}
        >
          <Ionicons name="heart" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
        {/* HEADER */}
      <AppHeader
        title={i18n.t('WISHLIST') || 'Wishlist'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
    <View style={styles.container}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.wishlist_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Your wishlist is empty ❤️
              </Text>
            </View>
          )
        }
      />
    </View>
    </SafeAreaView>
  );
};

export default WishlistScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },

  details: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  meta: {
    fontSize: 12,
    color: '#555',
  },

  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  finalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },

  oldPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },

  saving: {
    fontSize: 12,
    color: 'green',
    marginTop: 4,
  },

  wishlistBtn: {
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});