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

import {
  fetchProductsForSearch,
} from '../../services/productService';


/* =========================================================
   PRODUCTS PER API REQUEST

   Production:
   100

   Testing:
   10
========================================================= */

const PRODUCTS_PER_PAGE = 100;


export default function SearchScreen({navigation}) {

  const inputRef = useRef(null);

  const loadingMoreRef = useRef(false);
  const initialLoadRef = useRef(false);
  const searchLoadingRef = useRef(false);

  const productsRef = useRef([]);

  const offsetRef = useRef(0);

  const hasMoreRef = useRef(true);

  /*
   * Prevent FlatList from repeatedly calling
   * onEndReached without a real scroll.
   */
  const canLoadMoreRef = useRef(false);


  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState('');

  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [error, setError] = useState('');


  /* =========================================================
     REMOVE DUPLICATE PRODUCTS
  ========================================================= */

  const removeDuplicateProducts = items => {

    const unique = new Map();

    items.forEach(item => {

      if (
        item?.id !== undefined &&
        item?.id !== null
      ) {

        unique.set(
          String(item.id),
          item,
        );

      }

    });

    return Array.from(
      unique.values(),
    );

  };


  /* =========================================================
     UPDATE PRODUCTS
  ========================================================= */

  const updateProducts = newProducts => {

    const uniqueProducts =
      removeDuplicateProducts(
        newProducts,
      );

    productsRef.current =
      uniqueProducts;

    return uniqueProducts;

  };


  /* =========================================================
     PRODUCT MATCH
  ========================================================= */

  const productMatchesSearch = (
    item,
    searchText,
  ) => {

    const name =
      item?.product_name
        ?.toLowerCase() || '';

    const category =
      item?.category_name
        ?.toLowerCase() || '';

    const searchWords =
      item?.search_words
        ? item.search_words
            .toLowerCase()
            .split(',')
            .map(word =>
              word.trim(),
            )
            .filter(Boolean)
        : [];


    return (
      name.includes(searchText) ||
      category.includes(searchText) ||
      searchWords.some(word =>
        word.includes(searchText),
      )
    );

  };


  /* =========================================================
     CAPITALIZE WORDS
  ========================================================= */

  const capitalizeWords = (
    text = '',
  ) => {

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
     GET SUGGESTIONS
  ========================================================= */

  const getSuggestions = (
    productList,
    searchText,
  ) => {

    const suggestionList = [];


    productList.forEach(item => {

      const name =
        item?.product_name
          ?.toLowerCase() || '';

      const category =
        item?.category_name
          ?.toLowerCase() || '';

      const searchWords =
        item?.search_words
          ? item.search_words
              .toLowerCase()
              .split(',')
              .map(word =>
                word.trim(),
              )
              .filter(Boolean)
          : [];


      /* PRODUCT NAME */

      if (
        name.includes(searchText)
      ) {

        suggestionList.push(
          capitalizeWords(
            item?.product_name || '',
          ),
        );

      }


      /* CATEGORY */

      if (
        category.includes(searchText)
      ) {

        suggestionList.push(
          capitalizeWords(
            item?.category_name || '',
          ),
        );

      }


      /* SEARCH WORDS */

      searchWords.forEach(word => {

        if (
          word.includes(searchText)
        ) {

          suggestionList.push(
            capitalizeWords(word),
          );

        }

      });

    });


    return [
      ...new Set(
        suggestionList.filter(Boolean),
      ),
    ];

  };


  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  const loadProducts = async (
    reset = false,
  ) => {

    /* =======================================================
       LOAD MORE
    ======================================================= */

    if (!reset) {

      if (
        loadingMoreRef.current ||
        !hasMoreRef.current
      ) {
        return [];
      }


      loadingMoreRef.current =
        true;

      setLoadingMore(true);

    }


    /* =======================================================
       INITIAL LOAD
    ======================================================= */

    if (reset) {

      setLoading(true);

      setError('');

      offsetRef.current = 0;

      hasMoreRef.current = true;

      setHasMore(true);

      productsRef.current = [];

      /*
       * Don't allow automatic onEndReached
       * before user starts scrolling.
       */
      canLoadMoreRef.current = false;

    }


    try {

      const requestOffset =
        reset
          ? 0
          : offsetRef.current;


      // if (__DEV__) {

      //   console.log(
      //     'SEARCH API REQUEST:',
      //     {
      //       limit:
      //         PRODUCTS_PER_PAGE,
      //       offset:
      //         requestOffset,
      //     },
      //   );

      // }


      const data =
        await fetchProductsForSearch(
          PRODUCTS_PER_PAGE,
          requestOffset,
        );


      /* =====================================================
         API ERROR
      ===================================================== */

      if (
        data?.status !== true
      ) {

        if (reset) {

          productsRef.current = [];

          setFiltered([]);

          setError(
            data?.message ||
            'Unable to load products',
          );

        }

        return [];

      }


      /* =====================================================
         PRODUCTS FROM SERVER
      ===================================================== */

      const apiProducts =
        Array.isArray(
          data?.products,
        )
          ? data.products
          : [];


      const newProducts =
        removeDuplicateProducts(
          apiProducts,
        );


      /* =====================================================
         UPDATE HAS MORE
      ===================================================== */

      const moreAvailable =
        data?.has_more === true;


      hasMoreRef.current =
        moreAvailable;

      setHasMore(
        moreAvailable,
      );


      /* =====================================================
         FIRST PAGE
      ===================================================== */

      if (reset) {

        const firstProducts =
          updateProducts(
            newProducts,
          );


        setFiltered(
          firstProducts,
        );


        /*
         * IMPORTANT:
         *
         * Don't blindly add PRODUCTS_PER_PAGE.
         *
         * Backend may return:
         *
         * 100
         * 100
         * 11
         *
         * Therefore use actual number returned.
         */

        offsetRef.current =
          requestOffset +
          apiProducts.length;


        // if (__DEV__) {

          // console.log(
          //   'FIRST PAGE:',
          //   {
          //     loaded:
          //       apiProducts.length,

          //     nextOffset:
          //       offsetRef.current,

          //     total:
          //       data?.total_products,

          //     hasMore:
          //       moreAvailable,
          //   },
          //);

        //}


        return newProducts;

      }


      /* =====================================================
         NO NEW PRODUCTS
      ===================================================== */

      if (
        apiProducts.length === 0
      ) {

        hasMoreRef.current =
          false;

        setHasMore(false);

        return [];

      }


      /* =====================================================
         APPEND PRODUCTS
      ===================================================== */

      const combinedProducts =
        updateProducts([
          ...productsRef.current,
          ...apiProducts,
        ]);


      /* =====================================================
         UPDATE DISPLAY
      ===================================================== */

      const currentSearch =
        search
          .toLowerCase()
          .trim();


      if (!currentSearch) {

        setFiltered(
          combinedProducts,
        );

      } else {

        const matchingProducts =
          combinedProducts.filter(
            item =>
              productMatchesSearch(
                item,
                currentSearch,
              ),
          );


        setFiltered(
          removeDuplicateProducts(
            matchingProducts,
          ),
        );

      }


      /* =====================================================
         NEXT OFFSET
      ===================================================== */

      offsetRef.current =
        requestOffset +
        apiProducts.length;


      /* =====================================================
         EXTRA SAFETY
      ===================================================== */

      const totalProducts =
        Number(
          data?.total_products || 0,
        );


      if (
        totalProducts > 0 &&
        offsetRef.current >=
          totalProducts
      ) {

        hasMoreRef.current =
          false;

        setHasMore(false);

      }


      // if (__DEV__) {

      //   console.log(
      //     'NEXT PAGE:',
      //     {
      //       requestedOffset:
      //         requestOffset,

      //       loaded:
      //         apiProducts.length,

      //       nextOffset:
      //         offsetRef.current,

      //       total:
      //         data?.total_products,

      //       hasMore:
      //         hasMoreRef.current,
      //     },
      //   );

      // }


      return newProducts;


    } catch (error) {

      // if (__DEV__) {

      //   console.log(
      //     'Search products ERROR:',
      //     error?.message || error,
      //   );

      // }


      if (reset) {

        productsRef.current = [];

        setFiltered([]);

        setError(
          'Unable to load products. Please try again.',
        );

      }


      return [];


    } finally {

      if (reset) {

        setLoading(false);

      } else {

        loadingMoreRef.current =
          false;

        setLoadingMore(false);

      }

    }

  };


  /* =========================================================
     SEARCH MORE PAGES FOR HINTS
  ========================================================= */

  const searchMoreForHints = async (
    searchText,
  ) => {

    if (
      searchLoadingRef.current
    ) {
      return;
    }


    searchLoadingRef.current =
      true;


    try {

      while (
        hasMoreRef.current
      ) {

        /* ===================================================
           CHECK CURRENT PRODUCTS
        =================================================== */

        const currentSuggestions =
          getSuggestions(
            productsRef.current,
            searchText,
          );


        if (
          currentSuggestions.length > 0
        ) {

          setSuggestions(
            currentSuggestions,
          );

          return;

        }


        /* ===================================================
           LOAD NEXT PAGE
        =================================================== */

        const nextProducts =
          await loadProducts(
            false,
          );


        if (
          nextProducts.length === 0
        ) {

          return;

        }


        /* ===================================================
           CHECK AGAIN
        =================================================== */

        const suggestionsAfterLoad =
          getSuggestions(
            productsRef.current,
            searchText,
          );


        if (
          suggestionsAfterLoad.length > 0
        ) {

          setSuggestions(
            suggestionsAfterLoad,
          );

          return;

        }

      }

    } finally {

      searchLoadingRef.current =
        false;

    }

  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    if (
      initialLoadRef.current
    ) {
      return;
    }


    initialLoadRef.current =
      true;


    loadProducts(true);

  }, []);


  /* =========================================================
     LOAD MORE BY SCROLL
  ========================================================= */

  const loadMoreProducts = () => {

    /*
     * Ignore onEndReached until user
     * has actually started scrolling.
     */

    if (
      !canLoadMoreRef.current
    ) {
      return;
    }


    if (
      loading ||
      loadingMoreRef.current ||
      !hasMoreRef.current ||
      searchLoadingRef.current
    ) {
      return;
    }


    loadProducts(false);

  };


  /* =========================================================
     USER STARTED SCROLLING
  ========================================================= */

  const handleMomentumScrollBegin =
    () => {

      canLoadMoreRef.current =
        true;

    };


  /* =========================================================
     SEARCH INPUT
  ========================================================= */

  const handleSearch = text => {

    setSearch(text);


    const searchText =
      text
        .toLowerCase()
        .trim();


    /* =======================================================
       EMPTY SEARCH
    ======================================================= */

    if (!searchText) {

      setSuggestions([]);

      setFiltered(
        productsRef.current,
      );

      return;

    }


    /* =======================================================
       SEARCH CURRENT PRODUCTS
    ======================================================= */

    const currentSuggestions =
      getSuggestions(
        productsRef.current,
        searchText,
      );


    if (
      currentSuggestions.length > 0
    ) {

      setSuggestions(
        currentSuggestions,
      );

      return;

    }


    /* =======================================================
       NOT FOUND IN CURRENT PAGE
       → LOAD NEXT PAGE
    ======================================================= */

    setSuggestions([]);

    searchMoreForHints(
      searchText,
    );

  };


  /* =========================================================
     CLEAR SEARCH
  ========================================================= */

  const clearSearch = () => {

    setSearch('');

    setSuggestions([]);

    setFiltered(
      productsRef.current,
    );

    Keyboard.dismiss();

    inputRef.current?.focus();

  };


  /* =========================================================
     PERFORM SEARCH
  ========================================================= */

  const performSearch = () => {

    const searchText =
      search
        .toLowerCase()
        .trim();


    if (!searchText) {

      setFiltered(
        productsRef.current,
      );

      setSuggestions([]);

      Keyboard.dismiss();

      return;

    }


    const filteredData =
      productsRef.current.filter(
        item =>
          productMatchesSearch(
            item,
            searchText,
          ),
      );


    setFiltered(
      removeDuplicateProducts(
        filteredData,
      ),
    );


    setSuggestions([]);

    Keyboard.dismiss();

  };


  /* =========================================================
     SELECT SUGGESTION
  ========================================================= */

  const selectSuggestion = text => {

    setSearch(text);


    const searchText =
      text
        .toLowerCase()
        .trim();


    const filteredData =
      productsRef.current.filter(
        item =>
          productMatchesSearch(
            item,
            searchText,
          ),
      );


    setFiltered(
      removeDuplicateProducts(
        filteredData,
      ),
    );


    setSuggestions([]);

    Keyboard.dismiss();

  };


  /* =========================================================
     FINAL PRICE
  ========================================================= */

  const finalPrice = (
    price,
    offer,
  ) => {

    const numericPrice =
      Number(price) || 0;

    const numericOffer =
      Number(offer) || 0;


    return (
      numericPrice -
      (
        numericPrice *
        numericOffer /
        100
      )
    ).toFixed(2);

  };


  /* =========================================================
     PRODUCT ITEM
  ========================================================= */

  const renderProduct = ({
    item,
  }) => {

    const hasOffer =
      Number(
        item?.product_offer,
      ) > 0;


    return (

      <TouchableOpacity
        style={
          styles.productBox
        }
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(
            'ProductDetailScreen',
            {
              productId:
                item?.id,
            },
          )
        }>


        {hasOffer &&
          !!item?.offer_name && (

            <View
              style={
                globalStyles.offerBanner
              }>

              <Text
                style={
                  globalStyles.offerText
                }>
                {item.offer_name}
              </Text>

            </View>

          )}


        <Image
          source={{
            uri:
              `${BASE_URL}${item?.image}`,
          }}
          resizeMode="contain"
          style={
            styles.productImg
          }
        />


        <Text
          style={
            styles.productName
          }
          numberOfLines={2}>
          {item?.product_name}
        </Text>


        {!!item?.description && (

          <Text
            numberOfLines={1}
            style={
              styles.productSortDesc
            }>
            {item.description}
          </Text>

        )}


        {hasOffer &&
          item?.min_price != null && (

            <Text
              style={[
                styles.price,
                {
                  textDecorationLine:
                    'line-through',
                },
              ]}>
              ₹ {item.min_price}
            </Text>

          )}


        {item?.min_price != null && (

          <Text
            style={
              styles.productFinalPrice
            }>

            ₹{' '}

            {hasOffer
              ? finalPrice(
                  item.min_price,
                  item.product_offer,
                )
              : Number(
                  item.min_price,
                ).toFixed(2)}

          </Text>

        )}

      </TouchableOpacity>

    );

  };


  /* =========================================================
     SUGGESTION ITEM
  ========================================================= */

  const renderSuggestion = ({
    item,
  }) => (

    <TouchableOpacity
      style={
        styles.suggestionItem
      }
      onPress={() =>
        selectSuggestion(item)
      }
      activeOpacity={0.7}>

      <Ionicons
        name="search"
        size={16}
        color="#777"
      />

      <Text
        style={
          styles.suggestionText
        }
        numberOfLines={1}>
        {item}
      </Text>

    </TouchableOpacity>

  );


  /* =========================================================
     FOOTER
  ========================================================= */

  const renderFooter = () => {

    if (!loadingMore) {
      return null;
    }


    return (

      <View
        style={
          styles.footerLoader
        }>

        <ActivityIndicator
          size="small"
          color={
            colors.primary ||
            '#05b8b8'
          }
        />

        <Text
          style={
            styles.loadingMoreText
          }>
          Loading more products...
        </Text>

      </View>

    );

  };


  /* =========================================================
     INITIAL LOADING
  ========================================================= */

  if (loading) {

    return (

      <SafeAreaView
        style={
          globalStyles.safeArea
        }>

        <View
          style={
            styles.loadingContainer
          }>

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
            }>
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
      }>

      <View
        style={{
          flex: 1,
        }}>


        {/* HEADER */}

        <View
          style={
            styles.header
          }>

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }>

            <Ionicons
              name="arrow-back"
              size={25}
            />

          </TouchableOpacity>


          <View
            style={
              styles.searchContainer
            }>

            <TextInput
              placeholder="Search Product..."
              placeholderTextColor={
                colors.placeholderTextColor
              }
              style={
                styles.searchInput
              }
              ref={inputRef}
              value={search}
              onChangeText={
                handleSearch
              }
              returnKeyType="search"
              onSubmitEditing={
                performSearch
              }
              submitBehavior={
                'blurAndSubmit'
              }
            />


            {/* CLOSE ICON */}

            {search.length > 0 && (

              <TouchableOpacity
                style={
                  styles.clearButton
                }
                onPress={
                  clearSearch
                }
                activeOpacity={0.7}>

                <Ionicons
                  name="close-circle"
                  size={21}
                  color="#777"
                />

              </TouchableOpacity>

            )}

          </View>

        </View>


        {/* PRODUCTS */}

        <View
          style={{
            flex: 1,
            backgroundColor:
              colors.background,
          }}>

          <FlatList
            data={filtered}
            renderItem={
              renderProduct
            }
            keyExtractor={item =>
              String(item.id)
            }
            numColumns={2}
            columnWrapperStyle={{
              justifyContent:
                'space-between',
              paddingHorizontal: 10,
            }}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 80,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }

            /*
             * Important pagination
             */

            onMomentumScrollBegin={
              handleMomentumScrollBegin
            }

            onEndReached={
              loadMoreProducts
            }

            onEndReachedThreshold={0.3}

            ListFooterComponent={
              renderFooter
            }
          />


          {/* OVERLAY */}

          {suggestions.length > 0 && (

            <View
              style={
                styles.overlay
              }
              pointerEvents="none"
            />

          )}

        </View>


        {/* SUGGESTIONS */}

        {suggestions.length > 0 && (

          <View
            style={
              styles.suggestionBox
            }>

            <FlatList
              data={
                suggestions
              }
              renderItem={
                renderSuggestion
              }

              /*
               * Suggestions are already
               * unique, so use the text itself.
               */

              keyExtractor={item =>
                String(item)
              }

              keyboardShouldPersistTaps="handled"

              showsVerticalScrollIndicator={
                false
              }

            />

          </View>

        )}


        {/* EMPTY */}

        {filtered.length === 0 &&
          !loadingMore && (

          <View
            style={
              styles.emptyContainer
            }>

            <Ionicons
              name="search-outline"
              size={50}
              color="#aaa"
            />

            <Text
              style={
                styles.emptyText
              }>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor:
      colors.headerBackground,
  },


  searchContainer: {
    flex: 1,
    marginLeft: 10,
    position: 'relative',
    justifyContent: 'center',
  },


  searchInput: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingRight: 40,
    paddingVertical: 10,
  },


  clearButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },


  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0,0,0,0.15)',
    zIndex: 5,
  },


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


  footerLoader: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingMoreText: {
    marginTop: 6,
    fontSize: 12,
    color: '#777',
  },


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
});