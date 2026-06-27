import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { fetchUserPointsAPI } from '../services/itemBilling';

const PointsSelector = ({
  userId,
  cartTotal,
  onChange,
  isPointSelected,
}) => {

  const [totalPoints, setTotalPoints] = useState(0);
  const [maxUsable, setMaxUsable] = useState(0);
  const [maxUsablePoints, setMaxUsablePoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Prevent duplicate auto apply
  const autoAppliedRef = useRef(false);

  // ✅ Prevent duplicate amount
  const lastAppliedAmount = useRef(null);

  // ✅ Prevent multiple API trigger
  const isApplyingRef = useRef(false);

  /* ================= FETCH POINTS ================= */

  useEffect(() => {

    if (!userId) {
      return;
    }

    if (!cartTotal || Number(cartTotal) <= 0) {
      return;
    }

    fetchPoints();

  }, [userId]);

  const fetchPoints = async () => {

    try {

      setLoading(true);

      const json = await fetchUserPointsAPI(
        cartTotal,
      );


      if (json?.status) {

        setTotalPoints(
          Number(json.total_points || 0),
        );

        setMaxUsable(
          Number(json.max_usable_amount || 0),
        );

        setMaxUsablePoints(
          Number(json.max_usable_points || 0),
        );
      }

    } catch (e) {

      console.log(
        'Points API error:',
        e,
      );

    } finally {

      setLoading(false);
    }
  };

  /* ================= APPLY ================= */

  const applyPoints = useCallback(async (points, amount) => {

    try {

      // ✅ STOP multiple simultaneous calls
      if (isApplyingRef.current) {
        return;
      }

      const finalAmount = Number(amount || 0);

      // ✅ STOP same amount loop
      if (lastAppliedAmount.current === finalAmount) {
        return;
      }

      isApplyingRef.current = true;

      lastAppliedAmount.current = finalAmount;


      if (onChange) {

        await onChange({
          points,
          amount: finalAmount,
        });
      }

    } catch (error) {

      console.log(
        '❌ applyPoints ERROR:',
        error,
      );

    } finally {

      isApplyingRef.current = false;
    }

  }, [onChange]);

  /* ================= AUTO APPLY ONLY ONCE ================= */

  useEffect(() => {

    // ✅ wait loading complete
    if (loading) {
      return;
    }

    // ✅ already auto applied
    if (autoAppliedRef.current) {
      return;
    }

    // ✅ restore selected state
    if (
      isPointSelected &&
      Number(maxUsable) > 0
    ) {

      autoAppliedRef.current = true;

      applyPoints(
        maxUsablePoints,
        maxUsable,
      );
    }

  }, [
    loading,
    isPointSelected,
  ]);

  /* ================= TOGGLE ================= */

  const toggleUsePoints = async () => {

    try {

      const newState = !isPointSelected;


      // ✅ prevent auto effect rerun
      autoAppliedRef.current = true;

      if (newState) {

        // APPLY
        await applyPoints(
          maxUsablePoints,
          maxUsable,
        );

      } else {

        // REMOVE
        await applyPoints(0, 0);
      }

    } catch (error) {

      console.log(
        '❌ toggleUsePoints ERROR:',
        error,
      );
    }
  };

  /* ================= LOADER ================= */

  if (loading) {

    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <View style={styles.container}>

      <Text style={styles.header}>
        Use Points
      </Text>

      <Text style={styles.info}>
        Total Points: {totalPoints}
      </Text>

      <Text style={styles.info}>
        Max Usable: {maxUsablePoints} pts
        (₹{Number(maxUsable).toFixed(2)})
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              isPointSelected
                ? '#22C55E'
                : '#F59E0B',
          },
        ]}
        onPress={toggleUsePoints}
      >
        <Text style={styles.buttonText}>
          {isPointSelected
            ? `⭐ Used Points (₹${Number(maxUsable).toFixed(2)})`
            : `⭐ Use Max Points (₹${Number(maxUsable).toFixed(2)} Off)`}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default PointsSelector;

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    elevation: 2,
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