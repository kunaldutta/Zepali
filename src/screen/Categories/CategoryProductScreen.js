import React, {useEffect, useMemo, useState} from 'react';

import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import {getCategoryProducts} from '../../services/productService';

import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  globalStyles,
  colors,
} from '../../../src/styles/globalStyles';

import i18n from '../../localization/i18n';

import AppHeader from '../../components/AppHeader';

import {BASE_URL} from '../../network/apiClient';


/* =========================================================
   IMAGE COMPONENT
========================================================= */

const ImageWithLoader = ({uri, style}) => {

  const [loading, setLoading] = useState(true);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>

      {loading && (
        <ActivityIndicator
          size="small"
          color="#000"
          style={{
            position: 'absolute',
          }}
        />
      )}

      <Image
        source={{
          uri: BASE_URL + uri,
        }}
        style={style}
        onLoadEnd={() => setLoading(false)}
        resizeMode="contain"
      />

    </View>
  );
};


/* =========================================================
   MAIN SCREEN
========================================================= */

export default function CategoryProductScreen({
  route,
  navigation,
}) {

  const {
    categoryId,
    categoryName,
  } = route.params;


  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);


  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {

    loadProducts();

  }, []);


  const loadProducts = async () => {

    setLoading(true);

    try {

      /* USER */

      const user =
        await AsyncStorage.getItem('USER_DATA');

      const parsedUser =
        user ? JSON.parse(user) : null;


      /* CITY */

      const cityData =
        await AsyncStorage.getItem('SELECTED_CITY');

      const userCity =
        cityData ? JSON.parse(cityData) : null;


      console.log(
        'USER CITY:',
        userCity?.id
      );


      /* API */

      const json =
        await getCategoryProducts(
          categoryId,
          i18n.locale,
          parsedUser?.country_code,
          userCity?.id
        );


      console.log(
        'CategoryProducts JSON:',
        json
      );


      if (!json) {

        throw new Error(
          'No response from server'
        );

      }


      if (
        json?.status &&
        json?.total === 0
      ) {

        Alert.alert(
          'No products found for this category in your city'
        );

        return;
      }


      setProducts(
        json?.products || []
      );


    } catch (error) {

      console.log(
        '❌ CategoryProducts ERROR:',
        error
      );


      const errorMessage =
        error?.message ||
        error ||
        'Something went wrong';


      if (
        String(errorMessage)
          .toLowerCase()
          .includes('network')
      ) {

        Alert.alert(
          'No Internet',
          'Please check your connection'
        );

      } else {

        Alert.alert(
          'Error',
          errorMessage
        );

      }


    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     CREATE SECTIONS
  ======================================================= */

  const sections = useMemo(() => {

    const grouped = {};


    products.forEach(item => {

      const subCatId =
        String(item?.sub_cat_id || '0');


      const subCategoryName =
        item?.sub_category_name ||
        'Other';


      if (!grouped[subCatId]) {

        grouped[subCatId] = {

          sub_cat_id: subCatId,

          title: subCategoryName,

          products: [],

        };

      }


      grouped[subCatId].products.push(item);

    });


    /* =====================================================
       Convert products into rows of 2
    ===================================================== */

    const sectionArray = Object.values(grouped).map(section => {

      const rows = [];


      for (
        let i = 0;
        i < section.products.length;
        i += 2
      ) {

        rows.push(
          section.products.slice(i, i + 2)
        );

      }


      return {

        sub_cat_id: section.sub_cat_id,

        title: section.title,

        data: rows,

      };

    });


    /* =====================================================
       SHUFFLE SECTION ORDER
    ===================================================== */

    sectionArray.sort(() => Math.random() - 0.5);


    return sectionArray;

  }, [products]);


  /* =======================================================
     PRODUCT CARD
  ======================================================= */

  const renderProduct = ({item}) => {

    return (

      <TouchableOpacity
        style={styles.productBox}

        activeOpacity={0.8}

        onPress={() => {

          navigation.navigate(
            'ProductDetailScreen',
            {
              productId: item.id,
            }
          );

        }}>


        {/* OFFER */}

        {Number(item?.max_offer) !== 0 && (

          <View
            style={globalStyles.offerBanner}>

            <Text
              style={globalStyles.offerText}>

              {item?.offer_name ||
                'Get Offer'}

            </Text>

          </View>

        )}


        {/* PRODUCT IMAGE */}

        <ImageWithLoader
          uri={
            item?.colors?.[0]?.images?.[0]
          }

          style={styles.productImg}
        />


        {/* PRODUCT NAME */}

        <Text
          style={styles.productName}
          numberOfLines={3}>
          {item?.product_name}
        </Text>
        {/* DESCRIPTION */}

        <Text
          numberOfLines={2}
          style={styles.desc}>

          {item?.description}

        </Text>


        {/* OLD PRICE */}

        {Number(item?.min_price) >
          Number(item?.final_price) && (

          <Text
            style={[
              styles.price,
              {
                textDecorationLine:
                  'line-through',
              },
            ]}>

            ₹ {item?.min_price}

          </Text>

        )}


        {/* FINAL PRICE */}

        <Text
          style={styles.productFinalPrice}>

          ₹ {item?.final_price}

        </Text>


        {/* RATING */}

        {Number(item?.average_rating) > 0 && (

          <View
            style={styles.starContainer}>

            {[1, 2, 3, 4, 5].map(
              star => (

                <Text
                  key={star}
                  style={[
                    styles.star,

                    star <=
                    Math.round(
                      Number(
                        item?.average_rating
                      )
                    )

                      ? styles.selectedStar

                      : null,
                  ]}>

                  ★

                </Text>

              )
            )}

          </View>

        )}

      </TouchableOpacity>

    );

  };


  /* =======================================================
     SECTION HEADER
  ======================================================= */

  const renderSectionHeader = ({
    section,
  }) => (

    <View
      style={styles.sectionHeader}>

      <Text
        style={styles.sectionTitle}>

        {section.title}

      </Text>

    </View>

  );


  /* =======================================================
     EMPTY
  ======================================================= */

  const renderEmpty = () => {

    if (loading) {
      return null;
    }


    return (

      <Text
        style={styles.emptyText}>

        No products available in this
        category for your city.

      </Text>

    );

  };


  /* =======================================================
     UI
  ======================================================= */

  return (

    <SafeAreaView
      style={globalStyles.safeArea}>


      {/* HEADER */}

      <AppHeader

        title={categoryName}

        onBackPress={() =>
          navigation.goBack()
        }

        showCart={true}

      />


      {/* CONTENT */}

      <View
        style={{
          flex: 1,
          padding: 10,
          backgroundColor:
            colors.background,
        }}>


        <SectionList

          sections={sections}


          /* SECTION HEADER */

          renderSectionHeader={
            renderSectionHeader
          }


          /* PRODUCT ROW */

          renderItem={({item}) => (

            <View
              style={styles.productRow}>

              {item.map(product => (

                <View
                  key={String(product.id)}
                  style={styles.productWrapper}>

                  {renderProduct({
                    item: product,
                  })}

                </View>

              ))}


              {/* EMPTY SPACE FOR SINGLE PRODUCT */}

              {item.length === 1 && (

                <View
                  style={styles.productWrapper}
                />

              )}

            </View>

          )}


          /* KEY */

          keyExtractor={(item, index) =>

            item
              .map(product =>
                String(product.id)
              )
              .join('-') +
            '-' +
            index

          }


          /* EMPTY */

          ListEmptyComponent={
            renderEmpty
          }

          /* PERFORMANCE */

          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
          /* UI */

          showsVerticalScrollIndicator={false}

          stickySectionHeadersEnabled={false}

          contentContainerStyle={{
            paddingBottom: 30,
            flexGrow: 1,
          }}

        />


        {/* LOADER */}

        {loading && (

          <ActivityIndicator

            size="large"

            color="#000"

            style={{
              position: 'absolute',
              top: '50%',
              alignSelf: 'center',
            }}

          />

        )}

      </View>

    </SafeAreaView>

  );

}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* SECTION HEADER */

  sectionHeader: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  /* PRODUCT ROW */

  productRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    paddingHorizontal: 5,
    marginBottom: 10,
  },

  /* PRODUCT WRAPPER */
  productWrapper: {
    width: '48%',
  },


  /* PRODUCT CARD */

  productBox: {
    width: '100%',
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor:
      colors.productColumnBackground,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

  },

  /* PRODUCT IMAGE */

  productImg: {
    width: '100%',
    height: 180,
    marginTop: 25,
  },
  /* PRODUCT NAME */

  productName: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 15,
  },

  /* DESCRIPTION */
  desc: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },


  /* OLD PRICE */

  price: {
    fontSize: 15,
    color: '#c17422',
    marginVertical: 5,
    fontWeight: 'bold',
  },

  /* FINAL PRICE */

  productFinalPrice: {
    fontSize: 15,
    marginTop: 2,
    fontWeight: 'bold',
    color: colors.price,
  },
  /* RATING */
  starContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },

  star: {
    fontSize: 20,
    color: '#D3D3D3',
    marginHorizontal: 2,
  },

  selectedStar: {
    color: '#bca108',
  },

  /* EMPTY */
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },

});