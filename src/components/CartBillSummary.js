import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import i18n from '../localization/i18n';
import { globalStyles, colors } from '../styles/globalStyles';

const CartBillSummary = ({ summary, total }) => {

  if (!summary) return null;
  console.log('Summary =====', summary);
  const originalPrice = Number(summary.total_original_price || 0);
  const discount = Number(summary.total_discount || 0);
  const gst = Number(summary.total_gst_amount || 0);
  const finalAmount = Number(summary.grand_total || 0);
  const pointsDiscount = Number(summary.points_discount || 0);

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title2}>{i18n.t('BILLING_SUMMARY')}</Text>
      <View style={styles.row}>
        <Text>{i18n.t('TOTAL_ORIGINAL_PRICE')}</Text>
        <Text>₹{originalPrice.toFixed(2)}</Text>
      </View>
    {pointsDiscount > 0 && (
        <View style={styles.row}>
          <Text>Points Used</Text>
          <Text style={{ color: 'green' }}>
            ₹{pointsDiscount.toFixed(2)}
          </Text>
        </View>
      )}
      <View style={styles.row}>
        <Text>{i18n.t('TOTAL_DISCOUNT')}</Text>
        <Text style={{ color: 'green' }}>
          -₹{discount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>{i18n.t('GST_AMOUNT')}</Text>
        <Text>₹{gst.toFixed(2)}</Text>
      </View>


      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalText}>
          {i18n.t('NET_PAYABLE')}
        </Text>
        <Text style={styles.totalText}>
          ₹{finalAmount.toFixed(2)}
        </Text>
      </View>

    </View>
  );
};

export default CartBillSummary;

const styles = StyleSheet.create({
  container: {
    top:20,
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