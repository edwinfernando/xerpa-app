/**
 * EntrenadorPreviewSheet — Bottom Sheet con perfil extendido del entrenador/tutor
 * al buscar por código: imagen, profesión, club, descripción, logros, es atleta, calificación.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Star } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../../constants/sheetModalConfig';
import { theme } from '../../../theme/theme';

const SWIPE_HEADER_HEIGHT = 120;

export function EntrenadorPreviewSheet({
  visible,
  onClose,
  preview,
  onConfirm,
  loading,
  error,
}) {
  const { scrollViewRef, scrollOffsetY, propagateSwipe, onScroll } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);
  const insets = useSafeAreaInsets();

  if (!preview) return null;

  const { nombre, rol, avatar_url, perfil } = preview;
  const p = perfil || {};
  const logros = Array.isArray(p.logros) ? p.logros : [];
  const calificacion = p.calificacion_promedio != null ? Number(p.calificacion_promedio) : null;
  const totalValoraciones = p.total_valoraciones != null ? p.total_valoraciones : 0;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={propagateSwipe}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={[getSheetModalStyle()]}
      {...getSheetModalProps()}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 34) }]}>
        <View style={styles.handle} />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar + nombre + rol */}
          <View style={styles.header}>
            {avatar_url ? (
              <Image source={{ uri: avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{nombre.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
            <Text style={styles.nombre}>{nombre}</Text>
            <Text style={styles.rol}>{rol === 'Entrenador' ? 'Entrenador' : 'Tutor'}</Text>
          </View>

          {/* Profesión */}
          {p.profesion ? (
            <View style={styles.row}>
              <MaterialCommunityIcons name="certificate-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.label}>Profesión</Text>
              <Text style={styles.value}>{p.profesion}</Text>
            </View>
          ) : null}

          {/* Club */}
          {p.club ? (
            <View style={styles.row}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.label}>Club</Text>
              <Text style={styles.value}>{p.club}</Text>
            </View>
          ) : null}

          {/* Calificación */}
          {calificacion != null && calificacion > 0 ? (
            <View style={styles.row}>
              <Star size={18} color="#FFB800" fill="#FFB800" />
              <Text style={styles.label}>Calificación</Text>
              <Text style={styles.value}>
                {calificacion.toFixed(1)} {totalValoraciones > 0 && `(${totalValoraciones} valoraciones)`}
              </Text>
            </View>
          ) : null}

          {/* Es también atleta */}
          {p.es_tambien_atleta ? (
            <View style={styles.badge}>
              <MaterialCommunityIcons name="run" size={16} color={theme.colors.secondary} />
              <Text style={styles.badgeText}>También compite como atleta</Text>
            </View>
          ) : null}

          {/* Descripción */}
          {p.descripcion ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Descripción</Text>
              <Text style={styles.descripcion}>{p.descripcion}</Text>
            </View>
          ) : null}

          {/* Logros */}
          {logros.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Logros</Text>
              {logros.map((item, idx) => (
                <View key={idx} style={styles.logroRow}>
                  <View style={styles.logroBullet} />
                  <Text style={styles.logroTexto}>
                    {item.titulo || item.descripcion}
                    {item.anio ? ` (${item.anio})` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {!p.profesion && !p.club && !p.descripcion && logros.length === 0 && calificacion == null && !p.es_tambien_atleta ? (
            <Text style={styles.sinDatos}>Este perfil aún no tiene información adicional.</Text>
          ) : null}
        </ScrollView>

        {/* Error */}
        {error ? (
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={loading}
            style={styles.cancelBtn}
          />
          <Button
            title="Vincular"
            variant="solid"
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            style={styles.confirmBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { margin: 0, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollContent: { paddingBottom: 16 },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,240,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  nombre: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  rol: {
    color: theme.colors.textQuaternary,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    color: theme.colors.textQuaternary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(57,255,20,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  block: {
    marginBottom: 16,
  },
  blockLabel: {
    color: theme.colors.textQuaternary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descripcion: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  logroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  logroBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 7,
  },
  logroTexto: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  sinDatos: {
    color: theme.colors.textQuaternary,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  cancelBtn: { flex: 1 },
  confirmBtn: { flex: 1 },
});
