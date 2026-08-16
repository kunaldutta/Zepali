import React, {
  useEffect,
  useState,
  useCallback,
  memo,
  useMemo,
} from 'react';

import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {getHomeData} from '../../services/productService';
import i18n from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {globalStyles, colors} from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import {BASE_URL} from '../../network/apiClient';

import {useFocusEffect} from '@react-navigation/native';
import {usePoints} from '../../components/PointsContext';
import WalletBadge from '../../components/WalletBadge';

import DeviceInfo from 'react-native-device-info';
import {compareVersions} from '../../utils/versionUtils';

import * as Keychain from 'react-native-keychain';


const MAX_PRODUCTS_PER_SECTION = 15;
const PRODUCT_CARD_WIDTH = 150;
const PRODUCT_CARD_MARGIN = 5;
const SEE_MORE_WIDTH = 120;

const SOFT_UPDATE_DISMISSED_VERSION =
  'SOFT_UPDATE_DISMISSED_VERSION';


/* ============================================================
   IMAGE WITH LOADER
============================================================ */

const ImageWithLoader = memo(
  ({uri, style, resizeMode = 'contain'}) => {
    const imageUri = uri ? BASE_URL + uri : null;

    if (!imageUri) {
      return (
        <View
          style={[
            style,
            styles.imagePlaceholder,
          ]}>
          <Ionicons
            name="image-outline"
            size={26}
            color="#999"
          />
        </View>
      );
    }

    return (
      <View
        style={[
          style,
          styles.imageLoaderContainer,
        ]}>

        <Image
          source={{
            uri: imageUri,
            cache: 'force-cache',
          }}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
        />

      </View>
    );
  },
);


/* ============================================================
   PRODUCT CARD
============================================================ */

const ProductCard = memo(
  ({item, onPress}) => (
    <TouchableOpacity
      style={styles.productBox}
      activeOpacity={0.85}
      onPress={onPress}>

      {item?.effective_discount_percentage !== 0 &&
        !!item.offer_name && (
          <View style={styles.offerBanner}>
            <Text style={styles.offerText}>
              {item.offer_name}
            </Text>
          </View>
        )}

      <View style={styles.productImageContainer}>
        <ImageWithLoader
          uri={item.image}
          style={styles.productImg}
          resizeMode="contain"
        />
      </View>

      <Text
        style={styles.productName}
        numberOfLines={2}>
        {item?.product_name}
      </Text>

      <Text
        numberOfLines={1}
        style={styles.productSortDesc}>
        {item?.description}
      </Text>

      {item.effective_discount_percentage > 0 && (
        <Text style={styles.productPrice}>
          ₹ {item?.min_price}
        </Text>
      )}

      <Text style={styles.productFinalPrice}>
        ₹ {item?.final_price}
      </Text>

      {item?.average_rating > 0 && (
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <Text
              key={star}
              style={[
                styles.star,
                star <=
                Math.round(
                  item?.average_rating || 0,
                )
                  ? styles.selectedStar
                  : null,
              ]}>
              ★
            </Text>
          ))}
        </View>
      )}

    </TouchableOpacity>
  ),
);


/* ============================================================
   SEE MORE CARD
============================================================ */

const SeeMoreCard = memo(
  ({section, onPress}) => (
    <TouchableOpacity
      style={styles.seeMoreBox}
      activeOpacity={0.85}
      onPress={onPress}>

      <Ionicons
        name="arrow-forward-circle-outline"
        size={34}
        color="#087b92"
      />

      <Text style={styles.seeMoreText}>
        See More
      </Text>

    </TouchableOpacity>
  ),
);


/* ============================================================
   CATEGORY CARD
============================================================ */

const CategoryCard = memo(
  ({item, onPress}) => (
    <TouchableOpacity
      style={styles.categoryBox}
      activeOpacity={0.85}
      onPress={onPress}>

      {item?.max_effective_discount_percentage !==
        0 && (
        <View style={styles.offerBanner}>
          <Text style={styles.offerText}>
            Offer up to{'\n'}
            {item.max_effective_discount_percentage}%
          </Text>
        </View>
      )}

      <View
        style={
          styles.categoryImageContainer
        }>

        <ImageWithLoader
          uri={item?.image}
          style={styles.categoryImg}
          resizeMode="contain"
        />

      </View>

      <Text
        style={styles.categoryText}
        numberOfLines={3}>
        {item.category_name}
      </Text>

    </TouchableOpacity>
  ),
);


/* ============================================================
   PRODUCT SECTION
============================================================ */

const ProductSection = memo(
  ({section, navigation}) => {

    const rowData = useMemo(() => {
      const products =
        section.products || [];

      const visibleProducts =
        products.slice(
          0,
          MAX_PRODUCTS_PER_SECTION,
        );

      if (
        products.length >
        MAX_PRODUCTS_PER_SECTION
      ) {
        return [
          ...visibleProducts,
          {
            id: `see-more-${section.category_id}`,
            isSeeMore: true,
          },
        ];
      }

      return visibleProducts;
    }, [section]);


    const renderHorizontalItem =
      useCallback(
        ({item}) => {

          if (item.isSeeMore) {
            return (
              <SeeMoreCard
                section={section}
                onPress={() => {
                  navigation.navigate(
                    'CategoryProductScreen',
                    {
                      categoryId:
                        section.category_id,
                      categoryName:
                        section.category_name,
                    },
                  );
                }}
              />
            );
          }

          return (
            <ProductCard
              item={item}
              onPress={() => {
                navigation.navigate(
                  'ProductDetailScreen',
                  {
                    productId: item.id,
                    colorCode:
                      item.color_code,
                  },
                );
              }}
            />
          );
        },
        [navigation, section],
      );


    const getHorizontalItemLayout =
      useCallback(
        (_, index) => {

          const length =
            rowData[index]?.isSeeMore
              ? SEE_MORE_WIDTH +
                PRODUCT_CARD_MARGIN * 2
              : PRODUCT_CARD_WIDTH +
                PRODUCT_CARD_MARGIN * 2;

          return {
            length,
            offset:
              (PRODUCT_CARD_WIDTH +
                PRODUCT_CARD_MARGIN * 2) *
              index,
            index,
          };
        },
        [rowData],
      );


    return (
      <View style={styles.productSection}>

        <View
          style={styles.sectionHeader}>
          <Text
            style={
              styles.sectionHeaderText
            }>
            {section.category_name}
          </Text>
        </View>

        <FlatList
          data={rowData}
          horizontal
          keyExtractor={(item, index) =>
            `${item.id}-${index}`
          }
          renderItem={
            renderHorizontalItem
          }
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.productRowContent
          }
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={2}
          getItemLayout={
            getHorizontalItemLayout
          }
        />

      </View>
    );
  },
);


/* ============================================================
   HOME SCREEN
============================================================ */

export default function HomeScreen({
  navigation,
}) {

  const [
    productSections,
    setProductSections,
  ] = useState([]);

  const [
    offers,
    setOffers,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    userName,
    setUserName,
  ] = useState('');

  const [
    user,
    setUser,
  ] = useState(null);

  const {fetchUserPoints} =
    usePoints();

  const [
    showReferral,
    setShowReferral,
  ] = useState(false);


  /* ============================================================
     SOFT UPDATE
============================================================ */

  const [
    showSoftUpdate,
    setShowSoftUpdate,
  ] = useState(false);

  const [
    softUpdateData,
    setSoftUpdateData,
  ] = useState(null);

  const [
    softUpdateMsg,
    setSoftUpdateMsg,
  ] = useState(
    'A new version is available. Please update to the latest version.',
  );

  const [
    softUpdateDismissed,
    setSoftUpdateDismissed,
  ] = useState(false);


  /* ============================================================
     INITIAL LOAD
============================================================ */

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    loadUsserDetail();
  }, []);


  /* ============================================================
     CHECK HOME UPDATE REQUIRED
============================================================ */

  useFocusEffect(
    useCallback(() => {

      const checkUpdate =
        async () => {

          const needUpdate =
            await AsyncStorage.getItem(
              'HOME_UPDATE_REQUIRED',
            );

          if (needUpdate === 'YES') {

            Promise.all([
              loadUsserDetail(),
              loadHome(),
            ])
              .then(() =>
                AsyncStorage.removeItem(
                  'HOME_UPDATE_REQUIRED',
                ),
              )
              .catch(error => {
                console.log(error);
              });
          }
        };

      checkUpdate();

    }, []),
  );


  /* ============================================================
     BUILD PRODUCT SECTIONS
============================================================ */

  const buildProductSections =
    useCallback(
      (
        apiSections,
        apiCategories,
        apiProducts,
      ) => {

        if (
          Array.isArray(apiSections) &&
          apiSections.length > 0
        ) {

          return apiSections
            .filter(
              section =>
                Array.isArray(
                  section.products,
                ) &&
                section.products.length >
                  0,
            )
            .map(section => ({
              category_id:
                section.category_id,

              category_name:
                section.category_name,

              products:
                section.products,
            }));
        }

        return (
          apiCategories || []
        )
          .map(category => {

            const sectionProducts =
              (
                apiProducts || []
              ).filter(
                product =>
                  String(
                    product.category_id,
                  ) ===
                  String(category.id),
              );

            return {
              category_id:
                category.id,

              category_name:
                category.category_name,

              products:
                sectionProducts,
            };
          })
          .filter(
            section =>
              section.products.length >
              0,
          );
      },
      [],
    );


  /* ============================================================
     REFRESH
============================================================ */

  const onRefresh =
    useCallback(
      async () => {

        setRefreshing(true);

        try {

          await loadUsserDetail();
          await loadHome();

        } catch (e) {
          console.log(e);

        } finally {
          setRefreshing(false);
        }
      },
      [],
    );


  /* ============================================================
     LOAD USER
============================================================ */

  const loadUsserDetail =
    async () => {

      const userData =
        await AsyncStorage.getItem(
          'USER_DATA',
        );

      const parsedUser =
        userData
          ? JSON.parse(userData)
          : null;

      await Keychain.getGenericPassword();

      setUser(parsedUser);

      setUserName(
        parsedUser?.name || '',
      );

      if (userData) {

        const updatedUser =
          await fetchUserPoints();

        if (updatedUser) {

          setUser(updatedUser);

          setUserName(
            updatedUser?.name || '',
          );
        }
      }
    };


  /* ============================================================
     CHECK IF SOFT UPDATE WAS DISMISSED
============================================================ */

  const checkSoftUpdateDismissed =
    async latestVersion => {

      try {

        if (!latestVersion) {
          return false;
        }

        const dismissedVersion =
          await AsyncStorage.getItem(
            SOFT_UPDATE_DISMISSED_VERSION,
          );

        return (
          dismissedVersion ===
          String(latestVersion)
        );

      } catch (error) {

        console.log(
          'Soft update dismissed check error:',
          error,
        );

        return false;
      }
    };


  /* ============================================================
     LOAD HOME DATA
============================================================ */

  const loadHome =
    async () => {

      const userData =
        await AsyncStorage.getItem(
          'USER_DATA',
        );

      const cityData =
        await AsyncStorage.getItem(
          'SELECTED_CITY',
        );

      const userCity =
        cityData
          ? JSON.parse(cityData)
          : null;

      const parsedUser =
        userData
          ? JSON.parse(userData)
          : null;

      setUser(parsedUser);

      if (parsedUser) {
        setUserName(
          parsedUser?.name || '',
        );
      }

      try {

        setRefreshing(true);

        const json =
          await getHomeData(
            i18n.locale,
            parsedUser?.country_code,
            userCity?.id,
          );

        if (!json) {
          throw new Error(
            'No response from server',
          );
        }

        console.log(
          'Home Data:',
          json,
        );


        /* ======================================================
           MAINTENANCE
        ====================================================== */

        if (
          json?.status ===
          'maintenance'
        ) {

          Alert.alert(
            json?.title ||
              'Maintenance',

            json?.message ||
              'The app is currently under maintenance. Please try again later.',
          );
        }


        /* ======================================================
           API DATA
        ====================================================== */

        const apiOffers =
          json?.offers || [];

        const apiCategories =
          json?.categories || [];

        const apiProducts =
          json?.products || [];

        const sections =
          buildProductSections(
            json?.product_sections ||
              [],
            apiCategories,
            apiProducts,
          );


        setOffers(
          apiOffers,
        );

        setCategories(
          apiCategories,
        );

        setProducts(
          apiProducts,
        );

        setProductSections(
          sections,
        );


        /* ======================================================
           REFERRAL
        ====================================================== */

        setShowReferral(
          json?.referral
            ?.show_referral ?? false,
        );


        /* ======================================================
           VERSION INFORMATION
        ====================================================== */

        const platformVersion =
          Platform.OS === 'ios'
            ? json?.versions?.ios
            : json?.versions?.android;

        const currentVersion =
          DeviceInfo.getVersion();


        /* ======================================================
           SOFT UPDATE
        ====================================================== */

        const isSoftUpdate =
          json?.softupdate === true;

        const latestVersion =
          platformVersion
            ?.latest_version;

        const isDismissed =
          await checkSoftUpdateDismissed(
            latestVersion,
          );

        setSoftUpdateMsg(
          json?.softupdate_msg ||
            'A new version is available. Please update to the latest version.',
        );

        setSoftUpdateData(
          platformVersion || null,
        );

        setSoftUpdateDismissed(
          isDismissed,
        );

        setShowSoftUpdate(
          isSoftUpdate &&
            !isDismissed,
        );


        /* ======================================================
           FORCE UPDATE
        ====================================================== */

        if (
          platformVersion?.minimum_version &&
          compareVersions(
            currentVersion,
            platformVersion.minimum_version,
          ) < 0
        ) {

          setTimeout(() => {

            navigation.reset({
              index: 0,

              routes: [
                {
                  name:
                    'ForceUpdateScreen',

                  params: {
                    versionData: {

                      latestVersion:
                        platformVersion
                          ?.latest_version,

                      updateMessage:
                        platformVersion
                          ?.update_message,

                      storeUrl:
                        platformVersion
                          ?.store_url,

                      currentVersion,
                    },
                  },
                },
              ],
            });

          }, 500);
        }

      } catch (error) {

        console.log(
          'API ERROR:',
          error.message,
        );

        if (
          error.message ===
            'Network request failed' ||
          error.message?.includes(
            'Network',
          ) ||
          error.message?.includes(
            'fetch',
          )
        ) {

          if (
            error?.message?.includes(
              'Network Error',
            ) ||
            error?.message?.includes(
              'timeout',
            )
          ) {

            Alert.alert(
              'Connection error',
              'Please check your connection',
            );

          } else {

            console.log(
              'toJSON:',
              error,
            );

            Alert.alert(
              'Error',
              'Something went wrong. Please try again.',
            );
          }

        } else {

          Alert.alert(
            'Error',
            'Something went wrong',
          );
        }

      } finally {

        setRefreshing(false);
      }
    };


  /* ============================================================
     OPEN STORE
============================================================ */

  const handleSoftUpdate =
    useCallback(
      async () => {

        const storeUrl =
          softUpdateData?.store_url;

        if (!storeUrl) {

          Alert.alert(
            'Update',
            'Update link is not available right now. Please try again later.',
          );

          return;
        }

        try {

          const supported =
            await Linking.canOpenURL(
              storeUrl,
            );

          if (supported) {

            await Linking.openURL(
              storeUrl,
            );

          } else {

            Alert.alert(
              'Update',
              'Unable to open the app store.',
            );
          }

        } catch (error) {

          console.log(
            'Store URL Error:',
            error,
          );

          Alert.alert(
            'Update',
            'Unable to open the app store.',
          );
        }
      },
      [softUpdateData],
    );


  /* ============================================================
     DISMISS SOFT UPDATE
============================================================ */

  const handleDismissSoftUpdate =
    useCallback(
      async () => {

        try {

          const latestVersion =
            softUpdateData
              ?.latest_version;

          if (latestVersion) {

            await AsyncStorage.setItem(
              SOFT_UPDATE_DISMISSED_VERSION,
              String(latestVersion),
            );
          }

          setSoftUpdateDismissed(
            true,
          );

          setShowSoftUpdate(
            false,
          );

        } catch (error) {

          console.log(
            'Soft update dismiss error:',
            error,
          );

          // Hide for current session
          // even if AsyncStorage fails.

          setSoftUpdateDismissed(
            true,
          );

          setShowSoftUpdate(
            false,
          );
        }
      },
      [softUpdateData],
    );


  /* ============================================================
     APPLICATION ID
============================================================ */

  const removeApplicationIDAndNavigate =
    useCallback(
      async () => {

        try {

          await AsyncStorage.removeItem(
            'APPLICATION_ID',
          );

          navigation.navigate(
            'PrawasiCardNavigator',
          );

        } catch (e) {

          console.log(
            'Error removing item',
            e,
          );
        }
      },
      [navigation],
    );


  /* ============================================================
     CATEGORY
============================================================ */

  const renderCategory =
    useCallback(
      ({item}) => (

        <CategoryCard
          item={item}
          onPress={() => {

            if (
              item.product_keyword ===
              'recharge and bill'
            ) {

              navigation.navigate(
                'BillAndRechargeScreen',
              );

            } else if (
              item.product_keyword ===
              'prawasi card'
            ) {

              removeApplicationIDAndNavigate();

            } else if (
              item.product_keyword ===
              'travel'
            ) {

              navigation.navigate(
                'BusSearchScreen',
              );

            } else {

              navigation.navigate(
                'CategoryProductScreen',
                {
                  categoryId:
                    item.id,

                  categoryName:
                    item.category_name,
                },
              );
            }
          }}
        />

      ),
      [
        navigation,
        removeApplicationIDAndNavigate,
      ],
    );


  /* ============================================================
     PRODUCT SECTION
============================================================ */

  const renderProductSection =
    useCallback(
      ({item}) => (

        <ProductSection
          section={item}
          navigation={navigation}
        />

      ),
      [navigation],
    );


  /* ============================================================
     LIST HEADER
============================================================ */

  const ListHeader =
    useMemo(
      () => (

        <View
          style={
            styles.listHeader
          }>


          {/* ==================================================
              SOFT UPDATE BANNER
          ================================================== */}

          {showSoftUpdate &&
            !softUpdateDismissed && (
              <View
                style={
                  styles.softUpdateBanner
                }>

                {/* CLOSE BUTTON */}

                <TouchableOpacity
                  style={
                    styles.softUpdateCloseButton
                  }
                  activeOpacity={0.7}
                  onPress={
                    handleDismissSoftUpdate
                  }>

                  <Ionicons
                    name="close"
                    size={22}
                    color="#666"
                  />

                </TouchableOpacity>


                <View
                  style={
                    styles.softUpdateContent
                  }>

                  {/* ICON */}

                  <View
                    style={
                      styles.softUpdateIconContainer
                    }>

                    <Ionicons
                      name="cloud-download-outline"
                      size={25}
                      color="#087b92"
                    />

                  </View>


                  {/* TEXT */}

                  <View
                    style={
                      styles.softUpdateTextContainer
                    }>

                    <Text
                      style={
                        styles.softUpdateTitle
                      }>
                      New Update Available
                    </Text>

                    <Text
                      style={
                        styles.softUpdateMessage
                      }
                      numberOfLines={3}>
                      {softUpdateMsg}
                    </Text>

                    {!!softUpdateData?.latest_version && (
                      <Text
                        style={
                          styles.softUpdateVersion
                        }>
                        Version{' '}
                        {
                          softUpdateData.latest_version
                        }
                      </Text>
                    )}

                  </View>


                  {/* UPDATE BUTTON */}

                  <TouchableOpacity
                    style={
                      styles.softUpdateButton
                    }
                    activeOpacity={0.8}
                    onPress={
                      handleSoftUpdate
                    }>

                    <Text
                      style={
                        styles.softUpdateButtonText
                      }>
                      Update
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>
            )}


          {/* ==================================================
              REFERRAL BANNER
          ================================================== */}

          {showReferral && (
            <TouchableOpacity
              style={
                styles.referralButton
              }
              onPress={() =>
                navigation.navigate(
                  'AddReferralCodeScreen',
                )
              }>

              <Ionicons
                name="gift-outline"
                size={22}
                color="#fff"
              />

              <Text
                style={
                  styles.referralButtonText
                }>
                Have a Referral Code? Enter Here
              </Text>

            </TouchableOpacity>
          )}


          {/* ==================================================
              CATEGORIES
          ================================================== */}

          <FlatList
            data={categories}
            renderItem={
              renderCategory
            }
            keyExtractor={(
              item,
              index,
            ) =>
              `${item.id}-${index}`
            }
            numColumns={3}
            columnWrapperStyle={
              styles.categoryColumnWrapper
            }
            scrollEnabled={false}
          />

        </View>

      ),

      [
        categories,
        renderCategory,
        showReferral,
        showSoftUpdate,
        softUpdateDismissed,
        softUpdateData,
        softUpdateMsg,
        handleSoftUpdate,
        handleDismissSoftUpdate,
      ],
    );


  /* ============================================================
     UI
============================================================ */

  return (

    <SafeAreaView
      edges={[
        'top',
        'left',
        'right',
      ]}
      style={styles.safeArea}>


      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppHeader
        title={`  Hello, ${userName}!`}
        showBack={false}
        leftComponent={

          <View
            style={
              styles.headerImageContainer
            }>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Setting',
                )
              }>

              <Image
                source={
                  user?.user_image
                    ? {
                        uri:
                          BASE_URL +
                          user.user_image,
                      }
                    : require('../../../src/Assets/LoginLogo/user.jpg')
                }
                style={styles.image}
              />

            </TouchableOpacity>

          </View>
        }
      />


      {/* ======================================================
          SEARCH + WALLET
      ====================================================== */}

      <View
        style={styles.topBar}>

        <View
          style={[
            styles.searchContainer,
            {width: '68%'},
          ]}>

          <Ionicons
            name="search"
            size={22}
            color="#777"
            style={
              styles.searchIcon
            }
          />

          <TouchableOpacity
            style={{flex: 1}}
            onPress={() =>
              navigation.navigate(
                'SearchScreen',
                {products},
              )
            }>

            <Text
              style={
                styles.searchText
              }>
              Search Product...
            </Text>

          </TouchableOpacity>

        </View>


        <View
          style={
            styles.walletContainer
          }>

          <WalletBadge
            style={{
              width: '100%',
              height: '100%',
            }}
            onPress={() =>
              navigation.navigate(
                'WalletDetails',
              )
            }
          />

        </View>

      </View>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <View
        style={[
          globalStyles.container,
          styles.mainContainer,
        ]}>

        {refreshing &&
        productSections.length === 0 ? (

          <ActivityIndicator
            size="large"
            color="#000"
            style={styles.loader}
          />

        ) : (

          <FlatList
            data={productSections}
            renderItem={
              renderProductSection
            }
            keyExtractor={(
              item,
              index,
            ) =>
              `${item.category_id}-${index}`
            }
            ListHeaderComponent={
              ListHeader
            }
            contentContainerStyle={
              styles.sectionListContent
            }
            showsVerticalScrollIndicator={
              false
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={false}
          />

        )}

      </View>

    </SafeAreaView>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor:
      colors.safeAreaColor,
    borderColor: '#2b0303',
  },


  /* ==========================================================
     HEADER
  ========================================================== */

  headerImageContainer: {
    top: 0,
    height: 40,
    width: 40,
    backgroundColor: '#bd9f9ffe',
    borderRadius: 20,
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
  },


  /* ==========================================================
     TOP BAR
  ========================================================== */

  topBar: {
    flexDirection: 'row',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    margin: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
  },

  searchIcon: {
    marginRight: 5,
  },

  searchText: {
    padding: 10,
    color: '#777',
  },

  walletContainer: {
    width: '25%',
    height: 47,
    flexDirection: 'row',
    top: 9,
  },


  /* ==========================================================
     MAIN
  ========================================================== */

  mainContainer: {
    flex: 1,
    top: 10,
  },

  loader: {
    marginTop: 20,
  },

  sectionListContent: {
    paddingBottom: '12%',
  },

  listHeader: {
    top: 0,
  },


  /* ==========================================================
     SOFT UPDATE BANNER
  ========================================================== */

  softUpdateBanner: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#eaf7fa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#b7e3ea',
    overflow: 'hidden',
  },

  softUpdateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    paddingRight: 40,
  },

  softUpdateCloseButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  softUpdateIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  softUpdateTextContainer: {
    flex: 1,
    paddingRight: 5,
  },

  softUpdateTitle: {
    color: '#087b92',
    fontSize: 15,
    fontWeight: '700',
  },

  softUpdateMessage: {
    color: '#555',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },

  softUpdateVersion: {
    color: '#087b92',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 3,
  },

  softUpdateButton: {
    backgroundColor: '#087b92',
    paddingHorizontal: 12,
    paddingVertical:9,
    borderRadius: 8,
    left: 25,
    top: 15,
  },

  softUpdateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },


  /* ==========================================================
     REFERRAL
  ========================================================== */

  referralButton: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#087b92',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  referralButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },


  /* ==========================================================
     CATEGORY
  ========================================================== */

  categoryColumnWrapper: {
    paddingHorizontal: 8,
  },

  categoryBox: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  categoryImageContainer: {
    width: 100,
    height: 130,
    top: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },

  categoryImg: {
    width: '100%',
    height: '100%',
  },

  categoryText: {
    fontSize: 14,
    marginTop: 5,
    width: 75,
    alignContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#087b92',
  },


  /* ==========================================================
     PRODUCT
  ========================================================== */

  productSection: {
    minHeight: 285,
  },

  sectionHeader: {
    backgroundColor: '#dcd8ce',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
    borderRadius: 8,
  },

  sectionHeaderText: {
    color:
      colors.headerTitleLightColor,
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  productRowContent: {
    paddingHorizontal: 5,
  },

  productBox: {
    margin: PRODUCT_CARD_MARGIN,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    width: PRODUCT_CARD_WIDTH,
    minHeight: 230,
    backgroundColor:
      colors.productColumnBackground,
  },

  productImageContainer: {
    width: '100%',
    height: 170,
    alignSelf: 'center',
    marginTop: 10,
  },

  productImg: {
    width: '100%',
    height: '100%',
  },

  productName: {
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
  },

  productSortDesc: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
    color:
      colors.descriptioncolor,
  },

  productPrice: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#c17422',
    textDecorationLine:
      'line-through',
  },

  productFinalPrice: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: 'bold',
    color: colors.price,
  },


  /* ==========================================================
     SEE MORE
  ========================================================== */

  seeMoreBox: {
    width: SEE_MORE_WIDTH,
    minHeight: 230,
    margin: PRODUCT_CARD_MARGIN,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor:
      colors.productColumnBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  seeMoreText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#087b92',
  },


  /* ==========================================================
     OFFER
  ========================================================== */

  offerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 30,
    backgroundColor:
      'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 1,
    paddingHorizontal: 4,
  },

  offerText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },


  /* ==========================================================
     IMAGE
  ========================================================== */

  imageLoaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ffff',
    top: 15,
  },

  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f5f5',
  },


  /* ==========================================================
     RATING
  ========================================================== */

  starContainer: {
    flexDirection: 'row',
    justifyContent: 'left',
    top: 5,
  },

  star: {
    fontSize: 20,
    color: '#D3D3D3',
    marginHorizontal: 2,
  },

  selectedStar: {
    color: '#bca108',
  },
});