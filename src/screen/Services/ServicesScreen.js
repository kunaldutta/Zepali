import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { getServices } from '../../services/serviceApi';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import { globalStyles, colors } from '../../styles/globalStyles';
import AppHeader from "../../components/AppHeader";
import i18n from '../../localization/i18n';

const ServicesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);

      const response = await getServices();

      if (response?.status) {
        setServices(response.services || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.log('GET_SERVICES ERROR:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const onCallPress = number => {
    if (number) {
      Linking.openURL(`tel:${number}`);
    }
  };

  const onEmailPress = email => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {item.service_name}
        </Text>

        {!!item.service_email && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEmailPress(item.service_email)}>
            <Text style={styles.email}>
              {item.service_email}
            </Text>
          </TouchableOpacity>
        )}

        {!!item.contact_number && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onCallPress(item.contact_number)}>
            <Text style={styles.phone}>
              {item.contact_number}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No services available.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.safeArea,]}>
      <AppHeader title={i18n.t('CONTACT_US')} onBackPress={() => navigation.goBack()} />
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          flexGrow: services.length === 0 ? 1 : 0,
        }}
      />
    </SafeAreaView>
  );
};

export default ServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,

    elevation: 2,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 10,
  },

  email: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },

  phone: {
    fontSize: 15,
    fontWeight: '600',
    color: '#28A745',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: '#888888',
  },
});