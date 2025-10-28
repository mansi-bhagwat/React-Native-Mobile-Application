import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

export default function DashboardScreen() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrowningFilter, setIsDrowningFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore()
          .collection('video_feedback')
          .orderBy('timestamp', 'desc')
          .get();

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAlerts(data);
        setFilteredAlerts(data);
      } catch (err) {
        console.error('❌ Error fetching Firestore data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = alerts.filter((item) => {
      const matchesStatus =
        isDrowningFilter === 'All' || item.is_drowning === isDrowningFilter;

      const matchesDate =
        !dateFilter ||
        new Date(item.timestamp).toISOString().slice(0, 10) === dateFilter;

      return matchesStatus && matchesDate;
    });

    setFilteredAlerts(filtered);
  }, [isDrowningFilter, dateFilter, alerts]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📋 Drowning Incidents</Text>

      <Text style={styles.subheading}>Filter by Status:</Text>
      <View style={styles.filterRow}>
        {['All', 'true', 'false'].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.filterButton,
              isDrowningFilter === value && styles.filterButtonActive,
            ]}
            onPress={() => setIsDrowningFilter(value)}
          >
            <Text
              style={[
                styles.filterText,
                isDrowningFilter === value && styles.filterTextActive,
              ]}
            >
              {value === 'All' ? 'All' : value === 'true' ? '✅ Drowning' : '❌ False Alarm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subheading}>Filter by Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.dateInput}
        placeholder="e.g. 2025-05-10"
        value={dateFilter}
        onChangeText={setDateFilter}
      />

      <Text style={styles.subheading}>Total Alerts: {filteredAlerts.length}</Text>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Video Player', {
                videoUrl: item.video_url,
                video_id: item.video_id,
                timestamp: item.timestamp,
              })
            }
          >
            <Text style={styles.label}>🕒 {new Date(item.timestamp).toLocaleString()}</Text>
            <Text style={styles.detail}>📼 Video ID: {item.video_id}</Text>
            <Text style={styles.detail}>🧭 Is Drowning: {item.is_drowning}</Text>
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
    fontSize: 16, fontWeight: '500', marginVertical: 10, color: '#555',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4caf50',
  },
  filterText: {
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
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
