/**
 * Botón genérico global XERPA
 * Solo etiqueta (sin iconos ni emojis por criterio UX).
 *
 * Variantes: primary | secondary | danger | ghost | link | social | solid
 * Tamaños: default | compact
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/theme';

const GRADIENT_COLORS = ['#00F0FF', '#39FF14'];
const GRADIENT_DANGER = ['#ff5252', '#ff6b6b'];

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
  socialType = 'google',
}) {
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'solid'
              ? theme.colors.textOnPrimary
              : variant === 'danger'
              ? '#fff'
              : theme.colors.primary
          }
          size="small"
        />
      ) : children ? (
        children
      ) : (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[
            styles.text,
            size === 'compact' && styles.textCompact,
            (variant === 'primary' || variant === 'solid') && styles.textPrimary,
            variant === 'secondary' && styles.textSecondary,
            variant === 'danger' && styles.textDanger,
            variant === 'ghost' && styles.textGhost,
            variant === 'link' && styles.textLink,
            variant === 'social' && socialType === 'google' && styles.textSocialGoogle,
            variant === 'social' && socialType === 'apple' && styles.textSocialApple,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </View>
  );

  // Solid: estilo empty state (#00D2FF, texto negro)
  if (variant === 'solid') {
    return (
      <TouchableOpacity
        style={[
          styles.base,
          size === 'compact' && styles.baseCompact,
          styles.solid,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Primary: gradient CTA
  if (variant === 'primary') {
    return (
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.base,
          size === 'compact' && styles.baseCompact,
          styles.primary,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          disabled={isDisabled}
          activeOpacity={0.9}
        >
          {renderContent()}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Danger: red CTA
  if (variant === 'danger') {
    return (
      <TouchableOpacity
        style={[
          styles.base,
          size === 'compact' && styles.baseCompact,
          styles.danger,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Secondary / Cancel: outline
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[
          styles.base,
          size === 'compact' && styles.baseCompact,
          styles.secondary,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Ghost: texto sin fondo
  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        style={[
          styles.base,
          size === 'compact' && styles.baseCompact,
          styles.ghost,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Link: estilo enlace
  if (variant === 'link') {
    return (
      <TouchableOpacity
        style={[
          styles.base,
          styles.link,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Social
  const socialStyle =
    socialType === 'apple' ? styles.socialApple : styles.socialGoogle;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === 'compact' && styles.baseCompact,
        styles.social,
        socialStyle,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.BUTTON_HEIGHT,
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  baseCompact: {
    minHeight: theme.TOUCH_TARGET_MIN,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
  },
  touchable: {
    flex: 1,
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
  textCompact: {
    fontSize: 14,
    fontWeight: '700',
  },
  solid: {
    backgroundColor: '#00D2FF',
    borderRadius: 16,
  },
  primary: {
    overflow: 'hidden',
    borderRadius: 14,
  },
  textPrimary: {
    color: theme.colors.textOnPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textSecondary: {
    color: theme.colors.text,
  },
  danger: {
    backgroundColor: 'rgba(255,82,82,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  textDanger: {
    color: theme.colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    minHeight: theme.TOUCH_TARGET_MIN,
  },
  textGhost: {
    color: theme.colors.primary,
  },
  link: {
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.25)',
    minHeight: theme.TOUCH_TARGET_MIN,
  },
  textLink: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  social: {
    borderWidth: 1,
  },
  socialGoogle: {
    backgroundColor: theme.colors.surfaceInput,
    borderColor: theme.colors.border,
  },
  socialApple: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  textSocialGoogle: {
    color: theme.colors.text,
  },
  textSocialApple: {
    color: theme.colors.textOnPrimary,
  },
  disabled: {
    opacity: 0.6,
  },
});
