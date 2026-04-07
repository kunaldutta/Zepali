import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/globalStyles';

const AppHeader = ({
  title,
  onBackPress,
  showBack = true,
  showCart = true,
  leftComponent, // ✅ NEW
}) => {

  const navigation = useNavigation();

  // ✅ Get cart globally
  const { items } = useSelector(state => state.cart);

  // ✅ Total quantity
  const cartCount = items?.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <View style={styles.header}>
      
      {/* LEFT */}
      <View style={styles.leftContainer}>
        {leftComponent ? (
          leftComponent
        ) : showBack ? (
          <TouchableOpacity
            onPress={onBackPress || (() => navigation.goBack())}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* CENTER */}
      <View style={styles.centerContainer}>
        <Text
          style={[
            styles.headerTitle,
            { textAlign: showBack ? 'center' : 'left' }
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* RIGHT */}
      <View style={styles.rightContainer}>
        {showCart && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CartScreen')}
            style={styles.cartIcon}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />

            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

export default AppHeader;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.safeAreaColor,
  },

  leftContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  rightContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.headerTitleColor,
  },

  backBtn: {
    padding: 5,
  },

  cartIcon: {
    padding: 5,
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});