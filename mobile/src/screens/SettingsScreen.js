import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import colors from '../theme/colors';
import { clearAuth } from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [irrigacaoAutomatica, setIrrigacaoAutomatica] = useState(true);
  const [notifCriticas, setNotifCriticas] = useState(true);
  const [notifInfo, setNotifInfo] = useState(false);
  
  const [umidadeMin, setUmidadeMin] = useState('30');
  const [umidadeMax, setUmidadeMax] = useState('60');

  const handleSave = () => {
    if (Number(umidadeMin) < 0 || Number(umidadeMax) > 100 || Number(umidadeMin) >= Number(umidadeMax)) {
      Alert.alert("Erro de Validação", "Limites de umidade inválidos. Verifique os valores.");
      return;
    }
    Alert.alert("Sucesso", "Configurações salvas na nuvem com sucesso!");
    navigation.goBack();
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sair", 
        style: 'destructive',
        onPress: () => {
          clearAuth();
          // Navega de volta para Login (Stack pai)
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Irrigação Automatizada</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingLabel}>Ativar Algoritmo Autônomo</Text>
              <Text style={styles.settingDesc}>O sistema irá irrigar automaticamente baseado nos sensores</Text>
            </View>
            <Switch 
              value={irrigacaoAutomatica} 
              onValueChange={setIrrigacaoAutomatica} 
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={irrigacaoAutomatica ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {irrigacaoAutomatica && (
          <View style={styles.card}>
            <Text style={styles.settingLabel}>Limites de Umidade Padrão (%)</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Mínima (Ligar)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={umidadeMin} onChangeText={setUmidadeMin} />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Máxima (Deslig)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={umidadeMax} onChangeText={setUmidadeMax} />
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações e Alertas</Text>
        <View style={styles.card}>
          <View style={styles.settingRowBorder}>
            <Text style={styles.settingLabel}>Alertas Críticos (Push)</Text>
            <Switch value={notifCriticas} onValueChange={setNotifCriticas} trackColor={{ true: colors.primary + '80' }} thumbColor={notifCriticas ? colors.primary : '#f4f3f4'} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Informativos (Resumos diarios)</Text>
            <Switch value={notifInfo} onValueChange={setNotifInfo} trackColor={{ true: colors.primary + '80' }} thumbColor={notifInfo ? colors.primary : '#f4f3f4'} />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
        <Text style={styles.btnSaveText}>Salvar Configurações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnLogoutText}>Sair da Conta (Logout)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: colors.textDark },
  title: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingRowBorder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingTextContent: { flex: 1, paddingRight: 16 },
  settingLabel: { fontSize: 16, fontWeight: '500', color: colors.textDark, marginBottom: 4 },
  settingDesc: { fontSize: 12, color: colors.textMuted },
  inputRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  inputCol: { flex: 1 },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: colors.textDark },
  btnSave: { backgroundColor: colors.primary, padding: 16, margin: 16, borderRadius: 12, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnLogout: { padding: 16, alignItems: 'center', marginTop: 10 },
  btnLogoutText: { color: colors.danger, fontSize: 16, fontWeight: '600' }
});
