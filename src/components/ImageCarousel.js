import {
View,
Text,
Image,
StyleSheet,
ScrollView,
TouchableOpacity,
Dimensions,
ActivityIndicator,
Alert
} from 'react-native';
export default function ImageCarousel({
  images,
  scrollRef,
  onScrollEnd,
  imageLoading,
  setImageLoading
}) {
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onScrollEnd}
    >
      {images.map((img,index)=>(
        <View key={index} style={{width:Dimensions.get('window').width, height:300}}>
          {imageLoading && <ActivityIndicator />}
          <Image
            source={{uri:img}}
            style={{width:'100%', height:300}}
            resizeMode="contain"
            onLoadEnd={()=>setImageLoading(false)}
          />
        </View>
      ))}
    </ScrollView>
  );
}