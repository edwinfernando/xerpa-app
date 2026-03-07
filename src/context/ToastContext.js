/**
 * ToastContext — Feedback global para acciones del usuario
 *
 * Proporciona showToast(message) para mostrar mensajes breves de confirmación
 * sin bloquear la UI (ej. "¡Meta fijada!" al inscribirse en una carrera).
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ToastContext = createContext({
  showToast: () => {},
});

const TOAST_DURATION = 3000;

/** @param {string | { type?: 'error'|'success'|'info', title?: string, message: string }} payload */
function normalizePayload(payload) {
  if (payload == null) return { type: 'info', title: '', message: '' };
  if (typeof payload === 'string') return { type: 'info', title: '', message: payload };
  return {
    type: payload.type ?? 'info',
    title: payload.title ?? '',
    message: payload.message ?? '',
  };
}

export function ToastContextProvider({ children }) {
  const [payload, setPayload] = useState(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setPayload(normalizePayload(msg));
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || !payload) return;
    const t = setTimeout(() => {
      setVisible(false);
      setPayload(null);
    }, TOAST_DURATION);
    return () => clearTimeout(t);
  }, [visible, payload]);

  const displayText = payload
    ? (payload.title ? `${payload.title}: ${payload.message}`.trim() : payload.message)
    : '';
  const toastStyle = payload?.type === 'error'
    ? [styles.toast, styles.toastError]
    : payload?.type === 'success'
      ? [styles.toast, styles.toastSuccess]
      : styles.toast;
  const textStyle = payload?.type === 'error'
    ? [styles.toastText, styles.toastTextError]
    : payload?.type === 'success'
      ? [styles.toastText, styles.toastTextSuccess]
      : styles.toastText;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.root}>
        {children}
        {visible && displayText ? (
          <View style={styles.toastOverlay} pointerEvents="none">
            <View style={toastStyle}>
              <Text style={textStyle}>{displayText}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  toast: {
    marginHorizontal: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.3)',
    maxWidth: '100%',
  },
  toastError: {
    borderColor: 'rgba(255,82,82,0.5)',
    backgroundColor: '#1A0A0A',
  },
  toastSuccess: {
    borderColor: 'rgba(0,240,255,0.5)',
    backgroundColor: '#0A1A1A',
  },
  toastText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  toastTextError: {
    color: '#ff5252',
  },
  toastTextSuccess: {
    color: '#00F0FF',
  },
});
