import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

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
   CREATE CHANNEL (ONCE)
========================= */
async function createChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
}

/* =========================
   SHOW NOTIFICATION
========================= */
async function showNotification(remoteMessage) {
  await createChannel();

  await notifee.displayNotification({
    title: remoteMessage?.data?.title || 'Notification',
    body: remoteMessage?.data?.body || 'You have a new message',

    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher', // ✅ REQUIRED
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
  });
}

/* =========================
   FOREGROUND HANDLER
========================= */
export function notificationListener(navigation) {

  // ✅ Foreground (NO ALERT)
  messaging().onMessage(async remoteMessage => {
    console.log('🔥 Foreground:', remoteMessage);

    await showNotification(remoteMessage);
  });

  // ✅ Background click
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('👉 Opened from background:', remoteMessage);

    const screen = remoteMessage?.data?.screen;
    if (screen && navigation) {
      navigation.navigate(screen);
    }
  });

  // ✅ Quit state click
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
export function backgroundHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('🔥 Background:', remoteMessage);

    await showNotification(remoteMessage);
  });
}