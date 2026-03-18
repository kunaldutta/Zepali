import React, {useEffect, useState} from 'react';
import {
View,
Text,
FlatList,
Image,
StyleSheet,
ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCartAPI } from '../../services/productService';

export default function CartScreen() {

const [cart,setCart] = useState([]);
const [loading,setLoading] = useState(true);
const [total,setTotal] = useState(0);

useEffect(() => {
  loadCart();
}, []);

const loadCart = async () => {

  try {

    const userData = await AsyncStorage.getItem("USER_DATA");
    const parsedUser = userData ? JSON.parse(userData) : null;

    if (!parsedUser?.id) return;

    const res = await getCartAPI(parsedUser.id);

    if(res?.status === "success"){
      setCart(res.cart || []);
      setTotal(res.total_amount || 0);
    }

  } catch (e) {
    console.log("Cart error:", e);
  } finally {
    setLoading(false);
  }
};

const renderItem = ({item}) => {

  return (
    <View style={styles.card}>

      <Image
        source={{uri: item.image}}
        style={styles.image}
      />

      <View style={{flex:1}}>

        <Text style={styles.name}>
          {item.product_name}
        </Text>

        <Text>Size: {item.size_or_weight}</Text>
        <Text>Qty: {item.quantity}</Text>

        <Text style={styles.price}>
          ₹ {item.total_price}
        </Text>

      </View>

    </View>
  );
};

if(loading){
  return <ActivityIndicator style={{marginTop:50}} />;
}

return(

<View style={{flex:1, padding:15}}>

  <FlatList
    data={cart}
    keyExtractor={(item)=>item.id.toString()}
    renderItem={renderItem}
  />

  {/* TOTAL */}
  <View style={styles.totalBar}>
    <Text style={styles.totalText}>
      Total: ₹ {total}
    </Text>
  </View>

</View>

);
}

const styles = StyleSheet.create({

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

name:{
fontSize:16,
fontWeight:"bold"
},

price:{
marginTop:5,
fontWeight:"bold",
color:"#27ae60"
},

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