import React, {useEffect, useState, useCallback, memo, useMemo} from 'react';
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

const MAX_PRODUCTS_PER_SECTION = 15;
const PRODUCT_CARD_WIDTH = 150;
const PRODUCT_CARD_MARGIN = 5;
const SEE_MORE_WIDTH = 120;

const ImageWithLoader = memo(({uri, style, resizeMode}) => {
  const [loading, setLoading] = useState(true);
  const imageUri = uri ? BASE_URL + uri : null;

  if (!imageUri) {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <Ionicons name="image-outline" size={28} color="#999" />
      </View>
    );
  }

  return (
    <View style={styles.imageLoaderContainer}>
      {loading && (
        <ActivityIndicator
          size="small"
          color="#000"
          style={styles.imageLoader}
        />
      )}

      <Image
        source={{uri: imageUri}}
        style={style}
        resizeMode={resizeMode}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
});

const ProductCard = memo(({item, onPress}) => (
  <TouchableOpacity style={styles.productBox} activeOpacity={0.85} onPress={onPress}>
    {item?.effective_discount_percentage !== 0 && !!item.offer_name && (
      <View style={styles.offerBanner}>
        <Text style={styles.offerText}>{item.offer_name}</Text>
      </View>
    )}

    <ImageWithLoader
      uri={item?.image}
      style={styles.productImg}
      resizeMode="contain"
    />

    <Text style={styles.productName} numberOfLines={2}>
      {item?.product_name}
    </Text>

    <Text numberOfLines={1} style={styles.productSortDesc}>
      {item?.description}
    </Text>

    {item.effective_discount_percentage > 0 && (
      <Text style={styles.productPrice}>₹ {item?.min_price}</Text>
    )}

    <Text style={styles.productFinalPrice}>₹ {item?.final_price}</Text>
  </TouchableOpacity>
));

const SeeMoreCard = memo(({section, onPress}) => (
  <TouchableOpacity style={styles.seeMoreBox} activeOpacity={0.85} onPress={onPress}>
    <Ionicons name="arrow-forward-circle-outline" size={34} color="#087b92" />
    <Text style={styles.seeMoreText}>See More</Text>
  </TouchableOpacity>
));

const CategoryCard = memo(({item, onPress}) => (
  <TouchableOpacity style={styles.categoryBox} activeOpacity={0.85} onPress={onPress}>
    {item?.max_effective_discount_percentage !== 0 && (
      <View style={styles.offerBanner}>
        <Text style={styles.offerText}>
          Offer up to{'\n'}
          {item.max_effective_discount_percentage}%
        </Text>
      </View>
    )}

    <View style={styles.categoryImageContainer}>
      <ImageWithLoader
        uri={item?.image}
        style={[styles.categoryImg, {top: 10}]}
        resizeMode="center"
      />
    </View>

    <Text style={[styles.categoryText, {top: 8}]} numberOfLines={2}>
      {item.category_name}
    </Text>
  </TouchableOpacity>
));

const ProductSection = memo(({section, navigation}) => {
  const rowData = useMemo(() => {
    const products = section.products || [];
    const visibleProducts = products.slice(0, MAX_PRODUCTS_PER_SECTION);

    if (products.length > MAX_PRODUCTS_PER_SECTION) {
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

  const renderHorizontalItem = useCallback(
    ({item}) => {
      if (item.isSeeMore) {
        return (
          <SeeMoreCard
            section={section}
            onPress={() =>
              navigation.navigate('CategoryProductScreen', {
                categoryId: section.category_id,
                categoryName: section.category_name,
              })
            }
          />
        );
      }

      return (
        <ProductCard
          item={item}
          onPress={() =>
            navigation.navigate('ProductDetailScreen', {
              productId: item.id,
              colorCode: item.color_code,
            })
          }
        />
      );
    },
    [navigation, section],
  );

  const getHorizontalItemLayout = useCallback((_, index) => {
    const length =
      rowData[index]?.isSeeMore
        ? SEE_MORE_WIDTH + PRODUCT_CARD_MARGIN * 2
        : PRODUCT_CARD_WIDTH + PRODUCT_CARD_MARGIN * 2;

    return {
      length,
      offset: (PRODUCT_CARD_WIDTH + PRODUCT_CARD_MARGIN * 2) * index,
      index,
    };
  }, [rowData]);

  return (
    <View style={styles.productSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.category_name}</Text>
      </View>

      <FlatList
        data={rowData}
        horizontal
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderHorizontalItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productRowContent}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        getItemLayout={getHorizontalItemLayout}
      />
    </View>
  );
});

export default function HomeScreen({navigation}) {
  const [productSections, setProductSections] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [user, setUser] = useState(null);
  const {fetchUserPoints} = usePoints();

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    loadUsserDetail();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkUpdate = async () => {
        const needUpdate = await AsyncStorage.getItem('HOME_UPDATE_REQUIRED');

        if (needUpdate === 'YES') {
          Promise.all([loadUsserDetail(), loadHome()])
            .then(() => AsyncStorage.removeItem('HOME_UPDATE_REQUIRED'))
            .catch(error => {
              console.log(error);
            });
        }
      };

      checkUpdate();
    }, []),
  );

  const buildProductSections = useCallback((apiSections, apiCategories, apiProducts) => {
    if (Array.isArray(apiSections) && apiSections.length > 0) {
      return apiSections
        .filter(section => Array.isArray(section.products) && section.products.length > 0)
        .map(section => ({
          category_id: section.category_id,
          category_name: section.category_name,
          products: section.products,
        }));
    }

    return (apiCategories || [])
      .map(category => {
        const sectionProducts = (apiProducts || []).filter(
          product => String(product.category_id) === String(category.id),
        );

        return {
          category_id: category.id,
          category_name: category.category_name,
          products: sectionProducts,
        };
      })
      .filter(section => section.products.length > 0);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadUsserDetail();
      await loadHome();
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadUsserDetail = async () => {
    const userData = await AsyncStorage.getItem('USER_DATA');
    const parsedUser = userData ? JSON.parse(userData) : null;

    setUser(parsedUser);
    setUserName(parsedUser?.name || '');

    if (userData) {
      const updatedUser = await fetchUserPoints(parsedUser?.id);
      if (updatedUser) {
        setUser(updatedUser);
        setUserName(updatedUser?.name || '');
      }
    }
  };

  const loadHome = async () => {
    const userData = await AsyncStorage.getItem('USER_DATA');
    const parsedUser = userData ? JSON.parse(userData) : null;

    setUser(parsedUser);
    if (parsedUser) {
      setUserName(parsedUser?.name || '');
    }

    try {
      setRefreshing(true);

      const json = await getHomeData(i18n.locale, parsedUser?.country_code);

      if (!json) {
        throw new Error('No response from server');
      }

      const apiOffers = json?.offers || [];
      const apiCategories = json?.categories || [];
      const apiProducts = json?.products || [];
      const sections = buildProductSections(
        json?.product_sections || [],
        apiCategories,
        apiProducts,
      );

      setOffers(apiOffers);
      setCategories(apiCategories);
      setProducts(apiProducts);
      setProductSections(sections);

      const platformVersion =
        Platform.OS === 'ios' ? json?.versions?.ios : json?.versions?.android;
      const currentVersion = DeviceInfo.getVersion();

      if (
        platformVersion?.minimum_version &&
        compareVersions(currentVersion, platformVersion.minimum_version) < 0
      ) {
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'ForceUpdateScreen',
                params: {
                  versionData: {
                    latestVersion: platformVersion?.latest_version,
                    updateMessage: platformVersion?.update_message,
                    storeUrl: platformVersion?.store_url,
                    currentVersion,
                  },
                },
              },
            ],
          });
        }, 500);
      }
    } catch (error) {
      console.log('API ERROR:', error);

      if (
        error.message === 'Network request failed' ||
        error.message?.includes('Network') ||
        error.message?.includes('fetch')
      ) {
        if (error.message === 'Network Error') {
          Alert.alert('Error', 'Something went wrong. Please try again.');
        } else {
          Alert.alert('No Internet', 'Please check your connection');
        }
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const removeApplicationIDAndNavigate = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('APPLICATION_ID');
      navigation.navigate('PrawasiCardNavigator');
    } catch (e) {
      console.log('Error removing item', e);
    }
  }, [navigation]);

  const renderCategory = useCallback(
    ({item}) => (
      <CategoryCard
        item={item}
        onPress={() => {
          if (item.product_keyword === 'recharge and bill') {
            navigation.navigate('BillAndRechargeScreen');
          } else if (item.product_keyword === 'prawasi card') {
            removeApplicationIDAndNavigate();
          } else if (item.product_keyword === 'travel') {
            navigation.navigate('BusSearchScreen');
          } else {
            navigation.navigate('CategoryProductScreen', {
              categoryId: item.id,
              categoryName: item.category_name,
            });
          }
        }}
      />
    ),
    [navigation, removeApplicationIDAndNavigate],
  );

  const renderProductSection = useCallback(
    ({item}) => <ProductSection section={item} navigation={navigation} />,
    [navigation],
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {categories?.length > 0 && (
          <Text style={globalStyles.title}>{i18n.t('CATEGORIES')}</Text>
        )}

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={3}
          columnWrapperStyle={styles.categoryColumnWrapper}
          scrollEnabled={false}
          removeClippedSubviews
        />
      </View>
    ),
    [categories, renderCategory],
  );

  const getSectionLayout = useCallback((_, index) => ({
    length: 285,
    offset: 285 * index,
    index,
  }), []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <AppHeader
        title={`  Hello, ${userName}!`}
        showBack={false}
        leftComponent={
          <View style={styles.headerImageContainer}>
            <Image
              source={
                user?.user_image
                  ? {uri: BASE_URL + user?.user_image}
                  : require('../../../src/Assets/LoginLogo/user.jpg')
              }
              style={styles.image}
            />
          </View>
        }
      />

      <View style={styles.topBar}>
        <View style={[styles.searchContainer, {width: '68%'}]}>
          <Ionicons
            name="search"
            size={22}
            color="#777"
            style={styles.searchIcon}
          />

          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => navigation.navigate('SearchScreen', {products})}>
            <Text style={styles.searchText}>Search product...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.walletContainer}>
          <WalletBadge
            style={{width: '100%', height: '100%'}}
            onPress={() => navigation.navigate('WalletDetails')}
          />
        </View>
      </View>

      <View style={[globalStyles.container, styles.mainContainer]}>
        {refreshing && productSections.length === 0 ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : (
          <FlatList
            data={productSections}
            renderItem={renderProductSection}
            keyExtractor={(item, index) => `${item.category_id}-${index}`}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.sectionListContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            updateCellsBatchingPeriod={80}
            removeClippedSubviews
            getItemLayout={getSectionLayout}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.safeAreaColor,
    borderColor: '#2b0303',
  },
  headerImageContainer: {
    top: 0,
    height: 40,
    width: 40,
    backgroundColor: '#bd9f9ffe',
    borderRadius: 20,
  },
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
  mainContainer: {
    top: 10,
    height: '70%',
  },
  loader: {
    marginTop: 20,
  },
  sectionListContent: {
    paddingBottom: 20,
  },
  categoryColumnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  categoryBox: {
    alignItems: 'center',
    margin: 5,
    backgroundColor: colors.productColumnBackground,
    borderRadius: 10,
    padding: 10,
    width: '30%',
  },
  categoryImageContainer: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    top: 10,
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
  productSection: {
    minHeight: 285,
  },
  sectionHeader: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
    borderRadius: 8,
  },
  sectionHeaderText: {
    color: '#fff',
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
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    width: PRODUCT_CARD_WIDTH,
    minHeight: 230,
    backgroundColor: colors.productColumnBackground,
  },
  productImg: {
    width: '100%',
    height: 100,
    top: 15,
    borderRadius: 10,
  },
  productName: {
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
    minHeight: 38,
  },
  productSortDesc: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
    color: colors.descriptioncolor,
  },
  productPrice: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: 'bold',
    color: '#c17422',
    textDecorationLine: 'line-through',
  },
  productFinalPrice: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: 'bold',
    color: colors.price,
  },
  seeMoreBox: {
    width: SEE_MORE_WIDTH,
    minHeight: 230,
    margin: PRODUCT_CARD_MARGIN,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: colors.productColumnBackground,
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
  offerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  imageLoaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    position: 'absolute',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
});