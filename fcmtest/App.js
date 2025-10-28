import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import messaging from "@react-native-firebase/messaging";
import React, { useEffect } from "react";

export default function App() {
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    } else {
      console.log("Permission not granted", authStatus);
    }

    return enabled;
  };

  useEffect(() => {
    const setupMessaging = async () => {
      const permissionGranted = await requestUserPermission();

      if (permissionGranted) {
        const token = await messaging().getToken();
        console.log("FCM Token:", token);

        // 🔔 Subscribe to a topic
        messaging()
          .subscribeToTopic('drowning-alerts')
          .then(() => {
            console.log('Subscribed to topic: drowning-alerts');
          })
          .catch((err) => {
            console.error('Topic subscription failed:', err);
          });
      }

      // Check if app opened from quit state
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log(
          "Notification caused app to open from quit state: ",
          remoteMessage.notification
        );
      }

      // When app opened from background state
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log(
          "Notification caused app to open from background state: ",
          remoteMessage.notification
        );
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log("Background message:", remoteMessage);
      });

      // Handle foreground messages
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        Alert.alert("New FCM Message", JSON.stringify(remoteMessage));
      });

      return unsubscribe;
    };

    const unsubscribePromise = setupMessaging();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>My App</Text>
      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
