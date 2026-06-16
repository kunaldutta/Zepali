import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

/* =========================
   REQUEST PERMISSION
========================= */
export async function requestUserPermission() {
  try {
    console.log('Requesting permission...');

    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      console.log('Permission result:', result);
    }

    const authStatus = await messaging().requestPermission();

    console.log('Auth status:', authStatus);

  } catch (e) {
    console.log('Permission error:', e);
  }
}

/* =========================
   GET FCM TOKEN
========================= */
export async function getFCMToken() {
  const token = await messaging().getToken();
  
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
   
    await showNotification(remoteMessage);
  });

  // ✅ Background click
  messaging().onNotificationOpenedApp(remoteMessage => {
    

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