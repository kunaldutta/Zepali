// src/styles/globalStyles.js

import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet } from 'react-native';

const colors = {
  primary: '#6D4C41',        // warm gold
  secondary: '#8D6E63',  
  headerTitleColor: '#2D1B16',    // soft brown
  background: '#F5E6D3',     // cream background
  text: '#452a25',           // dark brown text
  white: '#FFFFFF',
  border: '#ed9d83',         // soft border
  placeholderTextColor: "#A1887F",
  safeAreaColor: '#ebbd80',
  BottomTabBarBackground:'#f4d3a9', //#EFE3D3,
  activeTabBackground: '#f2f0ee',
  inactiveTabBackground: '#9a8262',
  price: '#ae681c',
  productColumnBackground: '#f7fafa',
  descriptioncolor:"#058484",
  blueBackgroundColor: '#2980b9',
  rowSelectBackground: '#f5e08b',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 24,
  xl: 32,
};

const typography = {
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    fontWeight:'500',
    color: colors.text,
  },
};

export const globalStyles = StyleSheet.create({
 container: {
  flexGrow: 1,
  padding: 10,
  backgroundColor: colors.background,       // ✅ change
},
safeArea: { flex: 1, backgroundColor: colors.safeAreaColor },
centerContainer: {
  flex: 1,
  padding: 20,
  justifyContent: "flex-start", // ✅ REQUIRED
  backgroundColor:colors.background
},
container2:{
    flexGrow:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    backgroundColor:colors.background
  },

  scrollViewContainer:{
    flex:1,
    backgroundColor:colors.background
  },

  safeArea: { 
    flex: 1, 
    backgroundColor: colors.safeAreaColor 
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 🔥 Premium card with soft shadow
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // 🔥 Elegant button
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    alignContent : 'center',
    justifyContent:'center',
    elevation: 3,
  },
  shadowWrapper: {
    borderRadius: 0,
    backgroundColor: 'transparent',
  },

  bottomShadow: {
    marginBottom: 15,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    elevation: 3,
  },

  providerBtn: {
    flex: 1,
    padding: 12,
    marginRight: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  activeProvider: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  buttonText: {
    color: '#fff',
    fontWeight:'600',
    letterSpacing: 1,
    fontSize: 16,
  },

  // 🔥 Softer input
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF',
    height:45,
    marginBottom: 15,
  },

  input2: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },

  // 🔥 Tabs (more subtle)
  tab:{ 
    flex:1, 
    padding:10, 
    borderRadius:12, 
    backgroundColor:colors.inactiveTabBackground, 
    margin:4, 
    alignItems:'center' 
  },

  activeTab:{ 
    backgroundColor:colors.primary 
  },

  tabText:{ 
    fontWeight:'600',
    color: colors.text
  },

  activeTabText:{ 
    color:'#fff' 
  },
  dateTimeText: {
    color: '#9b5408',
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  title2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: colors.text,
  },

  subtitle: {
    ...typography.subtitle,
    color: colors.secondary,
  },

  text: {
    ...typography.body,
    color: colors.text,
  },
  offerBanner: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0, // 👈 FULL WIDTH FIX
  height: 30,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  zIndex: 1,
},

offerText: {
  color: '#fff',
  fontSize: 12,
  textAlign: 'center',
  lineHeight: 14,
},
pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  sideLabel: {
    fontSize: 14,
    marginTop: 2,
    color: colors.primary,
    fontWeight:'700',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginTop: 2,
    color: colors.secondary,
    fontWeight:'600',
    fontSize: 16,
  }
});

export { colors, spacing, typography };