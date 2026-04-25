// PointsSelector.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { fetchUserPointsAPI } from '../services/itemBilling';


const PointsSelector = ({ userId, cartTotal, onChange }) => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [maxUsable, setMaxUsable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    if (userId && cartTotal) {
      fetchPoints();
    }
  }, [userId, cartTotal]);

  const fetchPoints = async () => {
    try {
      setLoading(true);

      const json = await fetchUserPointsAPI(userId, cartTotal);

      if (json.status) {
        setTotalPoints(json.total_points);
        setMaxUsable(json.max_usable_amount);
      }
    } catch (e) {
      console.log('Points API error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleUsePoints = () => {
    const newState = !usePoints;
    setUsePoints(newState);

    if (newState) {
      const amount = maxUsable;

      onChange && onChange({
        points: maxUsable,
        amount: amount,
      });
    } else {
      onChange && onChange({
        points: 0,
        amount: 0,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Use Points</Text>

      <Text style={styles.info}>Total Points: {totalPoints}</Text>

      <Text style={styles.info}>
        Max Usable: {maxUsable} pts (₹{(maxUsable).toFixed(2)})
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: usePoints ? '#4CAF50' : '#ccc' },
        ]}
        onPress={toggleUsePoints}
      >
        <Text style={styles.buttonText}>
          {usePoints ? 'Points Applied' : 'Use Max Points'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PointsSelector;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    elevation:2
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});