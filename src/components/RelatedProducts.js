// components/RelatedProducts.js

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

import { getCategoryProducts } from '../services/productService';
import { BASE_URL } from '../network/apiClient';
import { globalStyles, colors } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';

function RelatedProducts({ categoryId, currentProductId, navigation, cartItem }) {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const hasFetchedRef = useRef(false);
  const MAX_DISPLAY = 5;

  /* ================= FETCH ================= */
  useEffect(() => {
  if (categoryId && !hasFetchedRef.current) {
    hasFetchedRef.current = true;
    loadProducts();
  }
}, [categoryId]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const user = await AsyncStorage.getItem('USER_DATA');
      let parsedUser = user ? JSON.parse(user) : null;
      const cityData = await AsyncStorage.getItem('SELECTED_CITY');
      const userCity = cityData ? JSON.parse(cityData) : null;

      const res = await getCategoryProducts(
        categoryId,
        i18n.locale,
        parsedUser?.country_code,
        userCity?.id
      );

      if (res?.status) {

        const list = res.products || [];

        // ✅ SET CATEGORY NAME (MAIN FIX)
        if (list.length > 0) {
          setCategoryName(list[0].category_name);
        }

        if (cartItem && cartItem.length > 0) {

          const filtered = list.map(p => {

            if (!cartItem.some(c => c.product_id == p.id)) {
              return p;
            }

            const updatedColors = (p.colors || []).filter(colorObj => {
              return !cartItem.some(
                c =>
                  c.product_id == p.id &&
                  c.color.toLowerCase() === colorObj.color.toLowerCase()
              );
            });

            return {
              ...p,
              colors: updatedColors
            };

          }).filter(p => p.colors.length > 0);

          setProducts(filtered);

        } else {

          const filtered = list.filter(
            p => String(p.id) !== String(currentProductId)
          );

          setProducts(filtered);
        }

      }

    } catch (e) {
      console.log("RELATED ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */

  const getLowestData = (item) => {
    let lowestPrice = Infinity;
    let selectedColor = null;

    item?.colors?.forEach(c => {
      const prices = c?.variants?.map(v => Number(v.price)) || [];
      const min = Math.min(...prices);

      if (min < lowestPrice) {
        lowestPrice = min;
        selectedColor = c;
      }
    });

    return {
      price: lowestPrice,
      image: selectedColor?.images?.[0],
      color: selectedColor?.color
    };
  };

  const handlePress = (item, color) => {

    const currentRoute = navigation.getState()?.routes?.slice(-1)[0]?.name;

    if (currentRoute === 'ProductDetailScreen') {
      navigation.setParams({
        productId: item.id,
        colorCode: color
      });
    } else {
      navigation.navigate('ProductDetailScreen', {
        productId: item.id,
        colorCode: color
      });
    }
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }) => {

  if (item?.isSeeMore) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.seeMoreCard]}
        onPress={() =>
          navigation.navigate('CategoryProductScreen', {
            categoryId,
            categoryName,
          })
        }
      >
        <Text style={styles.seeMoreText}>
          See More
        </Text>
      </TouchableOpacity>
    );
  }

  const { price, image, color } = getLowestData(item);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={() => handlePress(item, color)}
    >
      {item?.effective_discount_percentage !== 0 && (
        <View style={globalStyles.offerBanner}>
          <Text style={globalStyles.offerText}>
            Offer up to{'\n'}
            {item.effective_discount_percentage}%
          </Text>
        </View>
      )}

      <Image
        source={{
          uri: image
            ? BASE_URL + image
            : 'https://via.placeholder.com/150'
        }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text numberOfLines={1} style={styles.name}>
        {item.product_name}
      </Text>

      { item.final_price < price && (<Text
        style={[
          styles.price,
          { textDecorationLine: 'line-through' }
        ]}
      >
        ₹ {price}
      </Text>)}

      <Text style={styles.finalPrice}>
        ₹ {item.final_price}
      </Text>
    </TouchableOpacity>
  );
};

  /* ================= UI ================= */

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  if (products.length === 0) {
    return null;
  }

  const displayProducts =
  products.length > MAX_DISPLAY
    ? [
        ...products.slice(0, MAX_DISPLAY),
        {
          id: 'see_more',
          isSeeMore: true,
        },
      ]
    : products;

  return (
    <View style={styles.container}>

      {/* ✅ CATEGORY TITLE */}
      <Text style={styles.title}>
        {i18n.t('MORE_IN')} {categoryName}
      </Text>

      <FlatList
        data={displayProducts}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 5 }}
      />

    </View>
  );
}
export default React.memo(RelatedProducts);
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 10
  },

  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 5
  },

  card: {
    width: 140,
    marginRight: 12,
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.productColumnBackground
  },

  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  name: {
    marginTop: 6,
    fontSize: 13,
  },

  price: {
    color: colors.price,
    fontWeight: 'bold',
    marginTop: 4,
    color: "#c17422"
  },
  finalPrice: {
    color: colors.price,
    fontWeight: 'bold',
    marginTop: 4,
    color: colors.price
  },
  seeMoreCard: {
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 220,
  borderWidth: 1,
  borderColor: '#ddd',
},

seeMoreText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: colors.price,
},

seeMoreCount: {
  marginTop: 5,
  fontSize: 12,
  color: '#666',
},
});