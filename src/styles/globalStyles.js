// src/styles/globalStyles.js

import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet } from 'react-native';

const colors = {
  primary: '#6D4C41',        // warm gold
  secondary: '#8D6E63',  
  headerTitleColor: '#2D1B16',    // soft brown
  background: '#F5E6D3',     // cream background
  text: '#3E2723',           // dark brown text
  white: '#FFFFFF',
  border: '#E0C3A3',         // soft border
  placeholderTextColor: "#A1887F",
  safeAreaColor: '#ebbd80',
  BottomTabBarBackground:'#f4d3a9', //#EFE3D3,
  activeTabBackground: '#f2f0ee',
  inactiveTabBackground: '#9a8262',
  price: '#633606',
  productColumnBackground: '#f7fafa',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
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
    color: colors.text,
  },
};

export const globalStyles = StyleSheet.create({
 container: {
  flexGrow: 1,
  padding: 20,
  backgroundColor: colors.background,       // ✅ change
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
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight:'600',
    letterSpacing: 0.5,
  },

  // 🔥 Softer input
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    backgroundColor: '#FFF',
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

  title: {
    ...typography.title,
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
});

export { colors, spacing, typography };