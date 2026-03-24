import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions
} from 'react-native';
import colors from '../theme/colors';
import { getDashboardSummary } from '../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Hoje');

  const loadData = useCallback(async () => {
    try {
      const result = await getDashboardSummary();
      setData(result);
    } catch (err) {
      console.log('Dashboard error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const kpis = data?.kpis || {};
  const productivity = data?.productivity || { average: 0, fields: [] };
  const stock = data?.stock || { total: '0t', items: [] };
  const tempHistory = data?.temperature_history || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Análise de Métricas</Text>
          <Text style={styles.headerIcon}>📊</Text>
        </View>

        {/* Time filter pills */}
        <View style={styles.filterRow}>
          {['Hoje', '7 dias', 'Este Mês'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, timeFilter === f && styles.filterPillActive]}
              onPress={() => setTimeFilter(f)}
            >
              <Text style={[styles.filterText, timeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiMini, { borderLeftColor: colors.info }]}>
          <Text style={styles.kpiMiniLabel}>Umidade do Solo</Text>
          <Text style={styles.kpiMiniValue}>{kpis.soil_moisture || 0}%</Text>
        </View>
        <View style={[styles.kpiMini, { borderLeftColor: colors.accentOrange }]}>
          <Text style={styles.kpiMiniLabel}>Temperatura Média</Text>
          <Text style={styles.kpiMiniValue}>{kpis.temperature || 0}°C</Text>
        </View>
      </View>

      {/* Climate Variation - simple representation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Variação Climática</Text>
        <Text style={styles.cardSubtitle}>Resumo das últimas 24h</Text>
        <View style={styles.tempBarContainer}>
          {tempHistory.slice(-8).map((item, i) => (
            <View key={i} style={styles.tempBarItem}>
              <View style={[styles.tempBar, { height: Math.max(20, (item.avg_temp || 25) * 2.5) }]} />
              <Text style={styles.tempBarLabel}>{Math.round(item.avg_temp || 0)}°</Text>
              <Text style={styles.tempBarTime}>{item.time_label || ''}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Productivity */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>Produtividade</Text>
            <Text style={styles.cardSubtitle}>Sacas por hectare (sc/ha)</Text>
          </View>
          <View style={styles.prodAvg}>
            <Text style={styles.prodAvgValue}>{productivity.average}</Text>
            <Text style={styles.prodAvgLabel}>Média</Text>
          </View>
        </View>
        {productivity.fields.map((field, i) => (
          <View key={i} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressName}>{field.name}</Text>
              <Text style={styles.progressValue}>{field.value}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${field.value}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Stock */}
      <View style={[styles.card, { marginBottom: 100 }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Estoque de Insumos</Text>
          <Text style={styles.stockTotal}>Total: {stock.total}</Text>
        </View>
        {stock.items.map((item, i) => {
          const itemColors = [colors.success, colors.info, colors.accentOrange];
          return (
            <View key={i} style={styles.stockItem}>
              <View style={[styles.stockDot, { backgroundColor: itemColors[i] }]} />
              <Text style={styles.stockName}>{item.name}</Text>
              <Text style={styles.stockPct}>{item.percentage}%</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textDark },
  headerIcon: { fontSize: 22 },
  filterRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border,
  },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  filterTextActive: { color: '#fff' },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 16 },
  kpiMini: {
    flex: 1, backgroundColor: colors.cardWhite, borderRadius: 12, padding: 16,
    borderLeftWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  kpiMiniLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  kpiMiniValue: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  card: {
    backgroundColor: colors.cardWhite, borderRadius: 14, padding: 18, marginHorizontal: 20,
    marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  tempBarContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
  tempBarItem: { alignItems: 'center', flex: 1 },
  tempBar: {
    width: 20, backgroundColor: colors.accentOrange, borderRadius: 4, opacity: 0.7,
    minHeight: 10,
  },
  tempBarLabel: { fontSize: 10, fontWeight: '600', color: colors.textDark, marginTop: 4 },
  tempBarTime: { fontSize: 8, color: colors.textMuted, marginTop: 2 },
  prodAvg: { alignItems: 'flex-end' },
  prodAvgValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  prodAvgLabel: { fontSize: 11, color: colors.textMuted },
  progressItem: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressName: { fontSize: 13, fontWeight: '500', color: colors.textDark },
  progressValue: { fontSize: 13, fontWeight: '600', color: colors.primary },
  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  stockTotal: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  stockItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stockDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  stockName: { flex: 1, fontSize: 14, color: colors.textDark },
  stockPct: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
});
