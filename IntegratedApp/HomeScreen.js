import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import lifeguardImg from '../assets/home_screen_image.png';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ImageBackground source={lifeguardImg} style={styles.image} imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Lifeguard Monitor</Text>
          <Text style={styles.subtitle}>Stay alert. Save lives.</Text>
        </View>
      </ImageBackground>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Video Player')}>
        <Text style={styles.buttonText}>▶️ Monitor Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>📊 Incident Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#e0f7fa', alignItems: 'center',
  },
  image: {
    width: width,
    height: 300,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#00796b',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});