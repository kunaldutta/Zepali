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

export default function SearchScreen({route,navigation}){

const {products} = route.params;

const inputRef = useRef(null);

const [search,setSearch] = useState('');
const [filtered,setFiltered] = useState(products);
const [suggestions,setSuggestions] = useState([]);


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
suggestionList.push(item.product_name);
}

if(category.includes(searchText)){
suggestionList.push(item.category_name);
}

searchWords.forEach(word=>{
if(word.includes(searchText)){
suggestionList.push(word);
}
});

});

const uniqueSuggestions = [...new Set(suggestionList)];

setSuggestions(uniqueSuggestions);

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
onPress={()=>navigation.navigate("ProductDetailScreen",{product:item})}
>


<Image
source={{uri:item.colors?.[0]?.images?.[0]}}
resizeMode="contain"
style={styles.productImg}
/>

<Text style={styles.productName}>
{item.product_name}
</Text>

<Text numberOfLines={1} style={styles.productSortDesc}>
{item?.description}
</Text>

<Text style={styles.price}>
₹ {item.colors?.[0]?.min_price}
</Text>


</TouchableOpacity>
);


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

<SafeAreaView style={styles.safeArea}>

<View style={{flex:1}}>

{/* HEADER */}

<View style={styles.header}>

<TouchableOpacity onPress={()=>navigation.goBack()}>
<Ionicons name="arrow-back" size={25}/>
</TouchableOpacity>

<TextInput
ref={inputRef}
placeholder="Search product or category..."
style={styles.searchInput}
value={search}
onChangeText={handleSearch}
returnKeyType="search"
/>

</View>


{/* PRODUCT AREA */}

<View style={{flex:1}}>

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
borderWidth:1,
borderColor:"#ddd",
padding:10,
borderRadius:10,
width:'48%',
marginBottom:10
},

productImg:{
width:'100%',
height:120,
borderRadius:10
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
price:{
fontSize:14,
marginTop:2,
fontWeight:"bold",
color:"#8a4a05"
}

});