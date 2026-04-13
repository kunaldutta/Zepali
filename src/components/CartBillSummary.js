import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import i18n from '../localization/i18n';

const CartBillSummary = ({ summary }) => {

  if (!summary) return null; // ✅ safety

  return (
    <View style={styles.container}>
      
      <View style={styles.row}>
        <Text>{i18n.t('TOTAL_ORIGINAL_PRICE')}</Text>
        <Text>₹{summary.total_original_price}</Text>
      </View>

      <View style={styles.row}>
        <Text>{i18n.t('TOTAL_DISCOUNT')}</Text>
        <Text style={{ color: 'green' }}>
          -₹{summary.total_discount}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>{i18n.t('GST_AMOUNT')}</Text>
        <Text>₹{summary.total_gst_amount}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalText}>
          {i18n.t('NET_PAYABLE')}
        </Text>
        <Text style={styles.totalText}>
          ₹{summary.grand_total}
        </Text>
      </View>

    </View>
  );
};

export default CartBillSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16
  }
});