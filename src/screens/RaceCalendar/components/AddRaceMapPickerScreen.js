import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Location from 'expo-location';
import { Button } from '../../../components/ui/Button';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const DEFAULT_REGION = {
  latitude: 6.2442,
  longitude: -75.5812,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function AddRaceMapPickerScreen({ navigation, route }) {
  let MapViewComponent = null;
  let MarkerComponent = null;
  if (!isExpoGo) {
    try {
      const mapsModule = require('react-native-maps');
      MapViewComponent = mapsModule?.default ?? null;
      MarkerComponent = mapsModule?.Marker ?? null;
    } catch {
      MapViewComponent = null;
      MarkerComponent = null;
    }
  }

  const initialLat = toNumberOrNull(route?.params?.latitud);
  const initialLon = toNumberOrNull(route?.params?.longitud);
  const initialRegion = useMemo(() => {
    if (initialLat == null || initialLon == null) return DEFAULT_REGION;
    return {
      latitude: initialLat,
      longitude: initialLon,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [initialLat, initialLon]);

  const [region, setRegion] = useState(initialRegion);
  const [selectedPoint, setSelectedPoint] = useState(
    initialLat != null && initialLon != null
      ? { latitude: initialLat, longitude: initialLon }
      : null
  );
  const [resolvingAddress, setResolvingAddress] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function initCurrentLocation() {
      if (selectedPoint) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled || status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const point = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setSelectedPoint(point);
        setRegion((prev) => ({
          ...prev,
          latitude: point.latitude,
          longitude: point.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }));
      } catch {
        // fallback silencioso a región default
      }
    }
    initCurrentLocation();
    return () => {
      cancelled = true;
    };
  }, [selectedPoint]);

  function handleMapPress(e) {
    const coords = e?.nativeEvent?.coordinate;
    if (!coords) return;
    setSelectedPoint({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  async function handleConfirm() {
    if (!selectedPoint) return;
    setResolvingAddress(true);
    let addressPayload = null;
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: selectedPoint.latitude,
        longitude: selectedPoint.longitude,
      });
      if (address) {
        addressPayload = {
          city: address.city || address.subregion || null,
          country: address.country || null,
          district: address.district || null,
          street: address.street || null,
          name: address.name || null,
          region: address.region || null,
        };
      }
    } catch {
      // El guardado de coordenadas sigue aunque falle geocoding.
    } finally {
      setResolvingAddress(false);
    }
    navigation.navigate({
      name: 'AddRace',
      params: {
        pickedLocation: {
          latitud: selectedPoint.latitude,
          longitud: selectedPoint.longitude,
          address: addressPayload,
        },
      },
      merge: true,
    });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {MapViewComponent ? (
        <MapViewComponent
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
        >
          {selectedPoint && MarkerComponent ? (
            <MarkerComponent
              coordinate={selectedPoint}
              draggable
              onDragEnd={(e) => {
                const c = e?.nativeEvent?.coordinate;
                if (!c) return;
                setSelectedPoint({ latitude: c.latitude, longitude: c.longitude });
              }}
            />
          ) : null}
        </MapViewComponent>
      ) : (
        <View style={styles.noMapWrap}>
          <Text style={styles.noMapTitle}>Mapa no disponible en este build</Text>
          <Text style={styles.noMapText}>
            {isExpoGo
              ? 'El mapa requiere un development build (expo run:ios/android). En Expo Go no está disponible.'
              : 'Instala/reconstruye la app nativa para habilitar react-native-maps.'}
          </Text>
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.hint}>Toca el mapa o arrastra el pin para elegir ubicación</Text>
        <Text style={styles.coords}>
          {selectedPoint
            ? `${selectedPoint.latitude.toFixed(6)}, ${selectedPoint.longitude.toFixed(6)}`
            : 'Sin ubicación seleccionada'}
        </Text>
        <TouchableOpacity
          style={styles.secondary}
          activeOpacity={0.85}
          onPress={() => {
            navigation.navigate({
              name: 'AddRace',
              params: { pickedLocation: { clear: true } },
              merge: true,
            });
            navigation.goBack();
          }}
        >
          <Text style={styles.secondaryText}>Limpiar ubicación</Text>
        </TouchableOpacity>
        <Button
          title="Usar esta ubicación"
          onPress={handleConfirm}
          disabled={!selectedPoint || resolvingAddress || !MapViewComponent}
          loading={resolvingAddress}
          style={styles.primaryBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: 'rgba(18,18,18,0.94)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 14,
  },
  hint: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  coords: { color: '#9CA3AF', fontSize: 12, marginBottom: 10 },
  secondary: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.35)',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  secondaryText: { color: '#00D2FF', fontSize: 13, fontWeight: '700' },
  primaryBtn: { borderRadius: 10, overflow: 'hidden' },
  noMapWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  noMapTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  noMapText: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
});

