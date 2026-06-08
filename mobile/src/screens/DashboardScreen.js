import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import colors from '../theme/colors';
import { getDashboardSummary } from '../services/api';
import ModalAddEstoque from '../components/modals/ModalAddEstoque';
import ModalEditEstoque from '../components/modals/ModalEditEstoque';
import { getDashboardSummary, getAlertas } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Hoje');
  const [isModalAddEstoqueVisible, setIsModalAddEstoqueVisible] = useState(false);
  const [isModalEditEstoqueVisible, setIsModalEditEstoqueVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [estoqueList, setEstoqueList] = useState([]);
  const [fazendaId] = useState(1); // Would come from context in real app

  const loadData = useCallback(async () => {
    try {
      const result = await getDashboardSummary(timeFilter);
      setData(result);

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
  }, [timeFilter]);

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

  const handleAddEstoqueSuccess = (newItem) => {
    console.log('Item adicionado:', newItem);
    setEstoqueList([...estoqueList, newItem]);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalEditEstoqueVisible(true);
  };

  const handleEditEstoqueSuccess = (updatedItem) => {
    console.log('Item atualizado:', updatedItem);
    const updated = estoqueList.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setEstoqueList(updated);
    setIsModalEditEstoqueVisible(false);
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
          <TouchableOpacity onPress={() => setIsModalAddEstoqueVisible(true)}>
            <Text style={styles.addBtn}>+</Text>
          </TouchableOpacity>
        </View>
        {stock.items && stock.items.length > 0 ? (
          stock.items.map((item, i) => {
            const itemColors = [colors.success, colors.info, colors.accentOrange];
            return (
              <TouchableOpacity
                key={i}
                style={styles.stockItem}
                onPress={() => handleEditItem(item)}
              >
                <View style={[styles.stockDot, { backgroundColor: itemColors[i] }]} />
                <Text style={styles.stockName}>{item.name}</Text>
                <Text style={styles.stockPct}>{item.percentage}%</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Nenhum item no estoque</Text>
        )}
      </View>

      {/* Modals */}
      <ModalAddEstoque
        isVisible={isModalAddEstoqueVisible}
        fazenda_id={fazendaId}
        onClose={() => setIsModalAddEstoqueVisible(false)}
        onSuccess={handleAddEstoqueSuccess}
      />

      {editingItem && (
        <ModalEditEstoque
          isVisible={isModalEditEstoqueVisible}
          itemId={editingItem.id}
          item={editingItem}
          onClose={() => setIsModalEditEstoqueVisible(false)}
          onSuccess={handleEditEstoqueSuccess}
        />
      )}
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
  addBtn: { fontSize: 22, color: colors.primary, fontWeight: '300' },
  emptyText: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic', marginVertical: 10 },
  cardLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  alertItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  alertDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: 10 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 2 },
  alertMsg: { fontSize: 12, color: colors.textMuted }
});
