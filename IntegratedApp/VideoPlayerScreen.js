import React from 'react';
import { View, StyleSheet, Text, Button, Alert } from 'react-native';
import { Video } from 'expo-av';
import { GOOGLE_DRIVE_VIDEO_URL } from '../constants';
// Import all necessary functions for modular SDK
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from '@react-native-firebase/firestore';

// Initialize Firestore instance outside the component or in a separate utility file
// This ensures it's initialized only once.
const db = getFirestore();

export default function VideoPlayerScreen({ route }) {
  const { videoUrl, video_id, timestamp } = route.params || {};
  const videoUri = videoUrl || GOOGLE_DRIVE_VIDEO_URL;

  const handleConfirmation = async (response) => {
    Alert.alert(
      "Thanks for your feedback!",
      response === "yes" ? "Marked as drowning" : "Marked as false alarm"
    );

    try {
      // Correct way to add a document using modular SDK
      await addDoc(collection(db, 'video_feedback'), {
        video_id: video_id || 'unknown', // Use the video_id prop directly
        video_url: videoUri,
        timestamp: timestamp || new Date().toISOString(),
        is_drowning: response === "yes" ? "true" : "false",
        created_at: serverTimestamp() // Correct usage of serverTimestamp
      });
      console.log("✅ Feedback saved to Firestore");

      // Correct way to read all documents from a collection using modular SDK
      const snapshot = await getDocs(collection(db, 'video_feedback'));
      if (snapshot.empty) {
        console.log("📭 No feedback data found.");
      } else {
        console.log("📦 All feedback documents:");
        snapshot.forEach(doc => {
          console.log(`📝 ${doc.id}:`, doc.data());
        });
      }
    } catch (err) {
      console.error("❌ Failed to save or read feedback:", err);
      Alert.alert("Error", "Failed to save feedback. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎥 Drowning Video Feed</Text>
      {timestamp && (
        <Text style={styles.timestamp}>🕒 {new Date(timestamp).toLocaleString()}</Text>
      )}
      <Video
        source={{ uri: videoUri }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        style={styles.video}
        onError={(e) => console.log('Video error', e)}
      />
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackPrompt}>Is this actually a drowning incident?</Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrapper}>
            <Button
              title="✅ Yes"
              onPress={() => handleConfirmation("yes")}
              color="#2e7d32"
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="❌ No"
              onPress={() => handleConfirmation("no")}
              color="#c62828"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  video: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    backgroundColor: '#000',
    marginBottom: 30,
  },
  feedbackContainer: {
    width: '100%',
    alignItems: 'center',
  },
  feedbackPrompt: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
});