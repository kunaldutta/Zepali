import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../localization/i18n';
import ImageCarousel from '../../components/ImageCarousel';
import AppHeader from '../../components/AppHeader';
import { BASE_URL } from '../../network/apiClient';


export default function ProductDetailUI(props) {
  const {
    navigation,
    styles,
    images,
    scrollRef,
    onScrollEnd,
    imageLoading,
    setImageLoading,
    activeIndex,
    selectedColor,
    thumbLoading,
    setThumbLoading,
    selectImage,
    product,
    quantity,
    increaseQty,
    decreaseQty,
    updating = false,
    cartLoaded,
    selectedVariant,
    colors,
    changeColor,
    variants,
    setSelectedVariant,
    setQuantity,
    existingCartItem,
    goToCart,
    handleAddToCart,
    cartLoading,
  } = props;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <AppHeader
  title={i18n.t('PRODUCTS_DETAIL') || 'Product Detail'}
  onBackPress={() => navigation.goBack()}
/>

      <ScrollView style={styles.container}>
        {/* IMAGE CAROUSEL */}
        <ImageCarousel
          images={images}
          scrollRef={scrollRef}
          onScrollEnd={onScrollEnd}
          imageLoading={imageLoading}
          setImageLoading={setImageLoading}
        />

        {/* PAGINATION */}
        <View style={styles.pagination}>
          {images.map((_, index) => {
            const active = activeIndex === index;
            return (
              <View
                key={`dot_${index}`}
                style={[styles.dot, active && styles.activeDot]}
              />
            );
          })}
        </View>

        {/* THUMBNAILS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
          key={`thumb_${selectedColor?.color_code}`}
        >
          {images.map((img, index) => {
            const isSelected = activeIndex === index;

            return (
              <TouchableOpacity
                key={`thumb_${img}_${index}`}
                onPress={() => selectImage(index)}
              >
                <View style={styles.thumbWrapper}>
                  {thumbLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#27ae60"
                      style={styles.thumbLoader}
                    />
                  )}

                  <Image
                    source={{ uri: BASE_URL+img }}
                    style={[
                      styles.thumbnail,
                      isSelected && styles.selectedThumbnail,
                    ]}
                    onLoadEnd={() => setThumbLoading(false)}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* PRODUCT INFO */}
        <View style={styles.infoContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.name}>{product.product_name}</Text>

            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={[styles.qtyBtn, updating && { opacity: 0.5 }]}
                onPress={decreaseQty}
              >
                <Text style={styles.qtySymbol}>-</Text>
              </TouchableOpacity>

              {!cartLoaded || updating ? (
                <ActivityIndicator size="small" color="#27ae60" />
              ) : (
                <Text style={styles.qtyText}>{quantity}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.qtyBtn,
                  updating && { opacity: 0.5 },
                  quantity === selectedVariant?.stock && { opacity: 0.4 },
                ]}
                onPress={increaseQty}
                disabled={quantity === selectedVariant?.stock}
              >
                <Text style={styles.qtySymbol}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedVariant && (
            <Text style={styles.price}>₹ {selectedVariant.price}</Text>
          )}

          {/* COLOR */}
          {colors.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.measurementTitle}>
                {i18n.t('SELECT_COLOR') || 'Select Color'}
              </Text>

              <ScrollView horizontal>
                {colors.map(c => {
                  const selected =
                    selectedColor &&
                    selectedColor.color_code === c.color_code;

                  return (
                    <TouchableOpacity
                      key={c.color_code}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c.color_code },
                        selected && styles.selectedColorCircle,
                      ]}
                      onPress={() => changeColor(c)}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* SIZE */}
          {variants.length > 0 && (
            <View style={styles.measurementContainer}>
              <Text style={styles.measurementTitle}>
                {i18n.t('SELECT_SIZE') || 'Select Size'}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {variants.map((m, index) => {
                  const isSelected =
                    selectedVariant &&
                    selectedVariant.measurement_value === m.measurement_value;

                  return (
                    <TouchableOpacity
                      key={`${m.measurement_value}_${index}`}
                      style={[
                        styles.measureBtn,
                        isSelected && styles.selectedMeasure,
                      ]}
                      onPress={() => {
                        setSelectedVariant(m);
                        setQuantity(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.measureValue,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {m.measurement_value}
                      </Text>

                      <Text
                        style={[
                          styles.measureStock,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        Stock: {m.stock}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* DESCRIPTION */}
          {product.description !== '' && (
            <>
              <Text style={styles.descTitle}>
                {i18n.t('PRODUCTS_DECRIPTION') || 'Product Description'}
              </Text>

              <Text style={styles.description}>{product.description}</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={existingCartItem ? goToCart : handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cartText}>
              {existingCartItem ? (i18n.t('GO_TO_CART') || 'Go to Cart') : (i18n.t('ADD_TO_CART') || 'Add to Cart')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}