import React, {useEffect, useState} from 'react';
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

export default function CartScreen({navigation}) {

  const dispatch = useDispatch();

  const { items, total, loading } = useSelector(state => state.cart);

  /* ✅ LOCAL LOADER (ROW BASED) */
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [cartLoading, setCartLoading] = useState(loading);
  /* ================= LOAD CART ================= */
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
  try {
    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;

    if (!parsedUser?.id) return;

    await dispatch(fetchCart(parsedUser.id)).unwrap();

  } catch (error) {
    console.log("❌ loadCart ERROR:", error);

    const errorMessage =
      error?.message || error || 'Something went wrong';

    if (String(errorMessage).toLowerCase().includes('network')) {
      Alert.alert('No Internet', 'Please check your connection');
    } else {
      Alert.alert('Error', errorMessage);
    }
  }
};

  /* ================= INCREASE ================= */
  const increaseQty = async (item) => {

  if (updatingItemId === item.id) return;

  setUpdatingItemId(item.id);
  setCartLoading(true);

  try {
    const newQty = Number(item.quantity) + 1;

    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser?.id) return;

    const payload = {
      customer_id: parsedUser.id,
      prod_id: item.prod_id,
      color_code: item.color_code,
      size_or_weight: item.size_or_weight,
      quantity: newQty,
    };

    await dispatch(updateCart(payload)).unwrap();

  } catch (error) {

    console.log("❌ increaseQty ERROR:", error);

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

  if (updatingItemId === item.id) return;

  setUpdatingItemId(item.id);
  setCartLoading(true);

  try {
    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser?.id) return;

    const payload = {
      customer_id: parsedUser.id,
      prod_id: item.prod_id,
      color_code: item.color_code,
      size_or_weight: item.size_or_weight,
      quantity: 0,
    };

    await dispatch(updateCart(payload)).unwrap();

  } catch (error) {

    console.log("❌ deleteItem ERROR:", error);

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

  /* ================= DECREASE ================= */
  const decreaseQty = async (item) => {

  if (updatingItemId === item.id) return;
  if (Number(item.quantity) <= 1) return;

  setUpdatingItemId(item.id);
  setCartLoading(true);

  try {
    const newQty = Number(item.quantity) - 1;

    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser?.id) return;

    const payload = {
      customer_id: parsedUser.id,
      prod_id: item.prod_id,
      color_code: item.color_code,
      size_or_weight: item.size_or_weight,
      quantity: newQty,
    };

    await dispatch(updateCart(payload)).unwrap();

  } catch (error) {

    console.log("❌ decreaseQty ERROR:", error);

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

  /* ================= ITEM ================= */
  const renderItem = ({item}) => {
  const isUpdating = updatingItemId === item.id;

  return (
    <View style={[styles.card, { borderColor: colors.border, opacity: isUpdating ? 0.5 : 1 }]}>

      <Image source={{uri: item.image}} style={styles.image} />

      <View style={{flex:1}}>

        {/* 🔥 TOP ROW (NAME + DELETE) */}
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={styles.name}>
            {item.product_name}
          </Text>

          <TouchableOpacity
            onPress={() => deleteItem(item)}
            disabled={isUpdating}
          >
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>

        <Text style={globalStyles.text}>
          {i18n.t('SIZE')}: {item.size_or_weight}
        </Text>

        {/* QTY */}
        <View style={styles.qtyContainer}>

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

        </View>

        <Text style={styles.price}>
          ₹ {item.total_price}
        </Text>

      </View>
    </View>
  );
};


  return(
    <SafeAreaView style={globalStyles.safeArea}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {i18n.t('CART') || 'CART'}
        </Text>

        <View style={{ width: 30 }} />
      </View>

      <View style={{flex:1, padding:15,backgroundColor:colors.background}}  pointerEvents={cartLoading ? "none" : "auto"}>
        
        <FlatList
          data={items}
          keyExtractor={(item)=>item.id.toString()}
          renderItem={renderItem}
          disabled={cartLoading}
          showsVerticalScrollIndicator={false}
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
      <View style={{backgroundColor:colors.background, height:60}} pointerEvents={cartLoading ? "none" : "auto"}>
        {/* TOTAL */}
        <View style={styles.totalBar}>
          <Text style={styles.totalText}>
            Total: ₹ {total}
          </Text>
        </View>
      </View>
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
    borderColor:"#eee",
    padding:10,
    borderRadius:10
  },

  image:{
    width:80,
    height:80,
    marginRight:10,
    borderRadius:8
  },

  name:{ fontSize:16, fontWeight:"bold" },

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

  price:{ marginTop:5, fontWeight:"bold", color:colors.price },

  totalBar:{
    padding:15,
    borderTopWidth:1,
    borderColor:colors.border,
  },

  totalText:{
    fontSize:18,
    fontWeight:"bold",
    color:colors.price
  }
});