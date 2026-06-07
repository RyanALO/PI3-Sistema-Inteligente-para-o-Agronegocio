import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import colors from '../theme/colors';

const screenWidth = Dimensions.get('window').width;

const MetricsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Hoje');

  useEffect(() => {
    // Simulando chamada via API para métricas
    setTimeout(() => setLoading(false), 1000);
  }, [filter]);

  const metricsData = {
    labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    datasets: [
      { data: [22, 21, 28, 25, 20], color: (opacity = 1) => `rgba(255, 109, 0, ${opacity})` }, // Temp
      { data: [65, 70, 50, 55, 60], color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})` }  // Umidade
    ]
  };

  const prodData = {
    labels: ['T1', 'T2', 'T3', 'T4'],
    datasets: [
      { data: [85, 90, 78, 92] }
    ]
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando métricas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Análise de Métricas</Text>
        <Text style={styles.subtitle}>Dados históricos de produtividade e sensores</Text>
      </View>

      <View style={styles.filterRow}>
        {['Hoje', '7 Dias', 'Este Mês'].map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => { setLoading(true); setFilter(f); }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Variação Climática</Text>
        <Text style={styles.cardSubtitle}>Temperatura (Laranja) e Umidade (Azul)</Text>
        <LineChart
          data={metricsData}
          width={screenWidth - 48}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            propsForDots: { r: '3', strokeWidth: '2', stroke: '#fff' }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Produtividade por Talhão</Text>
        <Text style={styles.cardSubtitle}>Sacas por hectare (sc/ha)</Text>
        <BarChart
          data={prodData}
          width={screenWidth - 48}
          height={220}
          yAxisLabel=""
          yAxisSuffix="sc"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Insight da IA</Text>
        <Text style={styles.insightText}>
          Com base no histórico dos últimos 7 dias, recomenda-se aumentar a irrigação no Talhão Norte entre as 12h e 14h, reduzindo o estresse hídrico da cultura em fase crítica de floração.
        </Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.primary, fontWeight: '500' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.border },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textDark, fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 12 },
  insightText: { fontSize: 14, color: colors.textDark, lineHeight: 22, marginTop: 8 }
});

export default MetricsScreen;
