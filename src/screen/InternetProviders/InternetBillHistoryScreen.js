import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';
import {colors, globalStyles} from '../../styles/globalStyles';

import {getInternetBillHistory} from '../../services/internetBillPaymentService';

const InternetBillHistoryScreen = ({navigation}) => {

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      setLoading(true);

      const response = await getInternetBillHistory();

      console.log(response);

      if (response.status) {
        setHistory(response.data || []);
      }

    } catch (e) {

      console.log(e);

    } finally {

      setLoading(false);

    }

  };

  const getStatusColor = status => {

    switch (status) {

      case 'SUCCESS':
        return '#2E7D32';

      case 'FAILED':
        return '#D32F2F';

      default:
        return '#F57C00';

    }

  };

  const renderItem = ({item}) => (

    <View style={styles.card}>

      <View style={styles.headerRow}>

        <Text style={styles.provider}>
          {item.provider_name}
        </Text>

        <Text
          style={[
            styles.status,
            {color: getStatusColor(item.status)},
          ]}>
          {item.status}
        </Text>

      </View>

      <Row
        title="Customer"
        value={item.customer_name}
      />

      <Row
        title="Username"
        value={item.username}
      />

      <Row
        title="Package"
        value={item.package_name}
      />

      <Row
        title="Amount"
        value={`Rs. ${item.amount}`}
      />

      <Row
        title="Date"
        value={item.created_at}
      />

      <Row
        title="Transaction"
        value={item.transaction_id}
      />

    </View>

  );

  return (

    <SafeAreaView style={globalStyles.safeArea}>

      <AppHeader
        title="Internet Bill History"
        navigation={navigation}
        showCart={false}
      />

      <View style={globalStyles.container}>

        {loading ? (

          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{marginTop:40}}
          />

        ) : (

          <FlatList
            data={history}
            keyExtractor={item => item.transaction_id}
            renderItem={renderItem}
            contentContainerStyle={{
              padding:15,
              paddingBottom:40,
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text>No Internet Bill History Found</Text>
              </View>
            }
          />

        )}

      </View>

    </SafeAreaView>

  );

};

const Row = ({title, value}) => (

  <View style={styles.row}>

    <Text style={styles.rowTitle}>
      {title}
    </Text>

    <Text style={styles.rowValue}>
      {value}
    </Text>

  </View>

);

const styles = StyleSheet.create({

  card: {

    backgroundColor:'#FFF',

    borderRadius:10,

    padding:15,

    marginBottom:15,

    elevation:2,

  },

  headerRow:{

    flexDirection:'row',

    justifyContent:'space-between',

    marginBottom:12,

  },

  provider:{

    fontSize:18,

    fontWeight:'700',

    color:'#222',

  },

  status:{

    fontWeight:'700',

    fontSize:15,

  },

  row:{

    marginBottom:10,

  },

  rowTitle:{

    color:'#888',

    fontSize:13,

  },

  rowValue:{

    color:'#222',

    fontWeight:'600',

    marginTop:2,

  },

  empty:{

    marginTop:100,

    alignItems:'center',

  },

});

export default InternetBillHistoryScreen;