// src/screens/FarmProfileScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const FarmProfileScreen = () => {
  const fields = [
    { id: 1, name: 'North Plateau', crop: 'Wheat', stage: '450ha • Planting Stage', status: 'HEALTHY' },
    { id: 2, name: 'South Creek', crop: 'Corn', stage: '320ha • Irrigation Active', status: 'HEALTHY' },
    { id: 3, name: 'East Slope', crop: 'Soybeans', stage: '180ha • Soil Moisture Low', status: 'ALERT' },
  ];

  const team = [
    { initial: 'JS', name: 'James Stewart', role: 'Farm Manager' },
    { initial: 'AL', name: 'Anna Lopez', role: 'Agronomist' },
    { initial: 'RK', name: 'Robert King', role: 'Operations' },
  ];

  const getStatusColor = (status: string) => {
    return status === 'HEALTHY' ? theme.colors.success : theme.colors.alert;
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={{ backgroundColor: theme.colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="leaf" size={24} color={theme.colors.primary} />
          </View>
          <Text style={{ marginLeft: 12, fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>AgriBusiness</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="search" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* FARM CARD */}
      <View style={{ padding: 20, marginTop: -10 }}>
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 4 }}>
          {/* Logo da Fazenda */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 90, height: 90, backgroundColor: '#0A3D2F', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>FARM</Text>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>FARM</Text>
            </View>
          </View>

          <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>Green Valley Reserve</Text>
          <Text style={{ color: theme.colors.textLight, textAlign: 'center', marginTop: 4 }}>Premium Estate</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="location" size={20} color={theme.colors.textLight} />
              <Text style={{ fontSize: 13, color: theme.colors.textLight }}>Central Valley, California</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="leaf" size={20} color={theme.colors.textLight} />
              <Text style={{ fontSize: 13, color: theme.colors.textLight }}>1.260 Total Hectares</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ACTIVE FIELDS */}
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Active Fields</Text>
          <TouchableOpacity>
            <Text style={{ color: theme.colors.secondary, fontWeight: '600' }}>View All</Text>
          </TouchableOpacity>
        </View>

        {fields.map((field) => (
          <View
            key={field.id}
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{ width: 48, height: 48, backgroundColor: '#F1F5F0', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
              {field.crop === 'Wheat' && <Ionicons name="leaf" size={28} color="#006400" />}
              {field.crop === 'Corn' && <Ionicons name="water" size={28} color="#006400" />}
              {field.crop === 'Soybeans' && <Ionicons name="flame" size={28} color="#006400" />}
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: '600' }}>{field.name}</Text>
              <Text style={{ color: theme.colors.textLight }}>{field.crop}</Text>
              <Text style={{ color: theme.colors.textLight, fontSize: 13 }}>{field.stage}</Text>
            </View>

            <View
              style={{
                backgroundColor: getStatusColor(field.status),
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>{field.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FARM TEAM */}
      <View style={{ padding: 20, paddingTop: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Farm Team</Text>
          <Ionicons name="people" size={24} color={theme.colors.textLight} />
        </View>

        {team.map((member, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                backgroundColor: '#0A3D2F',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{member.initial}</Text>
            </View>

            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '600' }}>{member.name}</Text>
              <Text style={{ color: theme.colors.textLight }}>{member.role}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={theme.colors.textLight} />
          </View>
        ))}
      </View>

      {/* MAP VIEW */}
      <View style={{ padding: 20, paddingTop: 0 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>MAP VIEW</Text>
        <View
          style={{
            backgroundColor: '#0A3D2F',
            height: 220,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Mapa simulada (você pode substituir por <Image> depois) */}
          <View style={{ width: '90%', height: '80%', backgroundColor: '#14532D', borderRadius: 12, position: 'relative' }}>
            {/* Simulando campos */}
            <View style={{ position: 'absolute', top: '20%', left: '15%', width: 60, height: 40, backgroundColor: '#4ADE80', opacity: 0.6, borderRadius: 6 }} />
            <View style={{ position: 'absolute', top: '35%', right: '25%', width: 80, height: 50, backgroundColor: '#4ADE80', opacity: 0.6, borderRadius: 6 }} />
            <View style={{ position: 'absolute', bottom: '30%', left: '30%', width: 50, height: 35, backgroundColor: '#F59E0B', opacity: 0.5, borderRadius: 6 }} />
            
            <Text style={{ position: 'absolute', bottom: 16, left: 16, color: '#FFF', fontSize: 15, fontWeight: 'bold' }}>
              MAP VIEW
            </Text>
          </View>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 8, color: theme.colors.textLight, fontSize: 12 }}>
          Toque para ver mapa interativo (próximo passo)
        </Text>
      </View>
    </ScrollView>
  );
};

export default FarmProfileScreen;