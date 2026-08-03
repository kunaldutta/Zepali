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
import CustomAlert from './CustomAlert';
import { colors } from '../styles/globalStyles';
import i18n from '../localization/i18n';

const PointsSelector = ({
  userId,
  cartTotal,
  onChange,
  isPointSelected,
  onLoadingChange,
}) => {

  const [totalPoints, setTotalPoints] = useState(0);
  const [maxUsable, setMaxUsable] = useState(0);
  const [maxUsablePoints, setMaxUsablePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pointsUseMsg, setPointsUseMsg] = useState('');
  const [isUsablePoint, setIsUsablePoint] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // ✅ Prevent duplicate auto apply
  const autoAppliedRef = useRef(false);

  // ✅ Prevent duplicate amount
  const lastAppliedAmount = useRef(null);

  // ✅ Prevent multiple API trigger
  const isApplyingRef = useRef(false);

  /* ================= FETCH POINTS ================= */

  useEffect(() => {
      if (!userId || !cartTotal || Number(cartTotal) <= 0) {
      setLoading(false);
      onLoadingChange?.(false);
      return;
  }
    autoAppliedRef.current = false;
    fetchPoints();
    

  }, [userId, cartTotal]);

  useEffect(() => {
  if (loading) {
    return;
  }

  // If points are selected but no longer allowed
  if (!isUsablePoint && isPointSelected) {
    autoAppliedRef.current = true;

    applyPoints(0, 0);
  }
}, [
  loading,
  isUsablePoint,
  isPointSelected,
  applyPoints,
]); 

  const fetchPoints = async () => {

    try {

      setLoading(true);
      onLoadingChange?.(true);
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
        setPointsUseMsg(
          json.point_use_message || '',
        );
        setIsUsablePoint(
          Boolean(json.isUsablePoint),
        );
        
      }

    } catch (e) {

      console.log(
        'Points API error:',
        e,
      );

    } finally {

      setLoading(false);
      onLoadingChange?.(false);
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

  if (loading) return;

  if (autoAppliedRef.current) return;

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
  maxUsable,
  maxUsablePoints,
  applyPoints,
]);

  /* ================= TOGGLE ================= */

  const toggleUsePoints = async () => {
    if (!isUsablePoint) {
      setIsAlertVisible(true);
      setAlertTitle(i18n.t("ATTENTION"));
      setAlertMessage(pointsUseMsg || 'You cannot use points for this order.');
      return;
    }
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
      <View
        style={{
          backgroundColor: pointsUseMsg
            ? colors.highlightTextColor
            : 'transparent',
          paddingHorizontal: 5,
          borderRadius: 6,
          alignItems: 'center',      // Horizontal center
          justifyContent: 'center',  // Vertical center
          marginBottom: 5,
          height: 'auto',
        }}
      >
        <Text
          style={[
            styles.header,
            {
              color: colors.text,
              fontSize: 13,
              fontWeight: 'bold',
              textAlign: 'center',
              paddingVertical: 2,
            },
          ]}
        >
          {pointsUseMsg || 'Use Points'}
        </Text>
      </View>
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
            : `⭐ Use Max Points (₹${Number(maxUsable).toFixed(2)}${Number(maxUsable) > 0 ? ' Off' : ''})`
          }
        </Text>
      </TouchableOpacity>
    {isAlertVisible && (
          <CustomAlert
            visible={isAlertVisible}   // ✅ REQUIRED
            title={alertTitle}
            message={alertMessage}
            onOk={() => setIsAlertVisible(false)}   // ✅ FIX
          />
        )}
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.secondary,
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