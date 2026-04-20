import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from "../../styles/globalStyles";
import AppHeader from "../../components/AppHeader";
import i18n from "../../localization/i18n";


const WebViewScreen = ({ route, navigation }) => {
  const { url } = route.params || {};
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Always wrap text inside <Text>
  if (!url) {
    return (
      <View style={styles.center}>
        <Text>No URL provided</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
        <AppHeader
        title={i18n.t('TERMS_AND_CONDITIONS') || 'Terms & Conditions'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
    <View style={styles.container}>
      {/* Header */}

      {/* Loader */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {/* WebView */}
      <WebView
        source={{ uri: url }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          alert("Failed to load page");
        }}
      />
    </View>
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  back: { fontSize: 16, color: "blue" },
  title: { fontSize: 16, fontWeight: "bold" },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});