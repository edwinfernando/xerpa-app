import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

function formatFecha(fechaStr) {
  if (!fechaStr) return '—';
  const d = new Date(fechaStr);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return d.toLocaleDateString('es-ES', options);
}

function formatDuracion(duracionMin) {
  if (duracionMin == null || duracionMin === 0) return null;
  const h = Math.floor(duracionMin / 60);
  const m = duracionMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function PlanView({ loading, dias, styles }) {
  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00F0FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Próximos 7 días</Text>

        {dias.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No hay entrenamientos planificados para esta semana.
            </Text>
          </View>
        ) : (
          dias.map((item) => (
            <View key={item.id || item.fecha} style={styles.listItem}>
              <Text style={styles.listItemDate}>{formatFecha(item.fecha)}</Text>
              <Text style={styles.listItemTitulo}>
                {item.titulo || 'Entrenamiento'}
              </Text>
              {(formatDuracion(item.duracion_min) || item.tipo) && (
                <Text style={styles.listItemDetalle}>
                  {formatDuracion(item.duracion_min) && `Duración: ${formatDuracion(item.duracion_min)}`}
                  {formatDuracion(item.duracion_min) && item.tipo && ' • '}
                  {item.tipo && `${item.tipo}`}
                  {item.tss_plan ? ` • TSS: ${item.tss_plan}` : ''}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
