/**
 * IntervalsConnectSheet — BottomSheet de vinculación con Intervals.icu
 * Diseño Dark/Neón con glassmorphism y guía de usuario integrada (UX fricción cero).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
  LayoutAnimation,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { ExternalLink } from 'lucide-react-native';
import { Input } from '../../../components/ui/Input';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../../constants/sheetModalConfig';

const INTERVALS_SETTINGS_URL = 'https://intervals.icu/settings';

function IntervalsConnectSheet({
  visible,
  onClose,
  idExterno,
  setIdExterno,
  apiKeyIntervalos,
  setApiKeyIntervalos,
  error,
  isSaving,
  onSave,
}) {
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const { scrollOffsetY } = useModalSwipeScroll(110, visible);
  const insets = useSafeAreaInsets();

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordionExpanded((v) => !v);
  };

  const handleOpenSettings = () => {
    Linking.openURL(INTERVALS_SETTINGS_URL).catch(() => {});
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={[getSheetModalStyle()]}
      {...getSheetModalProps()}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 34) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Vincular Intervals.icu</Text>
          <Text style={styles.subtitle}>
            Ingresa tu ID de atleta y API Key para sincronizar datos.
          </Text>

          {/* Botón de enlace rápido */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            <ExternalLink color="#00D2FF" size={16} />
            <Text style={styles.linkButtonText}>Abrir configuración de Intervals.icu</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Inputs con estilo glassmorphism */}
            <Text style={styles.label}>ID de atleta (Athlete ID)</Text>
          <Input
            value={idExterno}
            onChangeText={setIdExterno}
            placeholder="Ej: 12345"
            placeholderTextColor="#8E8E93"
            keyboardType="numeric"
            autoCapitalize="none"
            variant="glass"
            focusBorderColor="#00D2FF"
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            style={{ marginBottom: 16 }}
          />

          <Text style={styles.label}>API Key</Text>
          <Input
            value={apiKeyIntervalos}
            onChangeText={setApiKeyIntervalos}
            placeholder="Tu API Key de Intervals.icu"
            placeholderTextColor="#8E8E93"
            secureTextEntry
            autoCapitalize="none"
            variant="glass"
            focusBorderColor="#00D2FF"
            error={!!error}
            errorText={error}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            style={{ marginBottom: 16 }}
          />

          {/* Acordeón de ayuda */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={toggleAccordion}
            activeOpacity={0.8}
          >
            <Text style={styles.accordionHeaderText}>¿Dónde encuentro mis credenciales?</Text>
            <Ionicons
              name={accordionExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8E8E93"
            />
          </TouchableOpacity>

          {accordionExpanded && (
            <View style={styles.accordionContent}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  En la web de Intervals, asegúrate de estar en la pestaña{' '}
                  <Text style={styles.stepTextHighlight}>AJUSTES</Text> y haz scroll casi hasta el final de la página.
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Busca el título en azul que dice{' '}
                  <Text style={styles.stepTextHighlight}>Configuración de desarrollador</Text>.
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Copia el <Text style={styles.stepTextHighlight}>ID del atleta</Text> (es un texto corto que empieza con la letra 'i', por ejemplo: i123456) y pégalo en el primer campo.
                </Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Al lado derecho, debajo de Clave API, toca la palabra <Text style={styles.stepTextHighlight}>(view)</Text>. Se abrirá una ventana emergente; copia el código largo de color azul y pégalo en el segundo campo.
                </Text>
              </View>
            </View>
          )}
          </View>

          {/* Sticky footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#121212" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar Credenciales</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: '#00D2FF',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  content: {
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputText: {
    color: '#fff',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
  },
  accordionHeaderText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  accordionContent: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 210, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  stepTextHighlight: {
    color: '#00D2FF',
    fontWeight: '700',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 0,
  },
  saveButton: {
    backgroundColor: '#00D2FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { IntervalsConnectSheet };
