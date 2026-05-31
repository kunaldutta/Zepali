// ===============================
// MyApplicationsScreen.js
// ===============================

import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import {globalStyles} from '../../styles/globalStyles';

import {
  getMyApplications,
} from '../../services/prawasiServices';

import {
  BASE_URL,
} from '../../network/apiClient';

const MyApplicationsScreen = ({
  navigation,
}) => {


  const [loading, setLoading] =
    useState(true);

  const [applications,
    setApplications] =
    useState([]);

  useEffect(() => {

    loadApplications();

  }, []);

  const loadApplications =
    async () => {

      try {

        const user =
          await AsyncStorage.getItem(
            'USER_DATA',
          );

        const parsedUser =
          JSON.parse(user);

        const response =
          await getMyApplications(
            parsedUser.id,
          );

        console.log(
          'APPLICATIONS => ',
          response,
        );

        if (response.status) {

          setApplications(
            response.data,
          );
        }

      } catch (error) {

        console.log(
          'LOAD APPLICATION ERROR => ',
          error,
        );

      } finally {

        setLoading(false);
      }
    };

    const openApplication =
    async item => {

        try {

        await AsyncStorage.setItem(
            'APPLICATION_ID',
            item.id.toString(),
        );

        navigation.navigate(
            'PrawasiCardNavigator',
        );

        } catch (error) {

        console.log(
            'OPEN APPLICATION ERROR => ',
            error,
        );
        }
    };

  const renderItem = ({
    item,
  }) => {

    return (

      <TouchableOpacity
  style={styles.card}
  activeOpacity={0.8}
  onPress={() =>
    openApplication(item)
  }>

  {/* PROFILE IMAGE */}

  <Image
    source={{
      uri:
        item.profile_photo
          ? `${BASE_URL}${item.profile_photo}`
          : 'https://via.placeholder.com/150',
    }}
    style={styles.image}
  />

  <View style={styles.infoContainer}>

    <Text style={styles.name}>
      {item.full_name}
    </Text>

    <Text style={styles.label}>
      Application No:
    </Text>

    <Text style={styles.value}>
      {item.application_no}
    </Text>

    <Text style={styles.label}>
      Mobile:
    </Text>

    <Text style={styles.value}>
      {item.mobile}
    </Text>

    <Text style={styles.label}>
      Profession:
    </Text>

    <Text style={styles.value}>
      {item.profession}
    </Text>

    <Text style={styles.label}>
      Status:
    </Text>

    <Text
      style={[
        styles.status,
        {
          color:
            item.status ===
            'PENDING'
              ? '#F59E0B'
              : item.status ===
                'APPROVED'
              ? '#16A34A'
              : '#DC2626',
        },
      ]}>

      {item.status}

    </Text>

    <Text style={styles.label}>
      Payment:
    </Text>

    <Text
      style={[
        styles.status,
        {
          color:
            item.payment_status ===
            'PAID'
              ? '#16A34A'
              : '#DC2626',
        },
      ]}>

      {item.payment_status}

    </Text>

  </View>

</TouchableOpacity>
    );
  };

  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color="#16A34A"
        />

      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader title="My Applications" showCart={false} onBackPress={() => navigation.goBack()} />
    <View style={styles.container}>

      <FlatList
        data={applications}
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 16,
        }}
        ListEmptyComponent={() => (

          <View style={styles.emptyBox}>

            <Text style={styles.emptyText}>
              No Applications Found
            </Text>

          </View>
        )}
      />

    </View>
    </SafeAreaView>
  );
};

export default MyApplicationsScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 3,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111',
  },

  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  status: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  emptyBox: {
    marginTop: 100,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});