import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import colors from '../theme/colors';
import { getDashboardSummary, getAlertas } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sum, alrts] = await Promise.all([
        getDashboardSummary(),
        getAlertas()
      ]);
      setData(sum);
      setAlertas(alrts.slice(0, 3)); // Pega só os 3 alertas mais recentes
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

  const handleIrrigarGeral = () => {
    Alert.alert('Acionamento Manual', 'Deseja iniciar a irrigação na zona principal agora?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar', onPress: () => Alert.alert('Sucesso', 'Irrigação iniciada!') }
    ]);
  };

  const kpis = data?.kpis || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Monitoramento</Text>
          <Text style={styles.headerIcon}>📱</Text>
        </View>
        <Text style={styles.subtitle}>Tempo Real</Text>
      </View>

      {/* Primary KPI - Umidade do Solo em Destaque */}
      <View style={styles.mainKpiCard}>
        <Text style={styles.mainKpiTitle}>Umidade do Solo</Text>
        <Text style={styles.mainKpiValue}>{kpis.soil_moisture || '--'}%</Text>
        <Text style={styles.mainKpiDesc}>Média atual dos sensores ativos ({kpis.active_devices || 0}/{kpis.total_devices || 0})</Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiMini, { borderLeftColor: colors.accentOrange }]}>
          <Text style={styles.kpiMiniLabel}>Temp. Ar</Text>
          <Text style={styles.kpiMiniValue}>{kpis.temperature || '--'}°</Text>
        </View>
        <View style={[styles.kpiMini, { borderLeftColor: colors.danger, marginLeft: 12 }]}>
          <Text style={styles.kpiMiniLabel}>Alertas</Text>
          <Text style={styles.kpiMiniValue}>{kpis.active_alerts || 0}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={handleIrrigarGeral}>
        <Text style={styles.actionBtnIcon}>🚿</Text>
        <Text style={styles.actionBtnText}>Acionar Irrigação Manual</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⚠️ Últimos Alertas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
            <Text style={styles.cardLink}>Ver Todos</Text>
          </TouchableOpacity>
        </View>
        
        {alertas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum alerta ativo 😃</Text>
        ) : (
          alertas.map(a => (
            <View key={a.id} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: a.severity === 'danger' ? colors.danger : a.severity === 'warning' ? colors.warning : colors.info }]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{a.title} - {a.talhao}</Text>
                <Text style={styles.alertMsg}>{a.message}</Text>
              </View>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textDark },
  headerIcon: { fontSize: 24 },
  subtitle: { fontSize: 13, color: colors.success, fontWeight: '600', marginTop: 4 },
  mainKpiCard: { 
    backgroundColor: colors.cardWhite, borderRadius: 14, padding: 24, marginHorizontal: 20,
    marginTop: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: colors.primary + '30'
  },
  mainKpiTitle: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  mainKpiValue: { fontSize: 48, fontWeight: '800', color: colors.info, marginVertical: 8 },
  mainKpiDesc: { fontSize: 12, color: colors.textMuted },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 12 },
  kpiMini: {
    flex: 1, backgroundColor: colors.cardWhite, borderRadius: 12, padding: 16,
    borderLeftWidth: 3, elevation: 1
  },
  kpiMiniLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  kpiMiniValue: { fontSize: 24, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  actionBtn: { 
    backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 16, borderRadius: 12, marginHorizontal: 20, marginTop: 20, gap: 10, elevation: 2 
  },
  actionBtnIcon: { fontSize: 22 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: colors.cardWhite, borderRadius: 14, padding: 16, marginHorizontal: 20,
    marginTop: 20, marginBottom: 40, elevation: 1
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  cardLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  alertItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  alertDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: 10 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 2 },
  alertMsg: { fontSize: 12, color: colors.textMuted }
});
