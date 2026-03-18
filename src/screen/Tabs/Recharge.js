import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Recharge() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recharge</Text>
      <Text>Recharge your account here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 20, fontWeight: '600', marginBottom: 8},
});