import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from "../../components/AppHeader";
import { globalStyles } from '../../styles/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../localization/i18n';

import { getUserPointsDetailAPI } from '../../services/userCreditPointsServices';

const WalletDetails = ({navigation}) => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);

      
      
      const userData = await AsyncStorage.getItem('USER_DATA');
    const parsedUser = userData ? JSON.parse(userData) : null;


      const res = await getUserPointsDetailAPI({
        user_id: parsedUser?.id,
      });

      if (res?.status) {
        setData(res.history || []);
        setSummary(res.summary || {});
      }

    } catch (e) {
      console.log("Wallet Error:", e);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' +
  date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

  // ================= SUMMARY CARD =================
  const SummaryCard = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryItem}>
        <Text style={styles.value}>{summary.total_points || 0}</Text>
        <Text style={styles.label}>Total</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryItem}>
        <Text style={[styles.value, {color: '#facc15'}]}>
          {summary.expiring_soon || 0}
        </Text>
        <Text style={styles.label}>Expiring Soon</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryItem}>
        <Text style={[styles.value, {color: 'red'}]}>
          {summary.expired_points || 0}
        </Text>
        <Text style={styles.label}>Expired</Text>
      </View>
    </View>
  );

  // ================= LIST ITEM =================
  const renderItem = ({item}) => {
    const isExpired = item.status === 'expired';

    return (
      <View style={styles.card}>
        <View style={{flex: 1}}>
          <Text style={styles.type}>
            {item.point_type?.toUpperCase()}
          </Text>

          <Text style={styles.date}>
            {formatDate(item.created_at)}
          </Text>

          {item.expires_at && (
            <Text style={[styles.expiry, isExpired && {color: 'red'}]}>
              {isExpired
                ? 'Expired'
                : `Expires: ${formatDate(item.expires_at)}`}
            </Text>
          )}
        </View>

        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.points}>
            {item.remaining_points_display}
          </Text>
          <Text style={[styles.points,{fontSize:12}]}>
            ₹ {item.remaining_value}
          </Text>
          <Text style={[
            styles.status,
            {color: isExpired ? 'red' : '#22c55e'}
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[globalStyles.safeArea, { flex: 1 }]}>

      <AppHeader
        title={i18n.t("WALLET_DETAILS") || "Wallet"}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={<SummaryCard />}
          contentContainerStyle={{padding: 10}}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 40}}>
              No data found
            </Text>
          }
        />
      )}

    </SafeAreaView>
  );
};

export default WalletDetails;

const styles = StyleSheet.create({

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },

  label: {
    fontSize: 12,
    color: '#94a3b8',
  },

  divider: {
    width: 1,
    backgroundColor: '#334155',
  },

  card: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },

  type: {
    color: '#fff',
    fontWeight: 'bold',
  },

  date: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },

  expiry: {
    fontSize: 12,
    marginTop: 4,
    color: '#facc15',
  },

  points: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
  },

  status: {
    fontSize: 11,
    marginTop: 4,
  },
});