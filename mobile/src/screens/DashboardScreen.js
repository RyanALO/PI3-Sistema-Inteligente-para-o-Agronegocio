import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getAlertas, getDashboardSummaryFromSensoresAws } from '../services/api';
import colors from '../theme/colors';

const EMPTY_DASHBOARD = {
  success: true,
  kpis: {},
  productivity: {
    average: 0,
    fields: [],
  },
  stock: {
    items: [],
  },
};

function hasValue(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function formatPercent(value) {
  return hasValue(value) ? `${Math.round(Number(value))}%` : '--';
}

function formatTemperature(value) {
  return hasValue(value) ? `${Number(value).toFixed(1)}\u00b0` : '--';
}

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [alertas, setAlertas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [summaryResult, alertasResult] = await Promise.allSettled([
      getDashboardSummaryFromSensoresAws(),
      getAlertas(),
    ]);

    if (summaryResult.status === 'fulfilled') {
      setData(summaryResult.value);
    } else {
      console.log('AWS sensores error:', summaryResult.reason);
      setData(EMPTY_DASHBOARD);
    }

    if (alertasResult.status === 'fulfilled') {
      setAlertas(Array.isArray(alertasResult.value) ? alertasResult.value.slice(0, 3) : []);
    } else {
      console.log('Alertas error:', alertasResult.reason);
      setAlertas([]);
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

  const handleIrrigarGeral = () => {
    Alert.alert('Acionamento Manual', 'Deseja iniciar a irrigacao na zona principal agora?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar', onPress: () => Alert.alert('Sucesso', 'Irrigacao iniciada!') },
    ]);
  };

  const kpis = data?.kpis || {};
  const productivity = data?.productivity || EMPTY_DASHBOARD.productivity;
  const stock = data?.stock || EMPTY_DASHBOARD.stock;
  const stockItems = stock.items || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Monitoramento</Text>
          <Text style={styles.headerIcon}>IoT</Text>
        </View>
        <Text style={styles.subtitle}>Tempo Real</Text>
      </View>

      <View style={styles.mainKpiCard}>
        <Text style={styles.mainKpiTitle}>Umidade do Solo</Text>
        <Text style={styles.mainKpiValue}>{formatPercent(kpis.soil_moisture)}</Text>
        <Text style={styles.mainKpiDesc}>
          Media atual dos sensores ativos ({kpis.active_devices || 0}/{kpis.total_devices || 0})
        </Text>
      </View>

      <View style={styles.kpiGrid}>
        <View style={[styles.kpiMini, { borderLeftColor: colors.accentOrange }]}>
          <Text style={styles.kpiMiniLabel}>Temp. Ar</Text>
          <Text style={styles.kpiMiniValue}>{formatTemperature(kpis.temperature)}</Text>
        </View>
        <View style={[styles.kpiMini, { borderLeftColor: colors.info }]}>
          <Text style={styles.kpiMiniLabel}>Umid. Ar</Text>
          <Text style={styles.kpiMiniValue}>{formatPercent(kpis.air_humidity)}</Text>
        </View>
        <View style={[styles.kpiMini, { borderLeftColor: colors.danger }]}>
          <Text style={styles.kpiMiniLabel}>Alertas</Text>
          <Text style={styles.kpiMiniValue}>{alertas.length}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={handleIrrigarGeral}>
        <Text style={styles.actionBtnText}>Acionar Irrigacao Manual</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Ultimos Alertas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
            <Text style={styles.cardLink}>Ver Todos</Text>
          </TouchableOpacity>
        </View>

        {alertas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum alerta ativo</Text>
        ) : (
          alertas.map(alerta => (
            <View key={alerta.id} style={styles.alertItem}>
              <View
                style={[
                  styles.alertDot,
                  {
                    backgroundColor:
                      alerta.severity === 'danger'
                        ? colors.danger
                        : alerta.severity === 'warning'
                          ? colors.warning
                          : colors.info,
                  },
                ]}
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {alerta.title}{alerta.talhao ? ` - ${alerta.talhao}` : ''}
                </Text>
                <Text style={styles.alertMsg}>{alerta.message}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardTitle}>Produtividade</Text>
            <Text style={styles.cardSubtitle}>Sacas por hectare (sc/ha)</Text>
          </View>
          <View style={styles.prodAvg}>
            <Text style={styles.prodAvgValue}>{productivity.average || 0}</Text>
            <Text style={styles.prodAvgLabel}>Media</Text>
          </View>
        </View>

        {productivity.fields.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum dado disponivel</Text>
        ) : (
          productivity.fields.map((field, index) => (
            <View key={`${field.name}-${index}`} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressName}>{field.name}</Text>
                <Text style={styles.progressValue}>{field.value}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${field.value}%` }]} />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Estoque UI removido conforme solicitado */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textDark },
  headerIcon: { fontSize: 16, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 13, color: colors.success, fontWeight: '600', marginTop: 4 },
  mainKpiCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 14,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  mainKpiTitle: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  mainKpiValue: { fontSize: 48, fontWeight: '800', color: colors.info, marginVertical: 8 },
  mainKpiDesc: { fontSize: 12, color: colors.textMuted },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  kpiMini: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    elevation: 1,
  },
  kpiMiniLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  kpiMiniValue: { fontSize: 24, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  actionBtn: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 2,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  cardSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  prodAvg: { alignItems: 'flex-end' },
  prodAvgValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  prodAvgLabel: { fontSize: 11, color: colors.textMuted },
  progressItem: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressName: { fontSize: 13, fontWeight: '500', color: colors.textDark },
  progressValue: { fontSize: 13, fontWeight: '600', color: colors.primary },
  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  stockItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stockDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  stockName: { flex: 1, fontSize: 14, color: colors.textDark },
  stockPct: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  addBtn: { fontSize: 22, color: colors.primary, fontWeight: '300' },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  cardLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: 10 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 2 },
  alertMsg: { fontSize: 12, color: colors.textMuted },
});
