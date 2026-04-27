import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';

const MOCK_TALHOES = [
  { id: 1, nome: 'Talhão Norte', area: '10 ha', cultura: 'Soja', status: 'Atenção', progresso: 40 },
  { id: 2, nome: 'Talhão Sul', area: '15 ha', cultura: 'Milho', status: 'Saudável', progresso: 65 },
  { id: 3, nome: 'Talhão Leste', area: '8 ha', cultura: 'Café', status: 'Crítico', progresso: 80 },
];

export default function TalhoesScreen({ navigation }) {
  const [talhoes, setTalhoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    // Simulando API
    setTimeout(() => {
      setTalhoes(MOCK_TALHOES);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Saudável': return colors.success;
      case 'Atenção': return colors.warning;
      case 'Crítico': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const filtered = talhoes.filter(t => filtro === 'Todos' || t.status === filtro);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Talhões</Text>
      </View>

      <View style={styles.filterRow}>
        {['Todos', 'Saudável', 'Atenção', 'Crítico'].map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterBtn, filtro === f && styles.filterBtnActive]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filterText, filtro === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('TalhaoDetail', { talhao: item })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardInfo}>{item.cultura} • {item.area}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progresso da Safra</Text>
                <Text style={styles.progressLabel}>{item.progresso}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progresso}%` }]} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum talhão encontrado.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textDark },
  filterRow: { flexDirection: 'row', padding: 16, gap: 8 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.border },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textDark, fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingTop: 0 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardInfo: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  progressContainer: { marginTop: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { color: colors.textMuted }
});
