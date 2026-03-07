/**
 * AnimatedSplashScreen - Pantalla de entrada dinámica
 *
 * - Degradado oscuro (azul profundo → negro)
 * - Logo: escala 0.5→1.2→1.0 con spring
 * - Efecto shimmer + pulso suave
 * - Texto "XERPA" con letter-spacing animado
 * - Duración total: 2.5 segundos
 * - Fade out hacia Login/Dashboard
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tamaño del logo: nítido en todas las densidades (iPhone Pro, Android)
const LOGO_SIZE = Math.round(PixelRatio.roundToNearestPixel(SCREEN_WIDTH * 0.35));

const springConfig = {
  damping: 12,
  stiffness: 100,
};

export function AnimatedSplashScreen({ onReady, onFinish }) {
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const letterSpacing = useSharedValue(0);
  const shimmerTranslate = useSharedValue(-1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Cuando el primer frame está listo, ocultar splash nativo
    const readyId = requestAnimationFrame(() => {
      onReady?.();
    });
    return () => cancelAnimationFrame(readyId);
  }, [onReady]);

  useEffect(() => {
    // 1. Entrada del logo (0–600ms): scale 0.5→1.2, opacity 0→1
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withTiming(1.2, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // 2. Rebote spring a 1.0 (400–900ms)
    const bounceTimer = setTimeout(() => {
      logoScale.value = withSpring(1, springConfig);
    }, 400);

    // 3. Shimmer: brillo que recorre (600–1500ms)
    const shimmerTimer = setTimeout(() => {
      shimmerTranslate.value = withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      });
    }, 600);

    // 4. Pulso suave detrás del icono (loop sutil)
    const pulseTimer = setTimeout(() => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinito hasta fade out
        true // reversa para ciclo suave
      );
    }, 500);

    // 5. Texto XERPA con letter-spacing (1000–1600ms)
    const textTimer = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 400 });
      letterSpacing.value = withTiming(8, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    }, 1000);

    // 6. Fade out (2200–2500ms)
    const fadeOutTimer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: 300 },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        }
      );
    }, 2200);

    return () => {
      clearTimeout(bounceTimer);
      clearTimeout(shimmerTimer);
      clearTimeout(pulseTimer);
      clearTimeout(textTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [onFinish]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    letterSpacing: letterSpacing.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: shimmerTranslate.value * (SCREEN_WIDTH + LOGO_SIZE),
      },
    ],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]} pointerEvents="box-none">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0A1628', '#0D1B2A', '#000000']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.centerContent}>
        {/* Contenedor del logo con pulso y shimmer */}
        <View style={[styles.logoWrapper, { width: LOGO_SIZE * 1.5, height: LOGO_SIZE * 1.5 }]}>
          {/* Capa de pulso suave detrás del logo */}
          <Animated.View style={[styles.pulseLayer, pulseAnimatedStyle]}>
            <View style={[styles.pulseGlow, { width: LOGO_SIZE * 1.4, height: LOGO_SIZE * 1.4, borderRadius: LOGO_SIZE * 0.7 }]} />
          </Animated.View>

          {/* Shimmer: brillo que recorre */}
          <Animated.View style={[styles.shimmerTrack, shimmerAnimatedStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 240, 255, 0.15)',
                'rgba(0, 240, 255, 0.35)',
                'rgba(0, 240, 255, 0.15)',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.brandText, textAnimatedStyle]}>
          XERPA
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseGlow: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  shimmerTrack: {
    position: 'absolute',
    width: 80,
    height: LOGO_SIZE * 1.4,
    left: -40,
    top: -LOGO_SIZE * 0.2,
  },
  shimmerGradient: {
    flex: 1,
    width: 80,
    borderRadius: 4,
  },
  brandText: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0,
  },
});
