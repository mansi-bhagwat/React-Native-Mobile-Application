// screens/VideoPlayerScreen.js
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Video } from 'expo-av';
import { GOOGLE_DRIVE_VIDEO_URL } from '../constants';

export default function VideoPlayerScreen({ route }) {
  const { videoUrl } = route.params || {};
  const videoUri = videoUrl || GOOGLE_DRIVE_VIDEO_URL;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎥 Drowning Video Feed</Text>
      <Video
        source={{ uri: videoUri }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        style={styles.video}
        onError={(e) => console.log('Video error', e)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center',
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 20,
  },
  video: {
    width: '100%', height: 300, borderRadius: 10, backgroundColor: '#000',
  },
});
