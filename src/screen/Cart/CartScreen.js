import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCart } from '../../redux/store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../localization/i18n';

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
    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;

    if (!parsedUser?.id) return;

    dispatch(fetchCart(parsedUser.id));
  };

  /* ================= INCREASE ================= */
  const increaseQty = async (item) => {
    setCartLoading(true);
    try {
      if (updatingItemId === item.id) return;

      setUpdatingItemId(item.id);

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
    } finally {
      setUpdatingItemId(null);
      setCartLoading(false);
    }
  };

  /* ================= DELETE ================= */
const deleteItem = async (item) => {
  setCartLoading(true);

  try {
    if (updatingItemId === item.id) return;

    setUpdatingItemId(item.id);

    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser?.id) return;

    const payload = {
      customer_id: parsedUser.id,
      prod_id: item.prod_id,
      color_code: item.color_code,
      size_or_weight: item.size_or_weight,
      quantity: 0, // ✅ IMPORTANT (DELETE)
    };

    await dispatch(updateCart(payload)).unwrap();

  } catch (error) {
    console.log("❌ deleteItem ERROR:", error);
  } finally {
    setUpdatingItemId(null);
    setCartLoading(false);
  }
};

  /* ================= DECREASE ================= */
  const decreaseQty = async (item) => {
    setCartLoading(true);
    try {
      if (updatingItemId === item.id) return;
      if (Number(item.quantity) <= 1) return;

      setUpdatingItemId(item.id);

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
    } finally {
      setUpdatingItemId(null);
      setCartLoading(false);
    }
  };

  /* ================= ITEM ================= */
  const renderItem = ({item}) => {
  const isUpdating = updatingItemId === item.id;

  return (
    <View style={[styles.card,{ opacity: isUpdating ? 0.5 : 1 }]}>

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

        <Text>{i18n.t('SIZE')}: {item.size_or_weight}</Text>

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
          {i18n.t('CART') || 'CART'}
        </Text>

        <View style={{ width: 30 }} />
      </View>

      <View style={{flex:1, padding:15,}}  pointerEvents={cartLoading ? "none" : "auto"}>
        
        <FlatList
          data={items}
          keyExtractor={(item)=>item.id.toString()}
          renderItem={renderItem}
          disabled={cartLoading}
        />

        {/* TOTAL */}
        <View style={styles.totalBar}>
          <Text style={styles.totalText}>
            Total: ₹ {total}
          </Text>
        </View>
      {cartLoading && <View style={{width:60, height:60,
       position:'absolute',
       top: '40%',
      backgroundColor:'#727577',
         justifyContent:'center', alignItems:'center', alignSelf:'center', borderRadius:10}}> 
        <ActivityIndicator 
            size="small"
            color="#fff"/> 
            </View>}
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
    borderColor: '#eee',
  },

  backBtn: { padding: 5 },

  headerTitle: { fontSize: 18, fontWeight: 'bold' },

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
    marginTop:8
  },

  qtyBtn:{
    width:35,
    height:35,
    borderRadius:6,
    borderWidth:1,
    borderColor:"#27ae60",
    justifyContent:"center",
    alignItems:"center"
  },

  qtySymbol:{
    fontSize:18,
    fontWeight:"bold",
    color:"#27ae60"
  },

  qtyText:{
    marginHorizontal:15,
    fontSize:16,
    fontWeight:"bold"
  },

  price:{ marginTop:5, fontWeight:"bold", color:"#27ae60" },

  totalBar:{
    padding:15,
    borderTopWidth:1,
    borderColor:"#eee"
  },

  totalText:{
    fontSize:18,
    fontWeight:"bold"
  }
});