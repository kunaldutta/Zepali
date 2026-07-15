import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import {colors, globalStyles} from '../../styles/globalStyles';
import {getInternetServiceProvidersAPI} from '../../services/internetBillPaymentService';
import i18n from '../../localization/i18n';

const InternetProvidersScreen = ({navigation}) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProviders();
  }, []);

  const getProviders = async () => {
    try {
        setLoading(true);

        const response = await getInternetServiceProvidersAPI();

        console.log('INTERNET PROVIDERS:', response);

        if (response?.status) {
        setProviders(response.data || []);
        } else {
        setProviders([]);
        }
    } catch (error) {
        console.log('GET PROVIDERS ERROR:', error);
        setProviders([]);
    } finally {
        setLoading(false);
    }
 };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => {
    console.log('Selected Provider:', item);

        if (item.provider_name === 'WorldLink') {
            navigation.navigate('WorldLinkScreen');
        }
        if (item.provider_name === 'Vianet') {
            navigation.navigate('VianetScreen');
        }
        if (item.provider_name === 'ADSL') {
            navigation.navigate('ADSLScreen');
        }
        if (item.provider_name === 'NTFTTH') {
            navigation.navigate('NTFTTHScreen');
        }
    }}
        >
        {item.image ? (
          <Image
            source={{uri: item.image}}
            style={styles.logo}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {item.provider_name.charAt(0)}
            </Text>
          </View>
        )}

        <View style={{flex: 1}}>
          <Text style={styles.title}>
            {item.provider_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
        <AppHeader
          title={i18n.t("INTERNET_PROVIDERS") || "Internet Providers"}
          onBackPress={() => navigation.goBack()}
          showCart={false}
        />
    <View style={globalStyles.container}>
      

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
                paddingHorizontal: 15,
                paddingTop: 15,
                paddingBottom: 40, // <-- Add this
            }}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>
                No Internet Service Providers / Coming Soon
              </Text>
            </View>
          }
        />
      )}
    </View>
    </SafeAreaView>
  );
};

export default InternetProvidersScreen;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  logo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
    marginRight: 15,
  },

  placeholder: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  placeholderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },

  emptyView: {
    marginTop: 100,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});