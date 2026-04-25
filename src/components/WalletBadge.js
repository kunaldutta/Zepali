import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {usePoints} from './PointsContext';
import { globalStyles, colors } from '../styles/globalStyles';

const WalletBadge = ({
  showPoints = true,
  showRupees = true,
  badgeWidth= '90%',
  size = 'medium',
  style = {},
  onPress = null,
  loading = false,
}) => {

  const {points, rupees} = usePoints();

  const sizes = {
    small: {icon: 16, rupees: 12, points: 10, padding: 6},
    medium: {icon: 20, rupees: 12, points: 10, padding: 4},
    large: {icon: 10, rupees: 20, points: 14, padding: 10},
  };

  const s = sizes[size] || sizes.medium;

  const Container = onPress ? TouchableOpacity : View;

  // 🔥 shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, {padding: s.padding}, style]}
    >
      {/* ICON */}
      <View style={styles.iconBox}>
        <Ionicons name="wallet" size={s.icon} color="#fff" />
      </View>

      {/* TEXT */}
      <View style={styles.textContainer}>

        {loading ? (
          <Animated.View style={{opacity}}>
            <View style={styles.shimmerLine} />
            <View style={[styles.shimmerLine, {width: 50, marginTop: 6}]} />
          </Animated.View>
        ) : (
          <>
            {showRupees && (
              <Text style={[styles.rupees, {fontSize: s.rupees}]}>
                ₹ {rupees ?? 0}
              </Text>
            )}

            {showPoints && (
              <Text style={[styles.points, {fontSize: s.points}]}>
                {points ?? 0} pts
              </Text>
            )}
          </>
        )}

      </View>
    </Container>
  );
};

export default WalletBadge;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    shadowColor: '#541111',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  iconBox: {
    backgroundColor: '#22C55E',
    borderRadius: 50,
    padding: 6,
    marginRight: 10,
  },

  textContainer: {
    justifyContent: 'center',
  },

  rupees: {
    color: '#fff',
    fontWeight: 'bold',
  },

  points: {
    color: '#CBD5F5',
    marginTop: 2,
    fontWeight: 'bold',
  },

  // 🔥 shimmer styles
  shimmerLine: {
    height: 10,
    width: 70,
    borderRadius: 5,
    backgroundColor: '#334155',
  },
});