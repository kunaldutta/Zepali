import React, {useEffect} from 'react';
import {
View,
Text,
FlatList,
Image,
StyleSheet,
ActivityIndicator,
TouchableOpacity
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../redux/store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../localization/i18n';

export default function CartScreen({navigation}) {

const dispatch = useDispatch();

const { items, total, loading } = useSelector(state => state.cart);

useEffect(() => {
  loadCart();
}, []);

const loadCart = async () => {

  const userData = await AsyncStorage.getItem("USER_DATA");
  const parsedUser = userData ? JSON.parse(userData) : null;

  if (!parsedUser?.id) return;

  dispatch(fetchCart(parsedUser.id));
};

const renderItem = ({item}) => {

  return (
    
    <View style={styles.card}>

      <Image source={{uri: item.image}} style={styles.image} />

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
<View style={{flex:1, padding:15}}>

  <FlatList
    data={items}
    keyExtractor={(item)=>item.id.toString()}
    renderItem={renderItem}
  />

  <View style={styles.totalBar}>
    <Text style={styles.totalText}>
      Total: ₹ {total}
    </Text>
  </View>

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