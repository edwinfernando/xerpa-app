/**
 * EntrenadorSection — Mi Entrenador / Vinculación (tabla relaciones_usuarios)
 * Nota: El ID de usuario (código) se muestra en UserIdCard.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function EntrenadorSection({
  rol,
  relacionesActivas,
  codigoIngresado,
  onCodigoIngresadoChange,
  onVincularConCodigo,
  vincularLoading,
  vincularError,
  styles,
}) {
  const showVinculacion = rol === 'Atleta';

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mi entrenador / Vinculación</Text>

      {showVinculacion && (
        <View style={styles.codigoInputSection}>
          <Text style={styles.label}>Vincular con Entrenador o Tutor</Text>
          <Input
            value={codigoIngresado}
            onChangeText={onCodigoIngresadoChange}
            placeholder="Ingresa el código de tu entrenador"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!vincularLoading}
            error={!!vincularError}
            errorText={vincularError}
            style={{ marginBottom: 16 }}
          />
          <Button
            title="Enviar solicitud de vinculación"
            variant="primary"
            onPress={onVincularConCodigo}
            loading={vincularLoading}
            disabled={vincularLoading || !codigoIngresado?.trim()}
            style={styles.codigoVincularBtn}
          />
          {relacionesActivas.length > 0 && (
            <Text style={styles.relacionesHint}>
              Vinculado con: {relacionesActivas.map((r) => r.vinculado?.nombre || r.tipo_vinculo).join(', ')}
            </Text>
          )}
        </View>
      )}

      {!showVinculacion && (
        <Text style={styles.emptyText}>Solo visible para atletas.</Text>
      )}
    </View>
  );
}
