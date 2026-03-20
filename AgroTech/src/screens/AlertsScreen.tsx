// src/screens/AlertsScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const AlertsScreen = () => {
  const [alerts] = useState([
    {
      id: 1,
      type: 'CRITICAL',
      title: 'Critical Water Shortage',
      subtitle: 'Irrigation pump in Sector B7 has failed',
      time: '2 hours ago',
      priority: 'HIGH',
      icon: 'water',
      color: theme.colors.alert,
      bg: '#FEE2E2',
    },
    {
      id: 2,
      type: 'INFO',
      title: 'Weather Advisory',
      subtitle: 'Automated irrigation cycles scheduled for next 4 hours',
      time: '5 hours ago',
      priority: 'INFO',
      icon: 'cloudy',
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      id: 3,
      type: 'MAINTENANCE',
      title: 'Device Maintenance',
      subtitle: 'Utility valve Unit 3 will exceed 10%...',
      time: 'Yesterday',
      priority: 'STANDARD',
      icon: 'construct',
      color: '#10B981',
      bg: '#F0FDF4',
    },
    {
      id: 4,
      type: 'CRITICAL',
      title: 'Storage Temperature Breach',
      subtitle: 'Cold storage unit 5 has exceeded 8°C',
      time: '14 hours ago',
      priority: 'HIGH',
      icon: 'thermometer',
      color: theme.colors.alert,
      bg: '#FEE2E2',
    },
  ]);

  const handleReviewLogs = () => {
    Alert.alert('Logs', 'Abrindo logs completos... (em breve integrado com API)');
  };

  const handleExportReport = () => {
    Alert.alert('Exportar', 'Relatório PDF gerado e enviado por e-mail!');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={{ backgroundColor: theme.colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Central de Alertas</Text>
        <Text style={{ color: '#FFF', opacity: 0.8, marginTop: 4 }}>Real-time field updates and system status</Text>
      </View>

      {/* FILTER TABS */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 12, marginHorizontal: 20, borderRadius: 12, marginTop: -10 }}>
        <View style={{ backgroundColor: theme.colors.success, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 }}>
          <Text style={{ color: '#FFF', fontWeight: '600' }}>All</Text>
        </View>
        <Text style={{ marginLeft: 16, color: theme.colors.textLight, paddingVertical: 6 }}>Critical</Text>
        <Text style={{ marginLeft: 16, color: theme.colors.textLight, paddingVertical: 6 }}>Info</Text>
        <Text style={{ marginLeft: 16, color: theme.colors.textLight, paddingVertical: 6 }}>Maintenance</Text>
      </View>

      {/* ALERTS LIST */}
      <View style={{ padding: 20 }}>
        {alerts.map((alert) => (
          <View
            key={alert.id}
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderLeftWidth: 6,
              borderLeftColor: alert.color,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ backgroundColor: alert.bg, padding: 8, borderRadius: 999 }}>
                <Ionicons name={alert.icon as any} size={22} color={alert.color} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{alert.title}</Text>
                <Text style={{ color: theme.colors.textLight, fontSize: 13 }}>{alert.subtitle}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: theme.colors.textLight }}>{alert.time}</Text>
                <Text style={{ fontSize: 10, backgroundColor: alert.color, color: '#FFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginTop: 4 }}>
                  {alert.priority}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* SYSTEM STATUS CARD */}
      <View style={{ margin: 20, backgroundColor: '#0A3D2F', borderRadius: 20, padding: 20 }}>
        <Text style={{ color: '#FFF', fontSize: 14, opacity: 0.8 }}>SYSTEM STATUS</Text>
        <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 4 }}>
          All sensors are currently synchronizing with the central hub.
        </Text>

        <View style={{ height: 160, backgroundColor: '#14532D', borderRadius: 16, marginTop: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          {/* Simulação de hub brilhando */}
          <View style={{ width: 100, height: 100, backgroundColor: '#4ADE80', borderRadius: 999, opacity: 0.3 }} />
          <Ionicons name="pulse" size={80} color="#FFF" style={{ position: 'absolute' }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity
            onPress={handleReviewLogs}
            style={{ flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Review Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportReport}
            style={{ flex: 1, backgroundColor: '#006400', padding: 16, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Export Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FOOTER INFO */}
      <Text style={{ textAlign: 'center', color: theme.colors.textLight, marginBottom: 30, fontSize: 12 }}>
        Última sincronização: agora • 12 sensores online
      </Text>
    </ScrollView>
  );
};

export default AlertsScreen;