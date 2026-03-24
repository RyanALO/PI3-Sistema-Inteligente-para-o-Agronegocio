import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity
} from 'react-native';
import colors from '../theme/colors';
import { getAlertas, resolveAlerta } from '../services/api';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const result = await getAlertas();
      setAlerts(result);
    } catch (err) {
      console.log('Alerts error:', err);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleResolve = async (id) => {
    try {
      await resolveAlerta(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.log('Resolve error:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'danger': return colors.danger;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.textMuted;
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'danger': return '#FFEBEE';
      case 'warning': return '#FFF8E1';
      case 'info': return '#E3F2FD';
      default: return '#F5F5F5';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Alertas</Text>
        <Text style={styles.subtitle}>{alerts.length} alerta{alerts.length !== 1 ? 's' : ''} ativo{alerts.length !== 1 ? 's' : ''}</Text>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>Nenhum alerta ativo</Text>
          <Text style={styles.emptySubtext}>Todos os sistemas operando normalmente</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
            <View style={styles.alertHeader}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityBg(alert.severity) }]}>
                <Text style={styles.severityIcon}>{getSeverityIcon(alert.severity)}</Text>
                <Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity === 'danger' ? 'CRÍTICO' : alert.severity === 'warning' ? 'ATENÇÃO' : 'INFO'}
                </Text>
              </View>
              <Text style={styles.alertTime}>{alert.created_at ? new Date(alert.created_at).toLocaleDateString('pt-BR') : ''}</Text>
            </View>

            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>

            <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(alert.id)}>
              <Text style={styles.resolveText}>✓ Resolver</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.textDark },
  emptySubtext: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  alertCard: {
    backgroundColor: colors.cardWhite, borderRadius: 14, padding: 18,
    marginHorizontal: 20, marginBottom: 12, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  severityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityIcon: { fontSize: 10, marginRight: 4 },
  severityText: { fontSize: 11, fontWeight: '700' },
  alertTime: { fontSize: 12, color: colors.textMuted },
  alertTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark, marginBottom: 4 },
  alertMessage: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  resolveBtn: {
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: '#E8F5E9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  resolveText: { color: colors.success, fontSize: 13, fontWeight: '600' },
});
