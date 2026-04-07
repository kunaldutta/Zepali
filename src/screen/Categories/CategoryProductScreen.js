import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import {getCategoryProducts} from '../../services/productService';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {globalStyles,colors} from '../../../src/styles/globalStyles';
import i18n from '../../localization/i18n';
import AppHeader from '../../components/AppHeader';
import { BASE_URL } from '../../network/apiClient';

/* ================= IMAGE COMPONENT ================= */
const ImageWithLoader = ({uri, style}) => {
  const [loading,setLoading] = useState(true);
  console.log('IMGAE ===',BASE_URL+uri)
  return (
    <View style={{justifyContent:'center',alignItems:'center'}}>
      {console.log('LOADING ==',BASE_URL + uri)}
      {loading && (
        <ActivityIndicator
          size="small"
          color="#000"
          style={{position:'absolute'}}
        />
      )}

      <Image
        source={{ uri: BASE_URL + uri }}
        style={style}
        onLoadEnd={()=>setLoading(false)}
        resizeMode="contain"
      />
    </View>
  );
};

/* ================= MAIN SCREEN ================= */
export default function CategoryProductScreen({route, navigation}){

  const {categoryId, categoryName} = route.params;

  const [products,setProducts] = useState([]);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    loadProducts();
  },[]);

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {

    setLoading(true);

    try {

      const user = await AsyncStorage.getItem('USER_DATA');
      let parsedUser = user ? JSON.parse(user) : null;

      const json = await getCategoryProducts(
        categoryId,
        i18n.locale,
        parsedUser?.country_code
      );

      if (!json) {
        throw new Error("No response from server");
      }

      setProducts(json?.products || []);

    } catch (error) {

      console.log("❌ CategoryProducts ERROR:", error);

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
      setLoading(false);
    }
  };

  /* ================= PRODUCT ITEM ================= */
  const renderProduct = ({item}) => (

    <TouchableOpacity
      style={styles.productBox}
      onPress={()=>{
        console.log('ITEM ==',item.id)
        navigation.navigate("ProductDetailScreen",{productId:item.id})}}
    >
      {item?.max_offer !== 0 && (
            <View style={globalStyles.offerBanner}>
              <Text style={globalStyles.offerText}>
                Offer up to{'\n'}
                {item.max_offer}%
              </Text>
            </View>
          )}
      <ImageWithLoader
        uri={item?.colors?.[0]?.images?.[0]}
        style={styles.productImg}
      />

      <Text style={styles.productName}>
        {item.product_name}
      </Text>

      <Text numberOfLines={1} style={styles.desc}>
        {item.description}
      </Text>

      <Text style={[styles.price, { textDecorationLine: 'line-through' }]}>
        ₹ {item.min_price}
      </Text>
      <Text style={styles.productFinalPrice}>
        ₹ {item.final_price}
      </Text>
    </TouchableOpacity>
  );

  return(

    <SafeAreaView style={globalStyles.safeArea}>

      {/* HEADER */}
      <AppHeader
        title={categoryName}
        onBackPress={() => navigation.goBack()}
        showCart={true}
      />

      {/* CONTENT */}
      <View style={{flex:1, padding:10, backgroundColor:colors.background}}>

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item)=>item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{justifyContent:'space-between', padding:10}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom:20, flexGrow:1}}
          ListEmptyComponent={
            !loading && (
              <Text style={{textAlign:'center', marginTop:50}}>
                No products available
              </Text>
            )
          }
        />

        {/* LOADER OVERLAY */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#000"
            style={{
              position:'absolute',
              top:'50%',
              alignSelf:'center'
            }}
          />
        )}

      </View>

    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  safeArea:{flex:1, backgroundColor:"#fff"},

  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    padding:15,
    borderBottomWidth:1,
    borderColor:colors.border
  },

  title:{
    fontSize:16,
    fontWeight:'bold'
  },

  productBox:{
    width:'46%',
    borderWidth:1,
    borderColor:colors.border,
    borderRadius:10,
    padding:10,
    marginBottom:10,
    backgroundColor:colors.productColumnBackground
  },

  productImg:{
    width:'100%',
    height:100,
    borderRadius:10
  },

  productName:{
    fontWeight:'bold',
    marginTop:5
  },

  desc:{
    fontSize:12,
    color:'#666'
  },

  price: { fontSize: 15, color: "#c17422", marginVertical: 5, fontWeight:'bold' },
  
  productFinalPrice:{
  fontSize:15,
  marginTop:2,
  fontWeight:"bold",
  color:colors.price
  },

});