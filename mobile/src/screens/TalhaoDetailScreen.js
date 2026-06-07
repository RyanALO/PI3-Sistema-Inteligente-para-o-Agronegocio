import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';

export default function TalhaoDetailScreen({ route, navigation }) {
  const { talhao } = route.params;
  const [irrigando, setIrrigando] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Mock dados do sensor
  const sensorInfo = {
    umidadeSolo: '42%',
    tempAr: '28°C',
    umidadeAr: '60%',
    status: 'Online'
  };

  const handleIrrigar = () => {
    Alert.alert(
      "Acionar Irrigação",
      `Deseja irrigar manualmente o ${talhao.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: () => {
            setLoadingAction(true);
            setTimeout(() => {
              setLoadingAction(false);
              setIrrigando(true);
              Alert.alert('Sucesso', 'Irrigação iniciada com sucesso!');
              setTimeout(() => setIrrigando(false), 5000); // Para de irrigar em 5s (teste)
            }, 1000);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{talhao.nome}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Visão Geral</Text>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Cultura</Text><Text style={styles.value}>{talhao.cultura}</Text></View>
            <View style={styles.col}><Text style={styles.label}>Área</Text><Text style={styles.value}>{talhao.area}</Text></View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Progresso</Text><Text style={styles.value}>{talhao.progresso}%</Text></View>
            <View style={styles.col}><Text style={styles.label}>Status</Text><Text style={[styles.value, {color: talhao.status === 'Crítico' ? colors.danger : colors.textDark}]}>{talhao.status}</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados do Sensor Principal</Text>
          <View style={styles.sensorStatusRow}>
            <View style={[styles.dot, {backgroundColor: colors.success}]} />
            <Text style={styles.statusText}>{sensorInfo.status}</Text>
          </View>

          <View style={styles.readingGrid}>
            <View style={styles.readingItem}>
              <Text style={styles.readingIcon}>💧</Text>
              <Text style={styles.readingValue}>{sensorInfo.umidadeSolo}</Text>
              <Text style={styles.readingLabel}>Umidade Solo</Text>
            </View>
            <View style={styles.readingItem}>
              <Text style={styles.readingIcon}>🌡️</Text>
              <Text style={styles.readingValue}>{sensorInfo.tempAr}</Text>
              <Text style={styles.readingLabel}>Temp. Ar</Text>
            </View>
            <View style={styles.readingItem}>
              <Text style={styles.readingIcon}>☁️</Text>
              <Text style={styles.readingValue}>{sensorInfo.umidadeAr}</Text>
              <Text style={styles.readingLabel}>Umidade Ar</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.btnAction, irrigando && styles.btnActionActive]} 
            onPress={handleIrrigar}
            disabled={loadingAction || irrigando}
          >
            {loadingAction ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnActionIcon}>{irrigando ? '🚿' : '🚱'}</Text>
                <Text style={styles.btnActionText}>
                  {irrigando ? 'Irrigando Agora...' : 'Acionar Irrigação Manual'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { fontSize: 24, color: colors.textDark },
  title: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  content: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 16 },
  row: { flexDirection: 'row', marginBottom: 12 },
  col: { flex: 1 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  sensorStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 13, color: colors.success, fontWeight: '600' },
  readingGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  readingItem: { alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4 },
  readingIcon: { fontSize: 20, marginBottom: 4 },
  readingValue: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 2 },
  readingLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  actionSection: { marginTop: 16 },
  btnAction: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 10 },
  btnActionActive: { backgroundColor: colors.info },
  btnActionIcon: { fontSize: 20 },
  btnActionText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
