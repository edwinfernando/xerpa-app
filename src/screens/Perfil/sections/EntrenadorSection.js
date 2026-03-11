/**
 * EntrenadorSection — Mi Entrenador / Mi Tutor
 * Vinculación por código con preview (nombre + rol), desvinculación.
 * Separación clara: Entrenadores y Tutores.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { theme } from '../../../theme/theme';

function VinculacionRow({ relacion, onDesvincular, styles }) {
  const nombre = relacion.vinculado?.nombre || 'Sin nombre';
  const esPendiente = relacion.estado === 'Pendiente';
  const tipoLabel = relacion.tipo_vinculo === 'Entrenador' ? 'Entrenador' : 'Tutor';

  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <View style={rowStyles.avatar}>
          <Text style={rowStyles.avatarText}>
            {nombre.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View>
          <Text style={rowStyles.nombre}>{nombre}</Text>
          <Text style={[rowStyles.estado, esPendiente && rowStyles.estadoPendiente]}>
            {esPendiente ? 'Pendiente de aceptar' : 'Vinculado'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={rowStyles.dotsBtn}
        onPress={() => onDesvincular(relacion)}
      >
        <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.colors.textQuaternary} />
      </TouchableOpacity>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,240,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  nombre: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  estado: { color: theme.colors.secondary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  estadoPendiente: { color: theme.colors.warning },
  dotsBtn: { padding: 8 },
});

export function EntrenadorSection({
  rol,
  relacionesEntrenadores,
  relacionesTutores,
  codigoIngresado,
  onCodigoIngresadoChange,
  onCodigoInputFocus,
  onBuscarCodigo,
  previewVinculado,
  buscarLoading,
  onClosePreview,
  onConfirmVinculacion,
  vincularLoading,
  vincularError,
  relacionToDesvincular,
  onDesvincular,
  onCloseDesvincularModal,
  onConfirmDesvincular,
  desvincularLoading,
  styles,
}) {
  const showVinculacion = rol === 'Atleta';
  const hasVinculaciones = relacionesEntrenadores.length > 0 || relacionesTutores.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mi entrenador / Tutor</Text>

      {showVinculacion && (
        <>
          {/* Entrenadores */}
          <Text style={styles.sheetLabel}>Entrenador</Text>
          {relacionesEntrenadores.length === 0 ? (
            <Text style={styles.emptyText}>No tienes entrenador vinculado.</Text>
          ) : (
            relacionesEntrenadores.map((r) => (
              <VinculacionRow key={r.id} relacion={r} onDesvincular={onDesvincular} styles={styles} />
            ))
          )}

          {/* Tutores */}
          <Text style={[styles.sheetLabel, { marginTop: 16 }]}>Tutor</Text>
          {relacionesTutores.length === 0 ? (
            <Text style={styles.emptyText}>No tienes tutor vinculado.</Text>
          ) : (
            relacionesTutores.map((r) => (
              <VinculacionRow key={r.id} relacion={r} onDesvincular={onDesvincular} styles={styles} />
            ))
          )}

          {/* Vincular por código */}
          <Text style={[styles.sheetLabel, { marginTop: 20 }]}>Vincular con código</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Input
              value={codigoIngresado}
              onChangeText={onCodigoIngresadoChange}
              onFocus={onCodigoInputFocus}
              placeholder="Código del entrenador o tutor"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!buscarLoading && !vincularLoading}
              error={!!vincularError}
              errorText={vincularError}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button
              title={previewVinculado ? 'Vincular' : 'Buscar'}
              variant="solid"
              onPress={previewVinculado ? onConfirmVinculacion : onBuscarCodigo}
              loading={buscarLoading || vincularLoading}
              disabled={buscarLoading || vincularLoading || !codigoIngresado?.trim()}
              style={{ minWidth: 100 }}
            />
          </View>
        </>
      )}

      {!showVinculacion && (
        <Text style={styles.emptyText}>Solo visible para atletas.</Text>
      )}
    </View>
  );
}

