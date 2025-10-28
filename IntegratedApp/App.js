import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

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

        messaging()
          .subscribeToTopic('drowning-alerts')
          .then(() => console.log('Subscribed to topic: drowning-alerts'))
          .catch((err) => console.error('Topic subscription failed:', err));
      }

      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage?.data?.video_url) {
        console.log("Opened from quit state with video:", remoteMessage.data.video_url);
      }

      messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage?.data?.video_url) {
          console.log("Opened from background with video:", remoteMessage.data.video_url);
        }
      });

      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log("Background message:", remoteMessage);
      });

      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log("📬 Foreground FCM Message:", remoteMessage);
        const url = remoteMessage?.data?.video_url;
        const videoId = remoteMessage?.data?.video_id; // Extract video_id
        const timestamp = remoteMessage?.data?.timestamp; // Extract timestamp

        if (url) {
          Alert.alert("Drowning Detected!", "Tap to view", [
            {
              text: "View Video",
              onPress: () => {
                navigationRef?.current?.navigate('Video Player', 
                  { videoUrl: url, 
                    video_id: videoId,
                    timestamp: timestamp, 
                  });
              }
            }
          ]);
        }
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
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Video Player" component={VideoPlayerScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 🔁 Create a navigationRef for programmatic navigation outside components
import { createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();
