/**
 * AnimatedSplashScreen - Splash screen con logo Xerpa y fondo cinematográfico
 *
 * - Fondo negro con gradiente azul profundo irradiando desde el logo
 * - Logo logo.png (X con gradiente cyan/amarillo, fondo transparente)
 * - Glow radial multicapa detrás del logo
 * - Texto "XERPA" como componente con letra espaciada
 * - Barrido brillante + fade in/out
 */

import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIXEL = PixelRatio.roundToNearestPixel;

const LOGO_SIZE = PIXEL(SCREEN_WIDTH * 0.38);
const SHINE_BAND_WIDTH = 140;

export function AnimatedSplashScreen({ onReady, onFinish }) {
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.88);
  const containerOpacity = useSharedValue(1);
  const shineTranslate = useSharedValue(-SCREEN_WIDTH - SHINE_BAND_WIDTH);

  useEffect(() => {
    const readyId = requestAnimationFrame(() => {
      onReady?.();
    });
    return () => cancelAnimationFrame(readyId);
  }, [onReady]);

  useEffect(() => {
    // 1. Entrada suave (0–600ms)
    contentOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    contentScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Primer barrido brillante (500–1200ms)
    const shineTimer1 = setTimeout(() => {
      shineTranslate.value = withTiming(SCREEN_WIDTH + SHINE_BAND_WIDTH, {
        duration: 700,
        easing: Easing.inOut(Easing.ease),
      });
    }, 500);

    // 3. Segundo barrido (1500–2100ms)
    const shineTimer2 = setTimeout(() => {
      shineTranslate.value = -SCREEN_WIDTH - SHINE_BAND_WIDTH;
      shineTranslate.value = withTiming(SCREEN_WIDTH + SHINE_BAND_WIDTH, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1500);

    // 4. Fade out (2300–2700ms)
    const fadeOutTimer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: 400 },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        }
      );
    }, 2300);

    return () => {
      clearTimeout(shineTimer1);
      clearTimeout(shineTimer2);
      clearTimeout(fadeOutTimer);
    };
  }, [onFinish]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const shineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineTranslate.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]} pointerEvents="box-none">
      <StatusBar style="light" />

      {/* Fondo: gradiente vertical premium (very dark navy → dark blue mid → pure black) */}
      <LinearGradient
        colors={['#0A1628', '#0D1B2A', '#000000']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow radial externo: halo azul difuso en el área del logo */}
      <View style={styles.glowOuter} pointerEvents="none" />

      {/* Glow radial medio */}
      <View style={styles.glowMid} pointerEvents="none" />

      {/* Glow radial interno: concentrado sobre el logo */}
      <View style={styles.glowInner} pointerEvents="none" />

      {/* Contenido: logo + texto, desplazado ligeramente arriba del centro */}
      <View style={styles.centerContent}>
        <Animated.View style={[styles.contentWrap, contentAnimatedStyle]}>

          {/* Halo luminoso detrás del logo */}
          <View style={styles.logoHalo} />

          {/* Logo X (fondo transparente) */}
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Nombre de marca */}
          <Text style={styles.brandName}>XERPA</Text>

        </Animated.View>
      </View>

      {/* Barrido brillante sobre todo el contenido */}
      <Animated.View style={[styles.shineOverlay, shineAnimatedStyle]} pointerEvents="none">
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.03)',
            'rgba(0, 220, 255, 0.20)',
            'rgba(180, 255, 80, 0.16)',
            'rgba(255, 255, 255, 0.08)',
            'rgba(255, 255, 255, 0.02)',
            'transparent',
          ]}
          locations={[0, 0.22, 0.44, 0.5, 0.58, 0.78, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shineGradient}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  // --- Capas de glow radial ---
  glowOuter: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.08,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_HEIGHT * 0.52,
    backgroundColor: 'rgba(8, 55, 140, 0.18)',
    borderRadius: SCREEN_WIDTH,
  },
  glowMid: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.14,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.36,
    backgroundColor: 'rgba(12, 75, 180, 0.15)',
    borderRadius: SCREEN_WIDTH,
  },
  glowInner: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.2,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.22,
    backgroundColor: 'rgba(15, 100, 220, 0.13)',
    borderRadius: SCREEN_WIDTH,
  },

  // --- Contenido central ---
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -SCREEN_HEIGHT * 0.06,
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Halo luminoso directo detrás del logo
  logoHalo: {
    position: 'absolute',
    width: LOGO_SIZE * 2,
    height: LOGO_SIZE * 2,
    borderRadius: LOGO_SIZE,
    backgroundColor: 'rgba(0, 160, 255, 0.11)',
    alignSelf: 'center',
  },

  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  brandName: {
    marginTop: 22,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center',
  },

  // --- Barrido brillante ---
  shineOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SHINE_BAND_WIDTH,
  },
  shineGradient: {
    width: SHINE_BAND_WIDTH,
    height: '100%',
  },
});
