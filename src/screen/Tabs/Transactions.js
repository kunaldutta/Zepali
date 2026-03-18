import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Transactions() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <Text>View your transaction history here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 20, fontWeight: '600', marginBottom: 8},
});