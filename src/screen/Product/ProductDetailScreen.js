import React, { useState, useRef, useEffect } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateCart, addToCart } from '../../redux/store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductDetailUI from './ProductDetailUI';
import i18n from '../../localization/i18n';
import {globalStyles,colors} from '../../../src/styles/globalStyles';

const { width } = Dimensions.get('window');


export default function ProductDetailScreen({ route, navigation }) {
  const dispatch = useDispatch();

const cartItems = useSelector(state => state.cart.items);
  const { product } = route.params;
  const scrollRef = useRef();
  const { updating } = useSelector(state => state.cart);
  const [cartLoaded, setCartLoaded] = useState(false);
  console.log("ProductDetailScreen Rendered with product:", updating);
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

  /* ✅ LOAD CART */

/* ✅ CHECK EXISTING CART ITEM */
  const existingCartItem = cartItems.find(item => {

  return (
    String(item.prod_id) === String(product.id) &&
    String(item.color_code).toLowerCase() === String(selectedColor?.color_code).toLowerCase() &&
    String(item.size_or_weight).trim() === String(selectedVariant?.measurement_value).trim()
  );

});

/* ✅ SYNC QUANTITY */
useEffect(() => {

  const loadCart = async () => {

    try {
      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (parsedUser?.id) {
        await dispatch(fetchCart(parsedUser.id)).unwrap();
      }

    } catch (error) {

      console.log("FetchCart Error:", error);

      const errorMessage =
        error?.message || error || 'Something went wrong';

      if (errorMessage.toLowerCase().includes('network')) {
        Alert.alert('No Internet', 'Please check your connection');
      } else {
        Alert.alert('Error', errorMessage);
      }

    } finally {
      setCartLoaded(true); // ✅ ALWAYS RUN
    }
  };

  loadCart();

}, []);

useEffect(() => {

  if (existingCartItem) {

    // ONLY update if different
    if (existingCartItem && !updating) {
      setQuantity(existingCartItem.quantity);
    }

  } else {

    if (quantity !== 1) {
      setQuantity(1);
    }

  }

}, [existingCartItem]);
  

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
  const increaseQty = async () => {

  if (updating) return;
  if (!selectedVariant) return;
  if (Number(quantity) >= Number(selectedVariant.stock)) return;

  const newQty = Number(quantity) + 1;
  setQuantity(String(newQty));

  try {

    if (existingCartItem) {

      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (!parsedUser?.id) return;

      const payload = {
        customer_id: parsedUser.id,
        prod_id: product.id,
        color_code: selectedColor.color_code,
        size_or_weight: selectedVariant.measurement_value,
        quantity: newQty,
      };

      await dispatch(updateCart(payload)).unwrap();
    }

  } catch (error) {

    console.log("❌ increaseQty ERROR:", error);

    const errorMessage =
      error?.message ||
      error ||
      'Something went wrong';

    if (String(errorMessage).toLowerCase().includes('network')) {
      Alert.alert('No Internet', 'Please check your connection');
    } else {
      Alert.alert('Error', errorMessage);
    }

    // 🔥 rollback UI if API fails
    setQuantity(prev => String(Number(prev) - 1));
  }
};


  const decreaseQty = async () => {

  if (updating) return;
  if (Number(quantity) <= 1) return;

  const newQty = Number(quantity) - 1;
  setQuantity(String(newQty));

  try {

    if (existingCartItem) {

      const userData = await AsyncStorage.getItem('USER_DATA');
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (!parsedUser?.id) return;

      const payload = {
        customer_id: parsedUser.id,
        prod_id: product.id,
        color_code: selectedColor.color_code,
        size_or_weight: selectedVariant.measurement_value,
        quantity: newQty,
      };

      await dispatch(updateCart(payload)).unwrap();
    }

  } catch (error) {

    console.log("❌ decreaseQty ERROR:", error);

    const errorMessage =
      error?.message ||
      error ||
      'Something went wrong';

    if (String(errorMessage).toLowerCase().includes('network')) {
      Alert.alert('No Internet', 'Please check your connection');
    } else {
      Alert.alert('Error', errorMessage);
    }

    // 🔥 rollback UI if API fails
    setQuantity(prev => String(Number(prev) + 1));
  }
};

  /* ✅ ADD TO CART */
  const handleAddToCart = async () => {

  if (!selectedVariant || !selectedColor) {
    Alert.alert('Error', 'Please select variant');
    return;
  }

  setCartLoading(true); // ✅ move outside try (important)

  try {

    const userData = await AsyncStorage.getItem('USER_DATA');
    const parsedUser = userData ? JSON.parse(userData) : null;

    if (!parsedUser?.id) {
      Alert.alert('Login Required', 'Please login first');
      return;
    }

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

    const response = await dispatch(addToCart(payload)).unwrap();

    Alert.alert('Success', response?.message || 'Added to cart');

  } catch (error) {

    console.log('ADD TO CART ERROR:', error);

    const errorMessage =
      error?.message ||
      error ||
      'Something went wrong';

    if (String(errorMessage).toLowerCase().includes('network')) {
      Alert.alert('No Internet', 'Please check your connection');
    } else {
      Alert.alert('Error', errorMessage);
    }

  } finally {
    setCartLoading(false); // ✅ always reset loader
  }
};

  /* ✅ GO TO CART */

  const goToCart = () => {
    navigation.navigate('CartScreen');
  };

  return (
    <ProductDetailUI
    navigation={navigation}
    styles={styles}
    images={images}
    scrollRef={scrollRef}
    onScrollEnd={onScrollEnd}
    imageLoading={imageLoading}
    setImageLoading={setImageLoading}
    activeIndex={activeIndex}
    selectedColor={selectedColor}
    thumbLoading={thumbLoading}
    setThumbLoading={setThumbLoading}
    selectImage={selectImage}
    product={product}
    quantity={quantity}
    increaseQty={increaseQty}
    decreaseQty={decreaseQty}
    updating={updating}
    cartLoaded={cartLoaded}
    selectedVariant={selectedVariant}
    colors={colors}
    changeColor={changeColor}
    variants={variants}
    setSelectedVariant={setSelectedVariant}
    setQuantity={setQuantity}
    existingCartItem={existingCartItem}
    goToCart={goToCart}
    handleAddToCart={handleAddToCart}
    cartLoading={cartLoading}
  />
);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.safeAreaColor },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  backBtn: { padding: 5 },

  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.headerTitleColor },

  container: [globalStyles.scrollViewContainer],

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
    color: colors.price,
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
    borderColor: colors.border,
    borderTopWidth: 2,
    backgroundColor: colors.background,
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
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qtySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
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
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
  },

  cartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
