import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme';
import CircularGauge from '../components/CircularGauge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState({
    fieldHealth: 0,
    temperature: 0,
    moisture: 0,
    nitrogen: 0,
    ph: 0,
    solar: 0,
    irrigationStatus: 'Inativa',
    weeklyWater: [0, 0, 0],
    lastSync: 'carregando...',
  });

  const fetchSensors = async () => {
    try {
      const response = await api.get('/sensores');
      const sensorData = response.data.data;

      setData({
        fieldHealth: Math.round((sensorData.umidadeSolo / 100) * 100),
        temperature: sensorData.temperatura,
        moisture: sensorData.umidadeSolo,
        nitrogen: sensorData.nitrogenio,
        ph: sensorData.ph,
        solar: sensorData.solar,
        irrigationStatus: 'Inativa',
        weeklyWater: [1200, 850, 1050],
        lastSync: new Date().toLocaleTimeString(),
      });

    } catch (error) {
      console.error('Erro ao buscar sensores:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados dos sensores');
    }
  };

  useEffect(() => {
    fetchSensors();

    const interval = setInterval(fetchSensors, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualIrrigation = async () => {
    try {
      const response = await api.post('/irrigacao/acionar', { durationMinutes: 30 });

      Alert.alert('Sucesso', response.data.message);

      setData((prev) => ({
        ...prev,
        irrigationStatus: 'Ativa',
      }));

    } catch (error) {
      Alert.alert('Erro', 'Falha ao acionar irrigação');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSensors();
    setRefreshing(false);
  };

  const maxWater = Math.max(...data.weeklyWater);
  const barWidth = 45;
  const barSpacing = 55;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >

      {/* HEADER */}
      <View style={{
        backgroundColor: theme.colors.primary,
        padding: 20,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View>
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
            AgriBusiness
          </Text>
          <Text style={{ color: '#FFF', fontSize: 14, opacity: 0.8 }}>
            Olá, {user?.name?.split(' ')[0] || 'Agricultor'} 👋
          </Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="person-circle" size={48} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* FIELD HEALTH */}
      <View style={{ padding: 20 }}>
        <View style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          elevation: 4
        }}>
          <Text style={{ fontSize: 14, color: theme.colors.textLight, marginBottom: 8 }}>
            CURRENT FIELD HEALTH
          </Text>

          <CircularGauge
            percentage={data.fieldHealth}
            label="Saúde da plantação"
            color="#006400"
          />
        </View>
      </View>

      {/* TEMPERATURA */}
      <View style={{ paddingHorizontal: 20, marginTop: -10 }}>
        <View style={{
          backgroundColor: '#006400',
          borderRadius: 16,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontSize: 14 }}>
              AMBIENT TEMP
            </Text>
            <Text style={{ color: '#FFF', fontSize: 42, fontWeight: 'bold' }}>
              {data.temperature}°C
            </Text>
          </View>

          <Ionicons name="thermometer" size={80} color="#FFF" />
        </View>
      </View>

      {/* SOIL ANALYTICS */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Soil Analytics
        </Text>

        <Text style={{ fontSize: 13, color: theme.colors.textLight, marginBottom: 16 }}>
          Última sincronização {data.lastSync}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>

          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: '48%' }}>
            <Ionicons name="water" size={28} color="#006400" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
              {data.moisture}%
            </Text>
            <Text style={{ color: theme.colors.textLight }}>
              Moisture
            </Text>
          </View>

          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: '48%' }}>
            <Ionicons name="leaf" size={28} color="#006400" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
              {data.nitrogen}
            </Text>
            <Text style={{ color: theme.colors.textLight }}>
              Nitrogênio
            </Text>
          </View>

          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: '48%' }}>
            <Ionicons name="flask" size={28} color="#006400" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
              {data.ph}
            </Text>
            <Text style={{ color: theme.colors.textLight }}>
              pH
            </Text>
          </View>

          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: '48%' }}>
            <Ionicons name="sunny" size={28} color="#F59E0B" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>
              {data.solar}
            </Text>
            <Text style={{ color: theme.colors.textLight }}>
              W/m²
            </Text>
          </View>

        </View>
      </View>

      {/* WEEKLY WATER */}
      <View style={{ padding: 20, paddingTop: 0 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Weekly Water Use
        </Text>

        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20 }}>
          <Svg height="200" width="100%">

            {data.weeklyWater.map((value, index) => {
              const height = (value / maxWater) * 140;
              const x = index * barSpacing + 20;

              return (
                <>
                  <Rect
                    key={index}
                    x={x}
                    y={160 - height}
                    width={barWidth}
                    height={height}
                    fill="#006400"
                    rx="8"
                  />

                  <SvgText
                    x={x + barWidth / 2}
                    y="185"
                    fontSize="13"
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {['Seg', 'Ter', 'Qua'][index]}
                  </SvgText>

                  <SvgText
                    x={x + barWidth / 2}
                    y={150 - height}
                    fontSize="14"
                    fill="#006400"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value}
                  </SvgText>
                </>
              );
            })}

          </Svg>
        </View>
      </View>

      {/* IRRIGAÇÃO */}
      <View style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={handleManualIrrigation}
          style={{
            backgroundColor: theme.colors.secondary,
            padding: 18,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >

          <Ionicons name="water" size={24} color="#FFF" />

          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
            Acionar Irrigação Manual
          </Text>

        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

export default DashboardScreen;