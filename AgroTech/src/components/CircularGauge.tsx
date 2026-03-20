// src/components/CircularGauge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  percentage: number;
  label: string;
  color?: string;
}

const CircularGauge: React.FC<Props> = ({ percentage, label, color = '#006400' }) => {
  const radius = 45;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.container}>
      <Svg width={120} height={120}>
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  textContainer: { position: 'absolute', alignItems: 'center' },
  percentage: { fontSize: 28, fontWeight: 'bold' },
  label: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});

export default CircularGauge;