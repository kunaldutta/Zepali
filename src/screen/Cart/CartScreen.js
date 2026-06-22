import React, {
  Component,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCart } from '../../redux/store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../localization/i18n';
import {globalStyles,colors} from '../../styles/globalStyles';
import { useAddress } from '../../components/AddressContext';
import AddressCard from '../../components/AddressCard';
import AppHeader from '../../components/AppHeader';
import { BASE_URL } from '../../network/apiClient';
import RelatedProducts  from '../../components/RelatedProducts';
import CartBillSummary from '../../components/CartBillSummary';
import PointsSelector from '../../components/PointsSelector';
import CustomAlert from '../../components/CustomAlert';


export default function CartScreen({navigation}) {
  
  const { selectedAddress, fetchAddresses, addresses } = useAddress();
  const dispatch = useDispatch();
  const [pointsData, setPointsData] = useState({
    points: 0,
    amount: 0,
  });
  const [showCartAlert, setShowCartAlert] = useState(false);
   const [alertTitle, setAlertTitle] = useState('');
   const [alertMsg, setAlertMsg] = useState('');
   const [selectedItem, setSelectedItem] = useState(null);
  const { items, total, summary, loading } = useSelector(state => state.cart);
  const uniqueCategories = useMemo(() => {
  return items?.length
    ? [...new Set(items.map(item => item.category_id))]
    : [];
}, [items]);

  /* ✅ LOCAL LOADER (ROW BASED) */
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [cartLoading, setCartLoading] = useState(loading);
  const [loggedinUser, setloggedinUser] = useState(null);
  const [isPointSelected, setIsPointSelected] = useState(false);
  const lastPointsAmount = useRef(null);
  const [showStockPopup, setShowStockPopup] = useState(false);
  const [stockMessage, setStockMessage] = useState('');
  /* ================= LOAD CART ================= */
  useEffect(() => {
    loadCart();
    fetchAddresses();
  }, []);

  const loadCart = async () => {
  try {
    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;

    setloggedinUser(parsedUser);

    if (!parsedUser?.id) return;

    // ✅ Restore point state
    const pointSelected = await AsyncStorage.getItem("SELECTED_POINT");
    const storedAmount = await AsyncStorage.getItem("SELECTED_POINT_AMOUNT");

    const isSelected = pointSelected === "true";
    const pointsAmount = isSelected ? Number(storedAmount || 0) : 0;

    setIsPointSelected(isSelected);

    lastPointsAmount.current = pointsAmount;


    await dispatch(
      fetchCart({
        customer_id: parsedUser.id,
        points_amount: pointsAmount,
      }),
    ).unwrap();

  } catch (error) {
    
    Alert.alert('Error', 'Failed to load cart');
  }
};
const refreshCart = async (customerId) => {
  await dispatch(
    fetchCart({
      customer_id: customerId,
      points_amount: lastPointsAmount.current || 0,
    }),
  ).unwrap();
};

  /* ================= INCREASE ================= */
  const increaseQty = async (item) => {
   if(Number(item.quantity) >= Number(item.stock)){
    Alert.alert('Insufficiant Stock', 'We have only '+item.stock+ ' item(s) in stock');
    return;
   }
    console.log('Add')
  if (updatingItemId === item.cart_id) return;

  setUpdatingItemId(item.cart_id);
  setCartLoading(true);

  try {
    const newQty = Number(item.quantity) + 1;

    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser?.id) return;

    const payload = {
      customer_id: parsedUser.id,
      prod_id: item.product_id,
      measurement_id: item.measurement_id,
      image_id: item.image_id,
      quantity: newQty,
    };

    await dispatch(updateCart(payload)).unwrap();

    await refreshCart(parsedUser.id);
    

  } catch (error) {


    const errorMessage =
      error?.message || error || 'Something went wrong';

    if (String(errorMessage).toLowerCase().includes('network')) {
      Alert.alert('No Internet', 'Please check your connection');
    } else {
      Alert.alert('Error', errorMessage);
    }

  } finally {
    setUpdatingItemId(null);
    setCartLoading(false);
  }
};

  /* ================= DELETE ================= */
const deleteItem = async (item) => {

  if (updatingItemId === item.cart_id) return;
    setUpdatingItemId(item.cart_id);
  setCartLoading(true);

  try {
    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser?.id) return;

    const payload = {
      customer_id: parsedUser.id,
      prod_id: item.product_id,
      measurement_id: item.measurement_id,
      image_id: item.image_id,
      quantity: 0,
    };
    await dispatch(updateCart(payload)).unwrap();

    await refreshCart(parsedUser.id);

  } catch (error) {


    const errorMessage =
      error?.message || error || 'Something went wrong';

    if (String(errorMessage).toLowerCase().includes('network')) {
      Alert.alert('No Internet', 'Please check your connection');
    } else {
      Alert.alert('Error', errorMessage);
    }

  } finally {
    setUpdatingItemId(null);
    setCartLoading(false);
  }
};

const confirmDeleteItem = (item) => {
  setSelectedItem(item);
  setAlertTitle('Delete Item');
  setAlertMsg('Would you like to delete this item?');
  setShowCartAlert(true);
};

  /* ================= DECREASE ================= */
  const decreaseQty = async (item) => {

    if (updatingItemId === item.cart_id) return;

    // ✅ Show delete confirmation only when quantity is 1
    if (Number(item.quantity) === 1) {
      setSelectedItem(item);
      setAlertTitle('Delete Item');
      setAlertMsg('Would you like to delete this item?');
      setShowCartAlert(true);
      return;
    }

    setUpdatingItemId(item.cart_id);
    setCartLoading(true);

    try {
      const newQty = Number(item.quantity) - 1;

      const userData = await AsyncStorage.getItem("USER_DATA");
      const parsedUser = userData ? JSON.parse(userData) : null;

      if (!parsedUser?.id) return;

      const payload = {
        customer_id: parsedUser.id,
        prod_id: item.product_id,
        measurement_id: item.measurement_id,
        image_id: item.image_id,
        quantity: newQty,
      };

      await dispatch(updateCart(payload)).unwrap();

      await refreshCart(parsedUser.id);

    } catch (error) {

      const errorMessage =
        error?.message || error || 'Something went wrong';

      if (String(errorMessage).toLowerCase().includes('network')) {
        Alert.alert('No Internet', 'Please check your connection');
      } else {
        Alert.alert('Error', errorMessage);
      }

    } finally {
      setUpdatingItemId(null);
      setCartLoading(false);
    }
  };
const handlePlaceOrder = () => {

  if (!items || items.length === 0) {
    Alert.alert("Cart Empty", "Please add items to cart");
    return;
  }

  if (!selectedAddress) {
    Alert.alert(
      "Address Required",
      "Please select delivery address"
    );
    return;
  }

  const stockIssues = items.filter(
    item =>
      item.is_out_of_stock ||
      item.is_stock_insufficient
  );

  if (stockIssues.length > 0) {

    let message =
      "The following items have stock issues:\n\n";

    stockIssues.forEach(item => {

      if (item.is_out_of_stock) {

        message +=
          `• ${item.product_name} (${item.size})\n` +
          `→ Out of stock (will not be ordered)\n\n`;

      } else if (item.is_stock_insufficient) {

        message +=
          `• ${item.product_name} (${item.size})\n` +
          `→ Requested: ${item.requested_quantity || item.quantity}\n` +
          `→ Available: ${item.stock}\n` +
          `→ Order will proceed with quantity ${item.stock}\n\n`;
      }
    });

    // Alert.alert(
    //   "Stock Availability",
    //   message,
    //   [
    //     {
    //       text: "Cancel",
    //       style: "cancel",
    //     },
    //     {
    //       text: "Continue",
    //       onPress: () => {

    //         navigation.navigate(
    //           'PurchaseReviewScreen',
    //           {
    //             cartItems: items,
    //             totalPrice: Number(
    //               summary?.grand_total
    //             ).toFixed(2),
    //             address: selectedAddress,
    //             summary,
    //           }
    //         );

    //       },
    //     },
    //   ]
    // );
    setStockMessage(message);
    setShowStockPopup(true);

    return;
  }
  const validItems = items.filter(
  item => !item.is_out_of_stock
);
  navigation.navigate(
    'PurchaseReviewScreen',
    {
      cartItems: validItems,
      totalPrice: Number(
        summary?.grand_total
      ).toFixed(2),
      address: selectedAddress,
      summary,
    }
  );
};

  /* ================= ITEM ================= */
  const renderItem = ({item}) => {
  const isUpdating = updatingItemId === item.cart_id;
  const savedAmount = (Number(item.price) - Number(item.final_price)).toFixed(2);

  return (
    <View style={[styles.card, { borderColor: colors.border, opacity: isUpdating ? 0.5 : 1 }]}>

      <Image source={{uri: BASE_URL+item.image}} style={styles.image} resizeMode="contain" />

      <View style={{flex:1}}>

        {/* 🔥 TOP ROW (NAME + DELETE) */}
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={styles.name}>
            {item.product_name}
          </Text>

          <TouchableOpacity
            onPress={() => confirmDeleteItem(item)}
            disabled={isUpdating}
          >
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:'row'}}>
        <Text style={globalStyles.text}>
          {i18n.t('SIZE')}: {item?.size}
        </Text>
        </View>
        <View style={{flexDirection:'row'}}>
        <Text style={[globalStyles.text]}>
          {i18n.t('PRODUCT_COLOR')}: {item.color}
        </Text>
        </View>

        {/* QTY */}
        {!item.is_out_of_stock && (<View style={styles.qtyContainer}>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => decreaseQty(item)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#27ae60" />
            ) : (
              <Text style={styles.qtySymbol}>-</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.qtyText}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => increaseQty(item)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#27ae60" />
            ) : (
              <Text style={styles.qtySymbol}>+</Text>
            )}
          </TouchableOpacity>

        </View>)}
        {item.is_out_of_stock && (
          <Text style={{color: 'red', fontWeight: 'bold', marginTop: 5}}>
            {item.stock_message}
          </Text>
        )}

        {item.is_stock_insufficient && (
          <Text style={{color: 'orange', fontWeight: 'bold', marginTop: 5}}>
            {item.stock_message}
          </Text>
        )}
         {item.product_offer > 0 &&(<Text style={[styles.price, { textDecorationLine: 'line-through' }]}>
          ₹ {(item.price)*(item.quantity)}
        </Text>)}
        <Text style={styles.finalPrice}>
          ₹ {item.total_price}
        </Text>
        {savedAmount > 0 && (
          <Text style={{color:colors.primary}}>
            {i18n.t('YOU_SAVED')} ₹ {savedAmount}
          </Text>
        )}


      </View>
    </View>
  );
};


const handlePointsChange = useCallback(
  async data => {
    try {
      const amount = Number(data?.amount || 0);

      // ✅ Prevent infinite API loop
      if (lastPointsAmount.current === amount) {
        return;
      }

      lastPointsAmount.current = amount;

      const isSelected = amount > 0;

      setIsPointSelected(isSelected);

      // ✅ Save state
      await AsyncStorage.setItem(
        'SELECTED_POINT',
        isSelected ? 'true' : 'false',
      );

      await AsyncStorage.setItem(
        'SELECTED_POINT_AMOUNT',
        String(amount),
      );


      dispatch(
        fetchCart({
          customer_id: loggedinUser?.id,
          points_amount: amount,
        }),
      );

    } catch (error) {
      console.log('❌ handlePointsChange ERROR:', error);
    }
  },
  [loggedinUser?.id],
);

const renderFooter = useMemo(() => {

  if (!items?.length) return null;


  return (
    <>
      <View
        style={{
          marginVertical: 25,
          width: '100%',
        }}
      >
        {Number(summary?.total_original_price) > 0 && (<PointsSelector
          key={`${summary?.grand_total}-${items.length}`}
          userId={loggedinUser?.id}
          cartTotal={String(
            Number(summary?.total_original_price) -
            Number(summary?.total_discount || 0) +
            Number(summary?.total_gst_amount || 0)
          )}
          isPointSelected={isPointSelected}
          onChange={handlePointsChange}
        />)}

        <CartBillSummary summary={summary} />
      </View>
      {uniqueCategories.map(catId => {

        const itemForCategory = items.find(
          i => i.category_id === catId,
        );
       
        return (
         <View
            key={catId}
            style={{marginTop: 0}}
          >
            <RelatedProducts
              categoryId={catId}
              cartItem={items}
              currentProductId={itemForCategory?.prod_id}
              navigation={navigation}
            />
          </View>
        );
      })}
    </>
  );

}, [
  uniqueCategories,
  items,
  summary,
  loggedinUser?.id,
  isPointSelected,
  handlePointsChange,
]);

  return(
    <SafeAreaView style={globalStyles.safeArea}>
      
      {/* HEADER */}
      <AppHeader
        title={i18n.t('CART') || 'CART'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
     <AddressCard
        selectedAddress={selectedAddress}
        onPress={() => {

          // ✅ SAFE CHECK
          if (!addresses || addresses.length === 0) {
            navigation.navigate('MapPicker');
            return;
          }

          navigation.navigate('AddressListScreen', {
            cartItems: items,
            totalPrice: total,
            summary: summary,
          });
        }}
      />
      <View style={{flex:1, padding:15,backgroundColor:colors.background}}  pointerEvents={cartLoading ? "none" : "auto"}>
        
        <FlatList
          data={items}
          extraData={summary}
          keyExtractor={(item, index) =>
            `${item.cart_id || item.product_id}-${item.measurement_id}-${index}`
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
        />


        
        {cartLoading && <View style={{width:60, height:60,
        position:'absolute',
        top: '45%',
        backgroundColor:'#727577',
          justifyContent:'center', alignItems:'center', alignSelf:'center', borderRadius:10}}> 
          <ActivityIndicator 
              size="small"
              color="#fff"/> 
              </View>}
      </View>
      <View 
  style={{
    backgroundColor: colors.background,
    flexDirection: 'row',        // 👈 IMPORTANT
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderColor:'#993636',
    borderWidth:1,
  }} 
  pointerEvents={cartLoading ? "none" : "auto"}
>

  {/* TOTAL */}
  
  <Text style={styles.totalText}>
    {i18n.t('TOTAL') || 'Total'}: ₹ {(Number(summary?.grand_total) || 0).toFixed(2)}
  </Text>

  {/* BUTTON */}
  <TouchableOpacity
    style={styles.placeOrderBtn}
    disabled ={(Number(summary?.total_original_price)) === 0}
    onPress={handlePlaceOrder}
  >
    <Text style={styles.placeOrderText}>
     {i18n.t('PLACE_ORDER') ||  'Place Order'}
    </Text>
  </TouchableOpacity>

</View>
<CustomAlert
        visible={showCartAlert}
        title= {alertTitle}
        message={alertMsg}
        onOk={() => {
          deleteItem(selectedItem);
          setShowCartAlert(false);
        }}
        onThirdOption={() => {
           setShowCartAlert(false);
        }}
        onOkText="Ok"
        onThirdOptionText="Cancel"
      />
  <CustomAlert
      visible={showStockPopup}
      title="Stock Availability"
      message={stockMessage}
      onOk={() => {

        setShowStockPopup(false);

        navigation.navigate(
          'PurchaseReviewScreen',
          {
            cartItems: items,
            totalPrice: Number(summary?.grand_total).toFixed(2),
            address: selectedAddress,
            summary,
          }
        );
      }}
      onThirdOption={() => {
        setShowStockPopup(false);
      }}
      onOkText="Continue"
      onThirdOptionText="Cancel"
    />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

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

  card:{
    flexDirection:"row",
    marginBottom:15,
    borderWidth:1,
    borderColor:colors.border,
    padding:10,
    borderRadius:10,
    backgroundColor: colors.productColumnBackground,
    elevation: 2,
  },

  image:{
    width:80,
    height:80,
    marginRight:10,
    borderRadius:8
  },

  name:{ fontSize:16, fontWeight:"bold", width:'75%' },

  qtyContainer:{
    flexDirection:"row",
    alignItems:"center",
    marginTop:8,
    color:colors.text
  },

  qtyBtn:{
    width:35,
    height:35,
    borderRadius:6,
    borderWidth:1,
    borderColor:colors.primary,
    justifyContent:"center",
    alignItems:"center"
  },

  qtySymbol:{
    fontSize:18,
    fontWeight:"bold",
    color:colors.primary
  },

  qtyText:{
    marginHorizontal:15,
    fontSize:16,
    fontWeight:"bold",
    color:colors.text
  },

  price:{ marginTop:5, fontWeight:"bold", color:colors.secondary },
  finalPrice:{ marginTop:5, fontWeight:"bold", color:colors.price },

  totalBar:{
    padding:15,
    borderTopWidth:1,
    borderColor:colors.border,
  },

  totalText:{
    fontSize:18,
    fontWeight:"bold",
    color:colors.price
  },
  addressContainer: {
  margin: 15,
  padding: 15,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 10,
  backgroundColor: '#fff',
  height:'18%'
},

addressTitle: {
  fontSize: 14,
  fontWeight: 'bold',
  marginBottom: 5,
  color: colors.text
},

addressName: {
  fontSize: 16,
  fontWeight: 'bold',
  color: colors.text
},

addressText: {
  fontSize: 13,
  color: '#555'
},

addressPhone: {
  fontSize: 13,
  marginTop: 5,
  color: colors.text
},

addAddressText: {
  fontSize: 14,
  color: colors.primary,
  fontWeight: 'bold'
},
placeOrderBtn: {
  backgroundColor: colors.primary,
  width: '50%',
  alignSelf: 'center',   // 👈 important
  marginTop: 5,
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center'
},
placeOrderText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold'
},
});