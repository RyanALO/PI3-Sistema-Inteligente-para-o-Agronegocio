import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const [fazenda] = useState({
    nome: 'Fazenda Santa Helena',
    area: '450 ha',
    localizacao: 'Rio Verde - GO',
    culturas: 'Soja, Milho, Café',
    certificacao: '✔️ Orgânica',
    membros: [
      { id: 1, nome: 'Você', iniciais: 'GS' },
      { id: 2, nome: 'João', iniciais: 'JS' },
      { id: 3, nome: 'Maria', iniciais: 'MO' },
    ]
  });

  const handleAddMember = () => {
    Alert.alert('Novo Membro', 'Fluxo para convidar novo membro iniciado.');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cover & Avatar */}
        <View style={styles.coverPhoto}>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🌾</Text>
          </View>
          <Text style={styles.farmName}>{fazenda.nome}</Text>
          <Text style={styles.farmCert}>{fazenda.certificacao}</Text>
          
          <TouchableOpacity style={styles.btnEdit} onPress={() => Alert.alert('Aviso', 'Fluxo de edição em breve.')}>
            <Text style={styles.btnEditText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Visão Geral */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visão Geral da Propriedade</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Área Total:</Text>
            <Text style={styles.value}>{fazenda.area}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Localização:</Text>
            <Text style={styles.value}>{fazenda.localizacao}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Culturas:</Text>
            <Text style={styles.value}>{fazenda.culturas}</Text>
          </View>
        </View>

        {/* Talhões Link */}
        <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('Talhoes')}>
          <View style={styles.cardBtnContent}>
             <Text style={styles.cardBtnEmoji}>🌱</Text>
             <View>
               <Text style={styles.cardBtnTitle}>Meus Talhões</Text>
               <Text style={styles.cardBtnSub}>Gerencie os campos e dados</Text>
             </View>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        {/* Equipe */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Equipe Vinculada</Text>
          </View>
          
          <View style={styles.teamRow}>
            {fazenda.membros.map(m => (
              <View key={m.id} style={styles.teamMember}>
                <View style={[styles.memberAvatar, m.nome === 'Você' && styles.memberAvatarMe]}>
                  <Text style={[styles.memberInitials, m.nome === 'Você' && {color: '#fff'}]}>{m.iniciais}</Text>
                </View>
                <Text style={styles.memberName}>{m.nome}</Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.teamMember} onPress={handleAddMember}>
              <View style={styles.memberAvatarAdd}>
                <Text style={styles.memberInitialsAdd}>+</Text>
              </View>
              <Text style={styles.memberNameAdd}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  coverPhoto: { height: 120, backgroundColor: colors.primaryLight },
  settingsBtn: { position: 'absolute', top: 30, right: 16, width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  settingsIcon: { fontSize: 20, color: '#fff' },
  profileHeader: { alignItems: 'center', marginTop: -40, marginBottom: 20, paddingHorizontal: 16 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', elevation: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary },
  avatarEmoji: { fontSize: 40 },
  farmName: { fontSize: 20, fontWeight: '700', color: colors.textDark, marginTop: 8 },
  farmCert: { fontSize: 13, color: colors.success, fontWeight: '600', marginTop: 4 },
  btnEdit: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.primary, borderRadius: 20 },
  btnEditText: { color: colors.primary, fontWeight: '600' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.textMuted },
  value: { color: colors.textDark, fontWeight: '600' },
  cardBtn: { backgroundColor: '#fff', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardBtnTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  cardBtnSub: { fontSize: 12, color: colors.textMuted },
  cardBtnEmoji: { fontSize: 24 },
  arrowIcon: { fontSize: 20, color: colors.textMuted },
  teamRow: { flexDirection: 'row', gap: 16 },
  teamMember: { alignItems: 'center', width: 60 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  memberAvatarMe: { backgroundColor: colors.primary },
  memberInitials: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  memberName: { fontSize: 11, color: colors.textDark },
  memberAvatarAdd: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f0f0', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.textMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  memberInitialsAdd: { fontSize: 20, color: colors.textMuted },
  memberNameAdd: { fontSize: 11, color: colors.textMuted }
});
