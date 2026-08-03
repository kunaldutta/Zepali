import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import {
  useRoute,
} from '@react-navigation/native';

import {
  getOrderItemHistoryAPI,
} from '../../services/orderService';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { colors, globalStyles } from '../../styles/globalStyles';

const OrderItemHistoryScreen = ({navigation}) => {

  const route = useRoute();

  const {orderItemId} = route.params;

  const [loading, setLoading] =
    useState(true);

  const [item, setItem] =
    useState(null);

  useEffect(() => {

    fetchHistory();

  }, []);

  const fetchHistory = async () => {

    try {

      setLoading(true);

      const res =
        await getOrderItemHistoryAPI({

          order_item_id:
            orderItemId,

        });

      if (res?.status) {

        setItem(res.item);

      }

    } catch (e) {

      console.log(e);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (
      <ActivityIndicator
        size="large"
        style={{
          flex: 1,
        }}
      />
    );

  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
            {/* =========================
                HEADER
            ========================= */}
            <AppHeader title="Product Detail" onBackPress={() => navigation.goBack()} />
    <View style={styles.container}>

      <Text style={styles.title}>

        {item?.product_name}

      </Text>

      <Text>

        Current Status :
        {' '}
        {item?.current_status}

      </Text>

      <Text style={styles.historyTitle}>
</Text>


  {item?.history.length > 0 && (<FlatList
    data={item?.history || []}
    keyExtractor={(historyItem) => historyItem.id.toString()}
    renderItem={({item: historyItem, index}) => (

    <View style={styles.timelineContainer}>

        <View style={styles.leftContainer}>

            <View style={styles.circle} />

                {index !== item.history.length - 1 && (

                    <View style={styles.line} />

                )}

            </View>
    
        <View style={styles.rightContainer}>

            <Text style={styles.status}>
                {historyItem.status.replaceAll('_', ' ')}
            </Text>

            {/* <Text style={styles.remarks}>
                {historyItem.remarks}
            </Text> */}

            {/* <Text style={styles.admin}>
                By : {historyItem.admin_name}
            </Text> */}

            <Text style={styles.date}>
                {historyItem.created_at}
            </Text>

        </View>

</View>

    )}
    />)}

    </View>
    </SafeAreaView>

  );

};

export default OrderItemHistoryScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backText: {
    fontSize: 22,
    color: "#041f3c",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  safeArea: {
  flex: 1,
  backgroundColor: '#fff',
},

header: {
  height: 60,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

backButton: {
  width: 40,
  height: 40,
  justifyContent: 'center',
},
timelineContainer: {
    flexDirection: 'row',
    marginBottom: 25,
},

leftContainer: {
    width: 35,
    alignItems: 'center',
},

circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E88E5',
},

line: {
    width: 2,
    flex: 1,
    backgroundColor: '#CFCFCF',
    marginTop: 4,
},

rightContainer: {
    flex: 1,
    paddingBottom: 10,
},

status: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
},

remarks: {
    marginTop: 5,
    fontSize: 14,
    color: '#555',
},

admin: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
},

date: {
    marginTop: 3,
    fontSize: 12,
    color: '#888',
},

});