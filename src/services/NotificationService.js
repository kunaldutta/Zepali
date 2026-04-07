import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

/* =========================
   REQUEST PERMISSION
========================= */
export async function requestUserPermission() {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }

  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ Notification permission granted');
  }
}

/* =========================
   GET FCM TOKEN
========================= */
export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('🔥 FCM Token:', token);

  return token;
}

/* =========================
   FOREGROUND HANDLER
========================= */
export function notificationListener(navigation) {
  // Foreground
  messaging().onMessage(async remoteMessage => {
    console.log('🔥 Foreground:', remoteMessage);

    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || '',
    );
  });

  // Background click
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('👉 Opened from background:', remoteMessage);

    const screen = remoteMessage?.data?.screen;
    if (screen && navigation) {
      navigation.navigate(screen);
    }
  });

  // Quit state click
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('👉 Opened from quit state:', remoteMessage);

        const screen = remoteMessage?.data?.screen;
        if (screen && navigation) {
          navigation.navigate(screen);
        }
      }
    });
}

/* =========================
   BACKGROUND HANDLER
========================= */
export async function backgroundHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('🔥 Background:', remoteMessage);
  });
}