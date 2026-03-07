/**
 * Input genérico global XERPA
 * Mismo estilo en toda la app. Resalta el campo cuando está enfocado.
 *
 * @param {string} value - Valor actual
 * @param {function} onChangeText - Handler de cambio
 * @param {string} placeholder - Placeholder
 * @param {boolean} error - Muestra estilo de error (borde rojo)
 * @param {boolean} secureTextEntry - Campo contraseña
 * @param {boolean} multiline - Textarea
 * @param {number} numberOfLines - Líneas para multiline
 * @param {number} maxLength - Límite de caracteres
 * @param {ReactNode} rightAccessory - Contenido a la derecha (ej. botón ojo)
 * @param {object} style - Estilos adicionales para el wrapper
 * @param {object} inputStyle - Estilos adicionales para el TextInput
 */
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  InputAccessoryView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { theme } from '../../theme/theme';

const NUMERIC_KEYBOARD_TYPES = ['numeric', 'number-pad', 'decimal-pad', 'numbers-and-punctuation'];

const PLACEHOLDER_COLOR = '#888888';

export function Input({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = PLACEHOLDER_COLOR,
  error = false,
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  rightAccessory,
  style,
  inputStyle,
  errorText,
  label,
  containerStyle,
  // Props passthrough
  keyboardType,
  autoCapitalize,
  autoCorrect,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  // Variantes de layout
  variant = 'default', // default | inline | embedded | glass (premium sheets)
  // Cuando true, no se aplica borde de foco en el Input (el padre lo maneja)
  hideFocusBorder = false,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const accessoryId = useRef(`numericDone-${Date.now()}-${Math.random().toString(36).slice(2)}`).current;
  const isNumericKeyboard = Platform.OS === 'ios' && NUMERIC_KEYBOARD_TYPES.includes(keyboardType);
  const inputAccessoryViewID = isNumericKeyboard ? accessoryId : undefined;

  const inputStyles = [
    styles.input,
    variant === 'inline' && styles.inputInline,
    variant === 'glass' && styles.inputGlass,
    multiline && styles.inputMultiline,
    rightAccessory && styles.inputWithAccessory,
  ];

  const inputRowStyles = [
    styles.wrapper,
    variant === 'embedded' && styles.wrapperEmbedded,
    variant === 'glass' && styles.wrapperGlass,
    rightAccessory && styles.wrapperRow,
    focused && !hideFocusBorder && styles.wrapperFocused,
    error && styles.wrapperError,
  ];

  const inner = (
    <>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        underlineColorAndroid="transparent"
        enableFocusRing={false}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        onFocus={() => { setFocused(true); onFocusProp?.(); }}
        onBlur={() => { setFocused(false); onBlurProp?.(); }}
        style={[inputStyles, inputStyle]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        textAlignVertical={multiline ? 'top' : 'center'}
        inputAccessoryViewID={inputAccessoryViewID}
        {...rest}
      />
      {isNumericKeyboard && (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={accessoryStyles.bar}>
            <TouchableOpacity
              onPress={() => Keyboard.dismiss()}
              style={accessoryStyles.btn}
              activeOpacity={0.7}
            >
              <Text style={accessoryStyles.btnText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </>
  );

  return (
    <View style={[styles.outer, containerStyle, style]}>
      {label ? (
        <Text style={[styles.label, variant === 'glass' && styles.labelGlass]}>{label}</Text>
      ) : null}
      <View style={inputRowStyles}>
        {inner}
        {rightAccessory}
      </View>
      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {},
  label: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '600',
  },
  labelGlass: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  wrapper: {
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 0,
    overflow: 'hidden',
    height: theme.INPUT_HEIGHT,
  },
  wrapperEmbedded: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  wrapperGlass: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    height: undefined,
    minHeight: 50,
  },
  wrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrapperFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  wrapperError: {
    borderColor: theme.colors.danger,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.INPUT_FONT_SIZE_MIN,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  inputGlass: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  inputInline: {
    paddingVertical: 14,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputWithAccessory: {
    paddingRight: 8,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});

const accessoryStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  btnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
