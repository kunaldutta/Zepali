import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  globalStyles,
  colors,
} from '../../styles/globalStyles';

import {BASE_URL} from '../../network/apiClient';

import i18n from '../../localization/i18n';

import {
  fetchProductsForSearch,
} from '../../services/productService';
import AppHeader from '../../components/AppHeader';

export default function SearchScreen({navigation}) {

  const inputRef = useRef(null);


  /* =========================================================
     STATE
  ========================================================= */

  const [products, setProducts] = useState([]);

  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState('');

  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  useEffect(() => {

    loadProducts();


    /*
     * Reload products when app language changes
     */

    const handleLanguageChange = () => {

      setSearch('');

      setSuggestions([]);

      loadProducts();

    };



  }, []);


  const loadProducts = async () => {

    try {

      setLoading(true);

      setError('');


      const data = await fetchProductsForSearch();


      console.log(
        'SEARCH PRODUCTS RESPONSE:',
        data
      );


      if (data?.status === true) {

        const productList =
          Array.isArray(data?.products)
            ? data.products
            : [];


        setProducts(productList);

        setFiltered(productList);

      } else {

        setProducts([]);

        setFiltered([]);

        setError(
          data?.message ||
          'Unable to load products'
        );

      }

    } catch (error) {

      console.log(
        'SearchScreen loadProducts ERROR:',
        error
      );


      setProducts([]);

      setFiltered([]);

      setError(
        'Unable to load products. Please try again.'
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     CAPITALIZE WORDS
  ========================================================= */

  const capitalizeWords = (text = '') => {

    return text
      .toLowerCase()
      .split(' ')
      .map(word => {

        if (!word) {
          return '';
        }

        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );

      })
      .join(' ');

  };


  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (text) => {

    setSearch(text);


    const searchText =
      text.toLowerCase().trim();


    /*
     * Empty search
     */

    if (searchText.length === 0) {

      setSuggestions([]);

      setFiltered(products);

      return;

    }


    let suggestionList = [];


    products.forEach(item => {

      const name =
        item?.product_name?.toLowerCase() || '';


      const category =
        item?.category_name?.toLowerCase() || '';


      const searchWords =
        item?.search_words
          ? item.search_words
              .toLowerCase()
              .split(',')
              .map(word => word.trim())
          : [];


      /*
       * Product name
       */

      if (name.includes(searchText)) {

        if (item?.product_name) {

          suggestionList.push(
            capitalizeWords(
              item.product_name
            )
          );

        }

      }


      /*
       * Category
       */

      if (category.includes(searchText)) {

        if (item?.category_name) {

          suggestionList.push(
            capitalizeWords(
              item.category_name
            )
          );

        }

      }


      /*
       * Search words
       */

      searchWords.forEach(word => {

        if (
          word &&
          word.includes(searchText)
        ) {

          suggestionList.push(
            capitalizeWords(word)
          );

        }

      });

    });


    /*
     * Remove duplicate suggestions
     */

    const uniqueSuggestions =
      [...new Set(suggestionList)];


    setSuggestions(
      uniqueSuggestions
    );

  };

  /* =========================================================
   CLEAR SEARCH
========================================================= */

const clearSearch = () => {

  setSearch('');

  setSuggestions([]);

  setFiltered(products);

  inputRef.current?.focus();

};


  /* =========================================================
     PERFORM SEARCH
  ========================================================= */

  const performSearch = () => {

    const searchText =
      search.toLowerCase().trim();


    /*
     * Empty search
     */

    if (!searchText) {

      setFiltered(products);

      setSuggestions([]);

      Keyboard.dismiss();

      return;

    }


    /*
     * Filter products
     */

    const filteredData =
      products.filter(item => {

        const name =
          item?.product_name?.toLowerCase() || '';


        const category =
          item?.category_name?.toLowerCase() || '';


        const searchWords =
          item?.search_words
            ? item.search_words
                .toLowerCase()
                .split(',')
                .map(word => word.trim())
            : [];


        return (

          name.includes(searchText) ||

          category.includes(searchText) ||

          searchWords.some(
            word =>
              word.includes(searchText)
          )

        );

      });


    setFiltered(filteredData);

    setSuggestions([]);

    Keyboard.dismiss();

  };


  /* =========================================================
     SELECT SUGGESTION
  ========================================================= */

  const selectSuggestion = (text) => {

    setSearch(text);


    const searchText =
      text.toLowerCase().trim();


    const filteredData =
      products.filter(item => {

        const name =
          item?.product_name?.toLowerCase() || '';


        const category =
          item?.category_name?.toLowerCase() || '';


        const searchWords =
          item?.search_words
            ? item.search_words
                .toLowerCase()
                .split(',')
                .map(word => word.trim())
            : [];


        return (

          name.includes(searchText) ||

          category.includes(searchText) ||

          searchWords.some(
            word =>
              word.includes(searchText)
          )

        );

      });


    setFiltered(filteredData);

    setSuggestions([]);

    Keyboard.dismiss();

  };


  /* =========================================================
     FINAL PRICE
  ========================================================= */

  const finalPrice = (
    price,
    offer
  ) => {

    const numericPrice =
      Number(price) || 0;


    const numericOffer =
      Number(offer) || 0;


    const result =
      numericPrice -
      (
        numericPrice *
        numericOffer /
        100
      );


    return result.toFixed(2);

  };


  /* =========================================================
     PRODUCT ITEM
  ========================================================= */

  const renderProduct = ({item}) => {

    const hasOffer =
      Number(item?.product_offer) > 0;


    return (

      <TouchableOpacity
        style={styles.productBox}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(
            'ProductDetailScreen',
            {
              productId: item?.id,
            }
          )
        }
      >

        {/* =================================================
            OFFER
        ================================================= */}

        {hasOffer &&
          !!item?.offer_name && (

            <View
              style={
                globalStyles.offerBanner
              }
            >

              <Text
                style={
                  globalStyles.offerText
                }
              >
                {item.offer_name}
              </Text>

            </View>

          )}


        {/* =================================================
            IMAGE
        ================================================= */}

        <Image
          source={{
            uri:
              `${BASE_URL}${item?.image}`,
          }}
          resizeMode="contain"
          style={styles.productImg}
        />


        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <Text
          style={styles.productName}
          numberOfLines={2}
        >
          {item?.product_name}
        </Text>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {!!item?.description && (

          <Text
            numberOfLines={1}
            style={styles.productSortDesc}
          >
            {item.description}
          </Text>

        )}


        {/* =================================================
            ORIGINAL PRICE
        ================================================= */}

        {hasOffer &&
          item?.min_price != null && (

            <Text
              style={[
                styles.price,
                {
                  textDecorationLine:
                    'line-through',
                },
              ]}
            >
              ₹ {item.min_price}
            </Text>

          )}


        {/* =================================================
            FINAL PRICE
        ================================================= */}

        {item?.min_price != null && (

          <Text
            style={
              styles.productFinalPrice
            }
          >
            ₹ {
              hasOffer
                ? finalPrice(
                    item.min_price,
                    item.product_offer
                  )
                : Number(
                    item.min_price
                  ).toFixed(2)
            }
          </Text>

        )}

      </TouchableOpacity>

    );

  };


  /* =========================================================
     SUGGESTION ITEM
  ========================================================= */

  const renderSuggestion = ({item}) => (

    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() =>
        selectSuggestion(item)
      }
      activeOpacity={0.7}
    >

      <Ionicons
        name="search"
        size={16}
        color="#777"
      />


      <Text
        style={styles.suggestionText}
        numberOfLines={1}
      >
        {item}
      </Text>

    </TouchableOpacity>

  );


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <SafeAreaView
        style={
          globalStyles.safeArea
        }
      >

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color={
              colors.primary ||
              '#05b8b8'
            }
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading products...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  /* =========================================================
     SCREEN
  ========================================================= */

  return (

    <SafeAreaView
      style={
        globalStyles.safeArea
      }
    >

      <View
        style={{
          flex: 1,
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}
        <View
          style={styles.header}
        >

          {/* BACK */}

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
          >

            <Ionicons
              name="arrow-back"
              size={25}
            />

          </TouchableOpacity>


          {/* SEARCH INPUT */}

          <View style={styles.searchContainer}>

            <TextInput
              placeholder="Search Product..."
              placeholderTextColor={
                colors.placeholderTextColor
              }
              style={styles.searchInput}
              ref={inputRef}
              value={search}
              onChangeText={handleSearch}
              returnKeyType="search"
              onSubmitEditing={performSearch}
              submitBehavior="blurAndSubmit"
            />

            {search.length > 0 && (

              <TouchableOpacity
                style={[styles.clearButton, {backgroundColor: 'transparent'}]}
                onPress={clearSearch}
                activeOpacity={0.7}
              >

                <Ionicons
                  name="close-circle"
                  size={21}
                  color="#777"
                />

              </TouchableOpacity>

            )}

          </View>

        </View>


        {/* =================================================
            PRODUCT AREA
        ================================================= */}

        <View
          style={{
            flex: 1,
            backgroundColor:
              colors.background,
          }}
        >

          <FlatList
            data={filtered}
            renderItem={
              renderProduct
            }
            keyExtractor={item =>
              item?.id?.toString()
            }
            numColumns={2}
            columnWrapperStyle={{
              justifyContent:
                'space-between',
              paddingHorizontal: 10,
            }}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 20,
            }}
            keyboardShouldPersistTaps={
              'handled'
            }
            showsVerticalScrollIndicator={
              false
            }
          />


          {/* =================================================
              FADE BACKGROUND
          ================================================= */}

          {suggestions.length > 0 && (

            <View
              style={styles.overlay}
              pointerEvents="none"
            />

          )}

        </View>


        {/* =================================================
            SUGGESTIONS
        ================================================= */}

        {suggestions.length > 0 && (

          <View
            style={
              styles.suggestionBox
            }
          >

            <FlatList
              data={suggestions}
              renderItem={
                renderSuggestion
              }
              keyExtractor={(
                item,
                index
              ) =>
                `${item}-${index}`
              }
              keyboardShouldPersistTaps={
                'handled'
              }
              showsVerticalScrollIndicator={
                false
              }
            />

          </View>

        )}


        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {filtered.length === 0 && (

          <View
            style={
              styles.emptyContainer
            }
          >

            <Ionicons
              name="search-outline"
              size={50}
              color="#aaa"
            />


            <Text
              style={
                styles.emptyText
              }
            >
              {error ||
                'No products found'}
            </Text>

          </View>

        )}

      </View>

    </SafeAreaView>

  );

}


/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({

  /* ===========================================================
     HEADER
  =========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.headerBackground,
  },


  searchInput: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },


  /* ===========================================================
     OVERLAY
  =========================================================== */

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0,0,0,0.15)',
    zIndex: 5,
  },


  /* ===========================================================
     SUGGESTIONS
  =========================================================== */

  suggestionBox: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    maxHeight: 300,
    zIndex: 10,
    elevation: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },


  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },


  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },


  /* ===========================================================
     PRODUCT
  =========================================================== */

  productBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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


  productImg: {
    width: '100%',
    height: 180,
    marginTop: 25,
  },


  productName: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: '600',
  },


  productSortDesc: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
    color: '#05b8b8',
  },


  price: {
    fontSize: 15,
    color: '#c17422',
    marginVertical: 5,
    fontWeight: 'bold',
  },


  productFinalPrice: {
    fontSize: 15,
    marginTop: 2,
    fontWeight: 'bold',
    color: colors.price,
  },


  /* ===========================================================
     LOADING
  =========================================================== */

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },


  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#777',
  },


  /* ===========================================================
     EMPTY
  =========================================================== */

  emptyContainer: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },


  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },

  searchContainer: {
  flex: 1,
  marginLeft: 10,
  position: 'relative',
  justifyContent: 'center',
},

clearButton: {
  position: 'absolute',
  right: 10,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},

searchInput: {
  width: '100%',
  backgroundColor: '#f1f1f1',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingRight: 40,
  paddingVertical: 10,
},

});