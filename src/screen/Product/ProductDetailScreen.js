import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateCart } from '../../redux/store/slices/cartSlice';
import { getProductDetail } from '../../services/productService';
import { BASE_URL } from '../../network/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import ImageZoomModal from '../../components/ImageZoomModal';
import RelatedProducts from '../../components/RelatedProducts';
import {addToWishlistAPI, checkWishlistAPI, removeFromWishlistAPI} from '../../services/wishlistService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {

  const { productId, colorCode, size } = route.params || {};
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(size || null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef();
  const { updating } = useSelector(state => state.cart);
  const [visible, setVisible] = useState(false);
  const [zoomImages, setZoomImages] = useState([]);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [colorName, setColorName] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  

  /* ---------------- FETCH PRODUCT ---------------- */
  const existingCartItem =
  product &&
  selectedColor &&
  selectedVariant
    ? cartItems.find(item => {

        return (
          String(item.product_id) === String(product.id) &&

          String(item.color || '')
            .trim()
            .toLowerCase() ===
          String(selectedColor?.color || '')
            .trim()
            .toLowerCase() &&

          String(item.measurement_id || item.size || '')
            .trim() ===
          String(
            selectedVariant?.measurement_id ||
            selectedVariant?.measurement_value ||
            ''
          ).trim()
        );

      })
    : null;

  useEffect(() => {
  if (productId) {
    setLoading(true);
    setActiveIndex(0);
    setQuantity(1);

    loadProduct(colorCode);
  }
}, [productId]);

useEffect(() => {
  if (product && selectedColor && selectedVariant) {
    checkWishlist(product, selectedColor, selectedVariant);
  }
}, [product, selectedColor, selectedVariant]);
  useEffect(() => {

  if (existingCartItem) {
    setQuantity(Number(existingCartItem.quantity));
  } else {
    setQuantity(1);
  }

}, [existingCartItem]);

  const loadProduct = async (color = '') => {
    console.log('Loading product with color:', color);
  try {

    const res = await getProductDetail(productId, color);

    if (res?.status) {

      const productData = res.product;
      const selColor = productData?.selected_color;

      // ✅ SAFE VARIANT (IMPORTANT FIX)
      const variant =
        Array.isArray(selColor?.variants) && selColor.variants.length > 0
          ? selColor.variants[0]
          : null;

      setColorName(selColor.color);
      setProduct(productData);
      setSelectedColor(selColor);
        console.log('Selected variant ==PDS', selColor);
      setSelectedVariant(variant);

      console.log('Product Detail ===', productData);
      console.log('Product Detail ===2', selColor, variant);

      // ✅ ALWAYS CALL (NO BLOCKING ON VARIANT)
      
    }

  } catch (error) {
    console.log("DETAIL ERROR:", error);
    Alert.alert("Error", "Failed to load product");
  } finally {
    setLoading(false);
  }
};

  /* ---------------- LOADER ---------------- */

  if (!product || !selectedColor) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const images = selectedColor.images || [];

  /* ---------------- HANDLERS ---------------- */

  const changeColor = async (color) => {
    setSelectedVariant(null); // ✅ VERY IMPORTANT (reset old selection)

    setLoading(true);
    await loadProduct(color.color);

    setActiveIndex(0);
    setQuantity(1);
  };

  const finalPrice = (price, offer) =>{
    //console.log('finalPrice ===', offer)
    console.log('finalPrice ===', price)
    let finalPrice = price - (price * (offer/100))
    console.log('finalPrice ===', finalPrice)
    return finalPrice; 
  }

  const increaseQty = async () => {

  if (!selectedVariant) return;
  if (quantity >= selectedVariant.stock) return;

  const newQty = quantity + 1;
  setQuantity(newQty);

  // ✅ IF ITEM ALREADY IN CART → UPDATE API
  if (existingCartItem) {

    try {

      // ✅ FIX
      const validVariant = selectedVariant;

      const validImag =
        selectedColor?.images?.find(
          v => v.measurement_value === selectedVariant?.measurement_value
        ) || selectedColor?.images?.[0];

      const user = await AsyncStorage.getItem('USER_DATA');
      const parsed = JSON.parse(user);

      await dispatch(updateCart({
        customer_id: parsed.id,
        prod_id: product.id,
        measurement_id: validVariant?.measurement_id,
        image_id: validImag?.image_id || 0,
        quantity: newQty,
      })).unwrap();

    } catch (error) {

      console.log("UpdateCart ERROR:", error);

      // rollback UI
      setQuantity(prev => prev - 1);
    }
  }
};

  const decreaseQty = async () => {

  if (quantity <= 1) return;

  const newQty = quantity - 1;
  setQuantity(newQty);

  if (existingCartItem) {

    try {

      // ✅ FIX
      const validVariant = selectedVariant;

      const validImag =
        selectedColor?.images?.find(
          v => v.measurement_value === selectedVariant?.measurement_value
        ) || selectedColor?.images?.[0];

      const user = await AsyncStorage.getItem('USER_DATA');
      const parsed = JSON.parse(user);

      await dispatch(updateCart({
        customer_id: parsed.id,
        prod_id: product.id,
        measurement_id: validVariant?.measurement_id,
        image_id: validImag?.image_id || 0,
        quantity: newQty,
      })).unwrap();

    } catch (error) {

      console.log("UpdateCart ERROR:", error);

      // rollback UI
      setQuantity(prev => prev + 1);
    }
  }
};

  const goToCart = async () => {
    navigation.navigate('CartScreen');
  }
  const handleAddToCart = async () => {

  try {

    // ✅ PREVENT DOUBLE TAP
    if (addingCart || updating) {
      return;
    }

    setAddingCart(true);

    const user = await AsyncStorage.getItem('USER_DATA');
    const parsed = JSON.parse(user);

    if (!parsed?.id) {
      Alert.alert("Login Required");
      return;
    }

    // ✅ SAFETY
    if (!selectedVariant?.measurement_id) {
      Alert.alert("Error", "Variant missing");
      return;
    }

    // ✅ VALID IMAGE
    const validImag =
      selectedColor?.images?.find(
        v => v.measurement_value === selectedVariant?.measurement_value
      ) || selectedColor?.images?.[0];

    await dispatch(addToCart({
      customer_id: parsed.id,
      vendor_id: product.vendor_id,
      prod_id: product.id,
      measurement_id: selectedVariant.measurement_id,
      image_id: validImag?.image_id || 0,
      quantity,
    })).unwrap();

    Alert.alert("Success", "Added to cart");

  } catch (e) {

    console.log("AddToCart ERROR:", e);

    Alert.alert(
      "Error",
      e?.message || "Failed to add to cart"
    );

  } finally {

    setAddingCart(false);
  }
};

const checkWishlist = async (prod, color, variant) => {
  console.log('Check Wishlist ===', prod?.id, color?.color, variant?.measurement_value);

  try {
    // ✅ FIX: check ALL values
    if (!prod || !color || !variant) return;

    const res = await checkWishlistAPI({
      product: prod,
      selectedColor: color,
      selectedVariant: variant,
    });

    console.log("Wishlist check response:", res?.data);

    if (res?.status) {
      setIsWishlisted(res.is_wishlisted);
      setWishlistId(res?.data.id || null);
    }

  } catch (e) {
    console.log("checkWishlist ERROR:", e);
  }
};

const onWishlistPress = async () => {
  try {
    console.log("removeFromWishlistAPI payload:1", wishlistId);
  const res = isWishlisted ? await removeFromWishlistAPI(
        wishlistId)
    : await addToWishlistAPI({
        product,
        selectedColor,
        selectedVariant,
      }); 
      
    if (!res?.status && res?.message === "Login Required") {
      Alert.alert("Login Required");
      return;
    }

    if (res?.status) {
      console.log("Wishlist response:", res);
      if(res.message === "Added to wishlist"){
        setIsWishlisted(true);
        setWishlistId(res.wishlist_id);
      } else if(res.message === "Removed from wishlist"){
        setIsWishlisted(false);
        setWishlistId(null);
      }
      
      Alert.alert("Success", res.message);

    } else {
      Alert.alert("Error", res.message);
    }

  } catch (error) {
    console.log("Wishlist ERROR:", error);
    Alert.alert("Error", "Something went wrong");
  }
};
  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Product Detail" onBackPress={() => navigation.goBack()} />
      
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        <ScrollView contentContainerStyle={{paddingBottom:100}}>

          {/* IMAGES */}
          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollRef}
            
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
          >
            {images.map((img, i) => (
            <TouchableOpacity
              key={`${img.image_id}-${i}`}
            onPress={() => {
              const imgs = images.map(item => ({
                url: BASE_URL + item.image_url
              }));

              setZoomImages(imgs);
              setZoomIndex(i);
              setVisible(true);
              
            }}
          >
            
          <Image
            source={{ uri: BASE_URL + img.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
          
        </TouchableOpacity>
            ))}
          </ScrollView>

          {/* DOTS */}
          <View style={styles.dots}>
            {images.map((img, i) => (
            <View
              key={`dot-${img.image_id}-${i}`}
                style={[styles.dot, activeIndex === i && styles.activeDot]}
              />
            ))}
          </View>

          {/* INFO */}
          <View style={styles.container}>
            <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottomWidth: 1,      // 👈 adds bottom line
                  borderBottomColor: '#ccc', // 👈 color of the line
                  paddingBottom: 8,   // 👈 spacing from content
                }}
              >
                <Text style={styles.name}>{product.product_name}</Text>

                <TouchableOpacity
                  onPress={onWishlistPress}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 1
                  }}
                >
                  {isWishlisted ? (
                    <Ionicons name="heart" size={35} color="red" />
                  ) : (
                    <Ionicons name="heart-outline" size={35} color={colors.secondary} />
                  )}
                </TouchableOpacity>
              </View>

            {selectedVariant && (
              <>
              {selectedVariant.effective_discount_percentage > 0 && (<Text style={[styles.price, { textDecorationLine: 'line-through' }]}>₹ {selectedVariant?.price}</Text>)}
              <Text style={styles.productFinalPrice}>₹ {selectedVariant?.final_price}</Text>
              </>
            )}
            

            {/* COLORS */}
            <Text style={styles.title}>{i18n.t('PRODUCT_COLOR')}: {colorName}</Text>

            <ScrollView style={{top:10}} horizontal>
              
              {product.colors.map(c => (
                <TouchableOpacity
                  key={`${c.color}-${c.image}`}
                  onPress={() => changeColor(c)}
                  style={[
                    styles.colorImageBox,
                    selectedColor?.color === c.color && styles.selectedColor
                  ]}
                >
                  
                  <Image
                    source={{ uri: BASE_URL + c.image }}// BASE_URL + c.image
                    style={styles.colorImage}
                    resizeMode="contain"
                  />
                 
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* SIZE */}
            <View style={{top:10}}>
            <Text style={styles.title}>{i18n.t('SIZE')}</Text>

            <ScrollView style={{top:10}} horizontal>
              {selectedColor?.variants.map((v) => (
              <TouchableOpacity
                key={`${v.measurement_id}-${v.measurement_value}`}
                  onPress={() => {
                    console.log('Selected variant ==', v);
                    setSelectedVariant(v)}}
                  style={[
                    styles.sizeBtn,
                    selectedVariant?.measurement_value === v.measurement_value && styles.selectedSize
                  ]}
                >
                  <Text>{v.measurement_value}</Text>
                  <Text>Stock: {v.stock}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            </View>

            {/* DESCRIPTION */}
            <View style={{top:10}}>
            <Text style={styles.title}>{i18n.t('PRODUCTS_DECRIPTION')}</Text>
            <Text style = {{color:colors.descriptioncolor}}>{product.selected_color.description}</Text>
              </View>
          </View>
          
          
           <RelatedProducts
            key={product.id}   // 🔥 IMPORTANT
            categoryId={product.category_id}
            currentProductId={product.id}
            navigation={navigation}
          />
      
        </ScrollView>

        {/* BOTTOM */}
        <View style={[styles.bottom]}>
        {updating &&(<View style={[{position:'absolute', justifyContent: 'center', alignItems: 'center', width:'100%', height:'100%'}]}>
        <ActivityIndicator size="large" />
        </View>)}
          <View style={styles.qty}>
            <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty} disabled={updating}>
              <Text style={styles.btn}>-</Text>
            </TouchableOpacity>

            <Text>{quantity}</Text>

            <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty} disabled={updating}>
              <Text style={styles.btn}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.cartBtn,
              (addingCart || updating) && { opacity: 0.5 }
            ]}
            disabled={addingCart || updating}
            onPress={existingCartItem ? goToCart : handleAddToCart}
          >
            <Text style={{color:'#fff', fontSize:14, fontWeight:'bold'}}>
              {existingCartItem ? i18n.t('GO_TO_CART'): i18n.t('ADD_TO_CART')}
            </Text>
          </TouchableOpacity>

        </View>
          {loading &&(<View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>)}
      </View>
      <ImageZoomModal
        visible={visible}
        images={zoomImages}
        index={zoomIndex}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.safeAreaColor },

  center: { flex: 1, position:'absolute', width:'100%', height:'100%', justifyContent: 'center', alignItems: 'center', backgroundColor:colors.background },

  image: { width, height: 300 },

  dots: { flexDirection: 'row', justifyContent: 'center', margin: 10 },

  dot: { width: 8, height: 8, backgroundColor: '#ccc', margin: 4, borderRadius: 4 },

  activeDot: { backgroundColor: 'green' },

  container: { padding: 15 },

  name: { fontSize: 20, fontWeight: 'bold' },

  price: { fontSize: 18, color: "#c17422", marginVertical: 5, fontWeight:'bold' },
  
  productFinalPrice:{
  fontSize:18,
  marginTop:2,
  fontWeight:"bold",
  color:colors.price
  },

  title: { marginTop: 15, fontWeight: 'bold' },

  color: { width: 35, height: 35, borderRadius: 18, marginRight: 10 },

  selectedColor: { borderWidth: 2, borderColor: '#000' },

  sizeBtn: { padding: 10, borderWidth: 1, marginRight: 10, borderRadius: 6 },

  selectedSize: { backgroundColor: '#ddd' },

  bottom: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderTopWidth: 1 },

  qty: { flexDirection: 'row', alignItems: 'center', gap: 15 },

  qtyBtn:{
    width:35,
    height:35,
    borderRadius:6,
    borderWidth:1,
    borderColor:colors.primary,
    justifyContent:"center",
    alignItems:"center"
  },

  btn: { alignContent:'center', fontSize:15, alignItems:'center', fontWeight:'bold' },

  cartBtn: { backgroundColor: colors.primary, padding: 15, borderRadius: 10 },
  colorImageBox: {
  width: 100,
  height: 100,
  borderRadius: 10,
  marginRight: 10,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.borderColor,
  justifyContent: 'center',
  alignItems: 'center'
},

colorImage: {
  width: '100%',
  height: '100%'
},
});