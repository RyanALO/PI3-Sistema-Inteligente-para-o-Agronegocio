import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image
} from 'react-native';
import colors from '../theme/colors';
import { getAuth, clearAuth } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user } = getAuth();

  const handleLogout = () => {
    clearAuth();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AT';

  const farmStats = [
    { icon: '📏', label: 'ÁREA TOTAL', value: '1,250 ha' },
    { icon: '📍', label: 'LOCAL', value: 'Goiás, BR' },
    { icon: '🌾', label: 'CULTIVO', value: 'Soja/Milho' },
  ];

  const talhoes = [
    { name: 'Talhão Norte A1', crop: 'Soja', area: '450 ha', status: 'Saudável', statusColor: colors.success },
    { name: 'Talhão Leste B2', crop: 'Milho', area: '320 ha', status: 'Atenção', statusColor: colors.warning },
  ];

  const team = ['Carlos M.', 'Ana P.', 'Roberto'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.farmName}>{user?.farm_name || 'Fazenda AgroTech'}</Text>
        <Text style={styles.certification}>🏅 AgroSmart Tech Certified</Text>

        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>✏️ Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Stats */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Visão Geral</Text>
          <Text style={styles.updatedText}>Atualizado hoje</Text>
        </View>
        <View style={styles.statsRow}>
          {farmStats.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Talhões */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Talhões Ativos</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {talhoes.map((t, i) => (
          <View key={i} style={styles.talhaoItem}>
            <View style={styles.talhaoIcon}>
              <Text style={styles.talhaoEmoji}>🌿</Text>
            </View>
            <View style={styles.talhaoInfo}>
              <Text style={styles.talhaoName}>{t.name}</Text>
              <Text style={styles.talhaoMeta}>{t.crop} • {t.area}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: t.statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: t.statusColor }]}>{t.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Team */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Equipe</Text>
          <TouchableOpacity>
            <Text style={styles.addBtn}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.teamRow}>
          {team.map((name, i) => (
            <View key={i} style={styles.teamMember}>
              <View style={[styles.teamAvatar, { backgroundColor: [colors.primary, colors.accentTeal, colors.accentOrange][i] }]}>
                <Text style={styles.teamAvatarText}>{name[0]}</Text>
              </View>
              <Text style={styles.teamName}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sair da conta</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileHeader: {
    alignItems: 'center', paddingTop: 20, paddingBottom: 24,
    backgroundColor: colors.cardWhite,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  farmName: { fontSize: 22, fontWeight: '700', color: colors.textDark },
  certification: { fontSize: 13, color: colors.accentTeal, marginTop: 4 },
  editBtn: {
    marginTop: 14, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 20, paddingHorizontal: 24, paddingVertical: 8,
  },
  editBtnText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  card: {
    backgroundColor: colors.cardWhite, borderRadius: 14, padding: 18,
    marginHorizontal: 20, marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textDark },
  updatedText: { fontSize: 12, color: colors.textMuted },
  seeAll: { fontSize: 13, color: colors.accentTeal, fontWeight: '500' },
  addBtn: { fontSize: 22, color: colors.primary, fontWeight: '300' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.5 },
  statValue: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginTop: 2 },
  talhaoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  talhaoIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#E8F5E9',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  talhaoEmoji: { fontSize: 20 },
  talhaoInfo: { flex: 1 },
  talhaoName: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  talhaoMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  teamRow: { flexDirection: 'row', gap: 20 },
  teamMember: { alignItems: 'center' },
  teamAvatar: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  teamAvatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  teamName: { fontSize: 12, color: colors.textDark, marginTop: 6, fontWeight: '500' },
  logoutBtn: {
    marginHorizontal: 20, marginTop: 20,
    backgroundColor: '#FFEBEE', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
