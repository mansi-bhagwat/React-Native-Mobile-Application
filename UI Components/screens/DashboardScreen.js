// screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ALERTS_CSV_URL } from '../constants';
import Papa from 'papaparse';

export default function DashboardScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetch(ALERTS_CSV_URL)
      .then((res) => res.text())
      .then((text) => {
        const results = Papa.parse(text, { header: true });
        const cleaned = results.data.filter(a => a.timestamp && a.frame_id && a.video_url);
        setAlerts(cleaned);
        setTotal(cleaned.length);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📋 Drowning Incidents</Text>
      <Text style={styles.subheading}>Total Alerts: {total}</Text>
      <TouchableOpacity style={styles.analyticsButton} onPress={() => navigation.navigate('Analytics')}>
        <Text style={styles.analyticsText}>📈 View Analytics</Text>
      </TouchableOpacity>
      <FlatList
        data={alerts}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Video Player', { videoUrl: item.video_url })}
          >
            <Text style={styles.label}>🕒 {item.timestamp}</Text>
            <Text style={styles.detail}>🎥 Frame ID: {item.frame_id}</Text>
            <Text style={styles.link}>▶️ Tap to view video</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#f0f4f7',
  },
  heading: {
    fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#1e88e5',
  },
  subheading: {
    fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#555',
  },
  analyticsButton: {
    backgroundColor: '#4caf50', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 15,
  },
  analyticsText: {
    color: '#fff', fontSize: 16, fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 16, fontWeight: '600', marginBottom: 4,
  },
  detail: {
    fontSize: 14, color: '#333', marginBottom: 6,
  },
  link: {
    fontSize: 14, color: '#1e88e5', textDecorationLine: 'underline',
  },
});
