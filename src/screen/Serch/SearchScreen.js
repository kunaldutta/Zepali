import React, {useState, useRef} from 'react';
import {
View,
Text,
TextInput,
FlatList,
Image,
StyleSheet,
TouchableOpacity,
Keyboard
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {globalStyles,colors} from '../../styles/globalStyles';
import { BASE_URL } from '../../network/apiClient';

export default function SearchScreen({route,navigation}){

const {products} = route.params;

const inputRef = useRef(null);

const [search,setSearch] = useState('');
const [filtered,setFiltered] = useState(products);
const [suggestions,setSuggestions] = useState([]);

const capitalizeWords = (text = '') => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
};
/* SEARCH FUNCTION */

const handleSearch = (text) => {

setSearch(text);

const searchText = text.toLowerCase().trim();

if(searchText.length === 0){
setSuggestions([]);
setFiltered(products);
return;
}

let suggestionList = [];

products.forEach(item => {

const name = item.product_name?.toLowerCase() || '';
const category = item.category_name?.toLowerCase() || '';

const searchWords = item.search_words
? item.search_words.toLowerCase().split(',').map(w => w.trim())
: [];

if(name.includes(searchText)){
suggestionList.push(capitalizeWords(item.product_name));
}

if(category.includes(searchText)){
suggestionList.push(capitalizeWords(item.category_name));
}

searchWords.forEach(word=>{
if(word.includes(searchText)){
suggestionList.push(capitalizeWords(word));
}
});

});

const uniqueSuggestions = [...new Set(suggestionList)];

setSuggestions(uniqueSuggestions);

};

const performSearch = () => {

  const searchText = search.toLowerCase().trim();

  if (!searchText) {
    setFiltered(products);
    setSuggestions([]);
    Keyboard.dismiss();
    return;
  }

  const filteredData = products.filter(item => {

    const name = item.product_name?.toLowerCase() || '';
    const category = item.category_name?.toLowerCase() || '';

    const searchWords = item.search_words
      ? item.search_words.toLowerCase().split(',').map(w => w.trim())
      : [];

    return (
      name.includes(searchText) ||
      category.includes(searchText) ||
      searchWords.some(word => word.includes(searchText))
    );

  });

  setFiltered(filteredData);
  setSuggestions([]);
  Keyboard.dismiss();

};


/* SELECT SUGGESTION */

const selectSuggestion = (text) => {

setSearch(text);

const searchText = text.toLowerCase();

const filteredData = products.filter(item => {

const name = item.product_name?.toLowerCase() || '';
const category = item.category_name?.toLowerCase() || '';

const searchWords = item.search_words
? item.search_words.toLowerCase().split(',').map(w => w.trim())
: [];

return (
name.includes(searchText) ||
category.includes(searchText) ||
searchWords.some(word => word.includes(searchText))
);

});

setFiltered(filteredData);

// close suggestions
setSuggestions([]);

// ✅ CLOSE KEYBOARD (MAIN FIX)
Keyboard.dismiss();

};


/* PRODUCT ITEM */

const renderProduct = ({item}) => (
<TouchableOpacity
style={styles.productBox}
onPress={()=>navigation.navigate("ProductDetailScreen",{productId:item.id})}
>
  {console.log('MAX ===', item)}
{item?.effective_discount_percentage !== 0 && !!item.offer_name && (
      <View style={globalStyles.offerBanner}>
        <Text style={globalStyles.offerText}>
          {item?.offer_name}
        </Text>
      </View>
    )}

<Image
source={{uri:BASE_URL+item?.image}}
resizeMode="contain"
style={styles.productImg}
/>

<Text style={styles.productName}>
{item.product_name}
</Text>

<Text numberOfLines={1} style={styles.productSortDesc}>
{item?.description}
</Text>

<Text style={[styles.price, { textDecorationLine: 'line-through' }]}>
₹ {item?.min_price}
</Text>
<Text style={styles.productFinalPrice}>
₹ {finalPrice(item?.min_price, item?.product_offer)}
</Text>


</TouchableOpacity>
);

 const finalPrice = (price, offer) =>{
    
    let finalPrice = price - (price * (offer/100))
   
    return finalPrice; 
  }
/* SUGGESTION ITEM */

const renderSuggestion = ({item}) => (

<TouchableOpacity
style={styles.suggestionItem}
onPress={()=>selectSuggestion(item)}
activeOpacity={0.7}
>

<Ionicons name="search" size={16} color="#777"/>

<Text style={styles.suggestionText}>
{item}
</Text>

</TouchableOpacity>

);


return(

<SafeAreaView style={globalStyles.safeArea}>

<View style={{flex:1}}>

{/* HEADER */}

<View style={styles.header}>

<TouchableOpacity onPress={()=>navigation.goBack()}>
<Ionicons name="arrow-back" size={25}/>
</TouchableOpacity>

<TextInput
  placeholder="Search product or category..."
  placeholderTextColor={colors.placeholderTextColor}
  style={styles.searchInput}
  ref={inputRef}
  value={search}
  onChangeText={handleSearch}
  returnKeyType="search"
  onSubmitEditing={performSearch}
  submitBehavior="blurAndSubmit"
/>

</View>


{/* PRODUCT AREA */}

<View style={{flex:1, backgroundColor:colors.background}}>

<FlatList
data={filtered}
renderItem={renderProduct}
keyExtractor={(item)=>item.id.toString()}
numColumns={2}
columnWrapperStyle={{justifyContent:'space-between',padding:10}}
/>

{/* FADE BACKGROUND */}

{suggestions.length > 0 && (
<View style={styles.overlay}/>
)}

</View>


{/* SUGGESTIONS */}

{suggestions.length > 0 && (

<View style={styles.suggestionBox}>

<FlatList
data={suggestions}
renderItem={renderSuggestion}
keyExtractor={(item,index)=>index.toString()}
keyboardShouldPersistTaps="handled"
/>

</View>

)}

</View>

</SafeAreaView>

);

}



const styles = StyleSheet.create({

safeArea:{
flex:1,
backgroundColor:"#fff"
},

header:{
flexDirection:'row',
alignItems:'center',
padding:10,
borderBottomWidth:1,
borderColor:'#eee'
},

searchInput:{
flex:1,
marginLeft:10,
backgroundColor:'#f1f1f1',
borderRadius:10,
padding:10
},

overlay:{
...StyleSheet.absoluteFillObject,
backgroundColor:'rgba(0,0,0,0.15)',
zIndex:5
},

suggestionBox:{
position:'absolute',
top:60,
left:0,
right:0,
backgroundColor:"#fff",
maxHeight:300,
zIndex:10,
elevation:5,
borderBottomLeftRadius:10,
borderBottomRightRadius:10
},

suggestionItem:{
flexDirection:'row',
alignItems:'center',
padding:12,
borderBottomWidth:1,
borderColor:"#eee"
},

suggestionText:{
marginLeft:10,
fontSize:14
},

productBox:{
    width:'46%',
    borderWidth:1,
    borderColor:colors.border,
    borderRadius:10,
    padding:10,
    marginBottom:10,
    backgroundColor:colors.productColumnBackground,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },

productImg:{
    width:'100%',
    height:180,
    marginTop:25,
  },

productName:{
fontSize:14,
marginTop:5,
fontWeight:'600'
},
productSortDesc:{
fontSize:12,
marginTop:3,
fontWeight:"500",
color:"#05b8b8"
},
price: { fontSize: 15, color: "#c17422", marginVertical: 5, fontWeight:'bold' },
  
productFinalPrice:{
  fontSize:15,
  marginTop:2,
  fontWeight:"bold",
  color:colors.price
},

});