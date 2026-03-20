import React, {useEffect, useState} from 'react';
import {
View,
Text,
FlatList,
Image,
StyleSheet,
ActivityIndicator,
TouchableOpacity
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getHomeData} from '../../services/productService';
import i18n from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {globalStyles,colors} from '../../styles/globalStyles';
import { Alert } from 'react-native';



/* IMAGE WITH LOADER */

const ImageWithLoader = ({uri, style, resizeMode}) => {

const [loading,setLoading] = useState(true);

return(

<View style={{justifyContent:'center',alignItems:'center'}}>

{loading && (
<ActivityIndicator
size="small"
color="#000"
style={{position:'absolute'}}
/>
)}

<Image
source={{uri:uri}}
style={style}
resizeMode={resizeMode}
onLoadEnd={()=>setLoading(false)}
/>

</View>

);

};



export default function HomeScreen({navigation}){

const [offers,setOffers] = useState([]);
const [categories,setCategories] = useState([]);
const [products,setProducts] = useState([]);
const [refreshing,setRefreshing] = useState(false);
const [userName,setUserName] = useState('');



useEffect(()=>{
 loadHome();
},[]);



/* LOAD API */

const loadHome = async () => {

  const user = await AsyncStorage.getItem('USER_DATA');
  let parsedUser = user ? JSON.parse(user) : null;

  if(parsedUser){
    setUserName(parsedUser?.name || '');
  }

  try{
    setRefreshing(true);

    const json = await getHomeData(
      i18n.locale,
      parsedUser?.country_code
    );

    // ❗ handle empty / invalid response
    if (!json) {
      throw new Error("No response from server");
    }

    setOffers(json?.offers || []);
    setCategories(json?.categories || []);
    setProducts(json?.products || []);

  } catch (error) {

    console.log("API ERROR:", error);

    // ✅ detect internet issue (important)
    if (
      error.message === "Network request failed" ||
      error.message?.includes("Network") ||
      error.message?.includes("fetch")
    ) {
      Alert.alert("No Internet", "Please check your connection");
    } else {
      Alert.alert("Error", "Something went wrong");
    }

  } finally {
    setRefreshing(false); // ✅ always run
  }
};



/* GET CATEGORY NAME */

const getCategoryName = (id) => {

const cat = categories.find(c => c.id == id);

return cat ? cat.category_name : '';

};



/* OFFERS */

const renderOffer = ({item}) => (

<View style={styles.offerContainer}>

<ImageWithLoader
uri={item.image}
style={styles.offerImg}
resizeMode="contain"
/>

<View style={styles.offerTextContainer}>

<Text style={styles.offerTitle}>
{item.title}
</Text>

<Text style={styles.offerDiscount}>
{item.offer_percentage}% OFF on ₹{item.offer_on_amount}
</Text>

<Text style={styles.offerCategory}>
For: {getCategoryName(item.apply_for_category)}
</Text>

</View>

</View>

);



/* CATEGORIES */

const renderCategory = ({item}) => (

<TouchableOpacity
  style={styles.categoryBox}
  onPress={() =>
    navigation.navigate("CategoryProductScreen", {
      categoryId: item.id,
      categoryName: item.category_name
    })
  }
>

<View style={styles.categoryImageContainer}>
<ImageWithLoader
uri={item.image}
style={styles.categoryImg}
resizeMode="contain"
/>
</View>

<Text style={styles.categoryText}>
{item.category_name}
</Text>

</TouchableOpacity>

);


/* PRODUCTS */

const renderProduct = ({item}) => (

<TouchableOpacity
style={styles.productBox}
onPress={()=>navigation.navigate("ProductDetailScreen",{product:item})}
>

<ImageWithLoader
uri={item?.colors[0]?.images[0]}
style={styles.productImg}
resizeMode="contain"
/>

<Text style={styles.productName}>
{item?.product_name}
</Text>
<Text numberOfLines={1} style={styles.productSortDesc}>
{item?.description}
</Text>
<Text style={styles.productPrice}>
₹ {item?.colors[0]?.variants[0]?.price}
</Text>

</TouchableOpacity>

);



/* HEADER CONTENT */

const ListHeader = () => (

<View>

{/* SEARCH */}

<View style={styles.searchContainer}>

<Ionicons
name="search"
size={22}
color="#777"
style={styles.searchIcon}
/>

<TouchableOpacity
style={{flex:1}}
onPress={()=>navigation.navigate("SearchScreen",{products:products})}
>

<Text style={{padding:10,color:"#777"}}>
Search product...
</Text>

</TouchableOpacity>

</View>



{/* OFFERS */}

<Text style={globalStyles.title}>{i18n.t('OFFERS')}</Text>

<FlatList
data={offers}
horizontal
renderItem={renderOffer}
keyExtractor={(item)=>item.id.toString()}
showsHorizontalScrollIndicator={false}
/>



{/* CATEGORIES */}

<Text style={globalStyles.title}>{i18n.t('CATEGORIES')}</Text>

<FlatList
  data={categories}
  renderItem={renderCategory}
  keyExtractor={(item)=>item.id.toString()}
  numColumns={3}   // change 3 or 4 as per UI
  columnWrapperStyle={{justifyContent:'space-between', paddingHorizontal:10}}
  scrollEnabled={false} // IMPORTANT (inside main FlatList)
 />



{/* PRODUCTS TITLE */}

<Text style={globalStyles.title}>{i18n.t('PRODUCTS')}</Text>

</View>

);



return(

<SafeAreaView edges={['top','left','right']} style={styles.safeArea}>

<View style={[styles.header, {borderColor: colors.border}]}>

<Text style={styles.headerTitle}>Hello, {userName}!</Text>

<TouchableOpacity onPress={loadHome}>
<Ionicons name="refresh" size={24} color="#000" />
</TouchableOpacity>

</View>

<View style={globalStyles.container}>

{refreshing ? (

<ActivityIndicator size="large" color="#000" style={{marginTop:20}} />

) : (

<FlatList
data={products}
renderItem={renderProduct}
keyExtractor={(item)=>item.id.toString()}
numColumns={2}
columnWrapperStyle={{justifyContent:'space-between', paddingHorizontal:5}}
ListHeaderComponent={ListHeader}
contentContainerStyle={{paddingBottom:5}}
showsVerticalScrollIndicator={false}
/>

)}
</View>
</SafeAreaView>

);

}



/* STYLES */

const styles = StyleSheet.create({

safeArea:{
flex:1,
backgroundColor:colors.safeAreaColor,
borderColor:'#2b0303',
},

header:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
padding:15,
borderBottomWidth:1,
borderColor:colors.border
},

headerTitle:{
fontSize:15,
fontWeight:'bold',
color:colors.headerTitleColor
},

searchContainer:{
flexDirection:'row',
alignItems:'center',
backgroundColor:'#f1f1f1',
margin:10,
borderRadius:10,
paddingHorizontal:10
},

searchIcon:{
marginRight:5
},

title:{
fontSize:20,
fontWeight:'bold',
marginLeft:10,
marginTop:15
},

offerContainer:{
width:120,
height:100,
margin:10,
},

offerImg:{
width:120,
height:120,
borderRadius:10
},

offerTextContainer:{
position:"absolute",
bottom:10,
left:10,
backgroundColor:"rgba(0,0,0,0.5)",
padding:6,
borderRadius:6
},

offerTitle:{
color:"#fff",
fontSize:16,
fontWeight:"bold"
},

offerDiscount:{
color:"#fff",
fontSize:13
},

offerCategory:{
color:"#fff",
fontSize:12
},

categoryBox:{
alignItems:"center",
margin:5,
backgroundColor:colors.productColumnBackground,
borderRadius:10,
padding:10,
width:'30%'
},

categoryImageContainer:{
width:60,
height:50,
backgroundColor:colors.productColumnBackground,
borderRadius:10,
justifyContent:"center",
alignItems:"center"
},

categoryImg:{
width:50,
height:45,
},

categoryText:{
fontSize:14,
marginTop:5,
width:75,
alignContent:"center",
textAlign:"center",
fontSize:14,
fontWeight:"bold",
color:"#087b92"
},

productBox:{
margin:5,
borderWidth:1,
borderColor:"#ddd",
padding:10,
borderRadius:10,
width:'46%',
backgroundColor:colors.productColumnBackground
},

productImg:{
width:'100%',
height:100,
borderRadius:10
},

productName:{
fontSize:15,
marginTop:6,
fontWeight:"500"
},
productSortDesc:{
fontSize:12,
marginTop:3,
fontWeight:"500",
color:"#05b8b8"
},
productPrice:{
fontSize:14,
marginTop:2,
fontWeight:"bold",
color:"#8a4a05"
}

});