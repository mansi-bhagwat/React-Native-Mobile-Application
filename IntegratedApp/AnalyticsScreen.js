import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  BarChart,
  XAxis,
  YAxis,
  Grid,
} from 'react-native-svg-charts';
import Papa from 'papaparse';
import { ALERTS_CSV_URL } from '../constants';

export default function AnalyticsScreen() {
  const [chartData, setChartData] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching data from:', ALERTS_CSV_URL);
    
    fetch(ALERTS_CSV_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        if (!text || text.trim() === '') {
          throw new Error('Empty response received');
        }
        
        console.log('CSV data received, length:', text.length);
        
        const parsed = Papa.parse(text, { 
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        
        if (parsed.errors && parsed.errors.length > 0) {
          console.warn('CSV parsing had errors:', parsed.errors);
        }
        
        console.log('Parsed data count:', parsed.data.length);
        if (parsed.data.length === 0) {
          throw new Error('No valid data rows found in CSV');
        }
        
        // Debug: Check the structure of the first row
        if (parsed.data.length > 0) {
          console.log('First row structure:', Object.keys(parsed.data[0]));
          console.log('First row data:', parsed.data[0]);
        }
        
        // Group by date - looking specifically for 'timestamp' field
        const dateMap = {};
        parsed.data.forEach((row, index) => {
          // First check if we have a timestamp property
          const timestampValue = row.timestamp || row.Timestamp || row.TIMESTAMP;
          
          if (timestampValue) {
            try {
              let dateStr;
              
              // Handle both string timestamps and Date objects
              if (typeof timestampValue === 'string') {
                // Extract just the date part (YYYY-MM-DD) from string
                const dateParts = timestampValue.split('T');
                if (dateParts.length > 0) {
                  dateStr = dateParts[0];
                }
              } else if (timestampValue instanceof Date || Object.prototype.toString.call(timestampValue) === '[object Date]') {
                // It's a Date object or has a Date toString format
                dateStr = timestampValue.toISOString().split('T')[0];
              } else if (typeof timestampValue === 'object' && timestampValue.toString) {
                // Try to handle it as a string representation
                const dateString = timestampValue.toString();
                if (dateString.includes('T')) {
                  dateStr = dateString.split('T')[0];
                }
              }
              
              // Validate the date format
              if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
                console.log(`Row ${index}: Successfully processed date:`, dateStr);
              } else {
                console.warn(`Row ${index}: Invalid date format:`, dateStr);
              }
            } catch (err) {
              console.error(`Error processing row ${index}:`, err, timestampValue);
            }
          } else {
            console.warn(`Row ${index}: Missing timestamp:`, row);
          }
        });
        
        console.log('Date map after processing:', dateMap);
        
        // Check if we have any data points
        if (Object.keys(dateMap).length === 0) {
          throw new Error('No valid dates found in the CSV data');
        }
        
        // Sort dates chronologically
        const sorted = Object.entries(dateMap).sort(([a], [b]) =>
          a.localeCompare(b)
        );
        
        console.log('Sorted data:', sorted);
        
        // Format for chart display
        const data = sorted.map(([date, count]) => ({ 
          x: date,
          y: count,
          label: date.slice(5) // MM-DD format
        }));
        
        console.log('Final chart data:', data);
        
        setChartData(data);
        setXLabels(sorted.map(([date]) => date));
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err.message);
        setError(err.message);
        setChartData([]);
        setXLabels([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  // Show error state if there was an error loading the data
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Drowning Alerts Per Day</Text>
        <Text style={styles.errorText}>Error loading data: {error}</Text>
      </View>
    );
  }

  // Ensure we have data to display
  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Drowning Alerts Per Day</Text>
        <Text style={styles.noData}>No data available</Text>
      </View>
    );
  }

  // Calculate chart width based on number of bars and screen width
  // Ensure minimum width per bar is 80px for better spacing
  const minBarWidth = 80;
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(chartData.length * minBarWidth, screenWidth - 100);

  // Find the maximum value for Y-axis scale
  const maxValue = Math.max(...chartData.map(item => item.y));
  // Calculate appropriate number of ticks (usually one more than the max value)
  const numberOfTicks = Math.min(maxValue + 1, 6); // Cap at 6 ticks max

  console.log('Chart width:', chartWidth);
  console.log('Max Y value:', maxValue);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Drowning Alerts Per Day</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ paddingRight: 20, paddingLeft: 10 }}>
          <View style={{ flexDirection: 'row', height: 250 }}>
            <YAxis
              data={[0, ...chartData.map(item => item.y)]} // Add 0 to ensure scale starts at 0
              svg={{ fontSize: 12, fill: 'grey' }}
              numberOfTicks={numberOfTicks}
              min={0}
              max={maxValue}
              contentInset={{ top: 10, bottom: 10 }}
              formatLabel={(value) => value.toFixed(1)} // Show decimal for half values
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <BarChart
                style={{ height: 250, width: chartWidth }}
                data={chartData}
                yAccessor={({ item }) => item.y}
                xAccessor={({ item }) => item.x}
                svg={{ fill: '#1976d2' }}
                spacingInner={0.5}
                spacingOuter={0.3}
                gridMin={0}
                contentInset={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Grid direction="HORIZONTAL" />
              </BarChart>
            </View>
          </View>

          <XAxis
            style={{ width: chartWidth, marginLeft: 30, height: 50 }}
            data={chartData}
            xAccessor={({ item }) => item.x}
            formatLabel={(value, index) => {
              // Extract MM-DD from the date
              const date = chartData[index]?.x;
              if (!date) return '';
              return date.slice(5); // Returns MM-DD part
            }}
            contentInset={{ left: 10, right: 30 }}
            svg={{
              fontSize: 10,
              fill: 'black',
              rotation: 45,
              originY: 10,
              y: 20,
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 30,
    color: 'red',
    paddingHorizontal: 20,
  },
});