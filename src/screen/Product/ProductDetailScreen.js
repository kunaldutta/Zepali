import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToCartAPI } from '../../services/productService';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../localization/i18n';
import ImageCarousel from '../../components/ImageCarousel';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const scrollRef = useRef();

  /* REMOVE DUPLICATE COLORS */
  const colors = [
    ...new Map((product.colors || []).map(c => [c.color_code, c])).values(),
  ];

  /* STATE */
  const [selectedColor, setSelectedColor] = useState(
    colors.length ? colors[0] : null,
  );

  const images = selectedColor?.images || [];
  const variants = selectedColor?.variants || [];

  const [selectedVariant, setSelectedVariant] = useState(
    variants.length ? variants[0] : null,
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [thumbLoading, setThumbLoading] = useState(true);

  /* QUANTITY */
  const [quantity, setQuantity] = useState(1);

  /* ✅ CART LOADING */
  const [cartLoading, setCartLoading] = useState(false);

  /* IMAGE SCROLL */
  const onScrollEnd = e => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const selectImage = index => {
    scrollRef.current?.scrollTo({
      x: width * index,
      animated: true,
    });
    setActiveIndex(index);
  };

  /* CHANGE COLOR */
  const changeColor = colorObj => {
    setSelectedColor(colorObj);
    setSelectedVariant(colorObj.variants?.[0] || null);

    setActiveIndex(0);
    setImageLoading(true);
    setThumbLoading(true);
    setQuantity(1);

    scrollRef.current?.scrollTo({ x: 0, animated: false });
  };

  /* QUANTITY */
  const increaseQty = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  /* ✅ ADD TO CART */
  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedColor) {
      Alert.alert('Error', 'Please select variant');
      return;
    }

    try {
      setCartLoading(true);

      /* USER */
      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (!parsedUser?.id) {
        Alert.alert('Login Required', 'Please login first');
        return;
      }

      /* PAYLOAD */
      const payload = {
        customer_id: parsedUser.id,
        vendor_id: product.vendor_id,
        prod_id: product.id,
        color_code: selectedColor.color_code,
        size_or_weight: selectedVariant.measurement_value,
        quantity: quantity,
        price: selectedVariant.price,
      };

      console.log('AddToCart Payload:', payload);

      /* API CALL */
      const response = await addToCartAPI(payload);

      if (response?.status === 'success') {
        Alert.alert('Success', response.message || 'Added to cart');
      } else {
        Alert.alert('Error', response.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('ADD TO CART ERROR:', error);
      Alert.alert('Error', 'Server error');
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {i18n.t('PRODUCTS_DETAIL') || 'Product Detail'}
        </Text>

        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* IMAGE CAROUSEL */}
        {/* <ScrollView
ref={scrollRef}
horizontal
pagingEnabled
showsHorizontalScrollIndicator={false}
onMomentumScrollEnd={onScrollEnd}
key={selectedColor?.color_code}
>

{images.map((img,index)=>(

<View key={`${img}_${index}`} style={styles.imageWrapper}>

{imageLoading && (
<ActivityIndicator
size="large"
color="#27ae60"
style={styles.imageLoader}
/>
)}

<Image
source={{uri:img}}
style={styles.image}
resizeMode="contain"
onLoadEnd={()=>setImageLoading(false)}
/>

</View>

))}

</ScrollView> */}
        <ImageCarousel
          images={images}
          scrollRef={scrollRef}
          onScrollEnd={onScrollEnd}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
        />
        {/* PAGINATION */}
        <View style={styles.pagination}>
          {images.map((_, index) => {
            const active = activeIndex === index;
            return (
              <View
                key={`dot_${index}`}
                style={[styles.dot, active && styles.activeDot]}
              />
            );
          })}
        </View>

        {/* THUMBNAILS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
          key={`thumb_${selectedColor?.color_code}`}
        >
          {images.map((img, index) => {
            const isSelected = activeIndex === index;

            return (
              <TouchableOpacity
                key={`thumb_${img}_${index}`}
                onPress={() => selectImage(index)}
              >
                <View style={styles.thumbWrapper}>
                  {thumbLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#27ae60"
                      style={styles.thumbLoader}
                    />
                  )}

                  <Image
                    source={{ uri: img }}
                    style={[
                      styles.thumbnail,
                      isSelected && styles.selectedThumbnail,
                    ]}
                    onLoadEnd={() => setThumbLoading(false)}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* PRODUCT INFO */}

        <View style={styles.infoContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.name}>{product.product_name}</Text>

            <View style={styles.qtyContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}>
                <Text style={styles.qtySymbol}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.qtyBtn,
                  quantity === selectedVariant?.stock && { opacity: 0.4 },
                ]}
                onPress={increaseQty}
                disabled={quantity === selectedVariant?.stock}
              >
                <Text style={styles.qtySymbol}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedVariant && (
            <Text style={styles.price}>₹ {selectedVariant.price}</Text>
          )}

          {/* COLOR */}
          {colors.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.measurementTitle}>
                {i18n.t('SELECT_COLOR') || 'Select Color'}
              </Text>

              <ScrollView horizontal>
                {colors.map(c => {
                  const selected =
                    selectedColor && selectedColor.color_code === c.color_code;

                  return (
                    <TouchableOpacity
                      key={c.color_code}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c.color_code },
                        selected && styles.selectedColorCircle,
                      ]}
                      onPress={() => changeColor(c)}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* SIZE */}
          {variants.length > 0 && (
            <View style={styles.measurementContainer}>
              <Text style={styles.measurementTitle}>
                {i18n.t('SELECT_SIZE') || 'Select Size'}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {variants.map((m, index) => {
                  const isSelected =
                    selectedVariant &&
                    selectedVariant.measurement_value === m.measurement_value;

                  return (
                    <TouchableOpacity
                      key={`${m.measurement_value}_${index}`}
                      style={[
                        styles.measureBtn,
                        isSelected && styles.selectedMeasure,
                      ]}
                      onPress={() => {
                        setSelectedVariant(m);
                        setQuantity(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.measureValue,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {m.measurement_value}
                      </Text>

                      <Text
                        style={[
                          styles.measureStock,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        Stock: {m.stock}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* DESCRIPTION */}
          {product.description !== '' && (
            <>
              <Text style={styles.descTitle}>
                {i18n.t('PRODUCTS_DECRIPTION') || 'Product Description'}
              </Text>

              <Text style={styles.description}>{product.description}</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  backBtn: { padding: 5 },

  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  container: { flex: 1 },

  imageWrapper: {
    width: width,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: { width: width, height: 300 },

  imageLoader: { position: 'absolute', zIndex: 10 },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },

  activeDot: { backgroundColor: '#27ae60' },

  thumbnailContainer: { marginTop: 10, paddingLeft: 10 },

  thumbWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  thumbLoader: { position: 'absolute', zIndex: 10 },

  thumbnail: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  selectedThumbnail: {
    borderColor: '#27ae60',
    borderWidth: 2,
  },

  infoContainer: { padding: 15 },

  name: { fontSize: 22, fontWeight: 'bold' },

  price: {
    fontSize: 22,
    color: '#8a4a05',
    marginTop: 5,
    fontWeight: 'bold',
  },

  descTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },

  description: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 22,
    color: '#047878',
  },

  measurementContainer: { marginTop: 20 },

  measurementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  measureBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  selectedMeasure: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },

  measureValue: { fontSize: 16, fontWeight: 'bold' },

  selectedText: { color: '#fff' },

  measureStock: { fontSize: 12, marginTop: 3 },

  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },

  selectedColorCircle: {
    borderColor: '#000',
    borderWidth: 3,
  },

  bottomBar: {
    padding: 15,
    borderColor: '#eee',
    borderTopWidth: 2,
    backgroundColor: '#fff',
  },

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },

  qtySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },

  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },

  cartBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
  },

  cartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
