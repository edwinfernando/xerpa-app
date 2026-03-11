/**
 * useCollapsibleHeader — Hook para encabezados colapsables basados en scroll
 *
 * Proporciona Animated.Value (scrollY) e interpolaciones para:
 * - Altura del header (Max → Min)
 * - Opacidad título grande (1 → 0)
 * - Opacidad título pequeño (0 → 1)
 *
 * Opciones:
 * - compact: true → HEADER_CONTENT_MAX = 110px (Plan, RaceCalendar, Perfil)
 * - compact: false → HEADER_CONTENT_MAX = 140px (Dashboard)
 * Extrapolate.CLAMP evita glitches al rebote: scrollY < 0 mantiene header fijo en MAX.
 */
import { useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HEADER_CONTENT_MAX = 140;
export const HEADER_CONTENT_MAX_COMPACT = 110;
export const HEADER_CONTENT_MIN = 60;

export function useCollapsibleHeader(options = {}) {
  const { compact = false, hideOnScroll = false } = options;
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const contentMax = compact ? HEADER_CONTENT_MAX_COMPACT : HEADER_CONTENT_MAX;
  const SCROLL_RANGE = hideOnScroll
    ? contentMax * 5
    : contentMax - HEADER_CONTENT_MIN;
  const HEADER_MAX_HEIGHT = insets.top + contentMax;
  const HEADER_MIN_HEIGHT = hideOnScroll ? 0 : insets.top + HEADER_CONTENT_MIN;

  const interpolations = useMemo(() => {
    // diffClamp: scrollY < 0 → 0 (header fijo en MAX, sin estirar); scrollY > SCROLL_RANGE → SCROLL_RANGE
    const clampedScrollY = Animated.diffClamp(scrollY, 0, SCROLL_RANGE);

    const clampOpt = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

    return {
      headerHeight: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        ...clampOpt,
      }),

      bigTitleOpacity: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.6],
        outputRange: [1, 0],
        ...clampOpt,
      }),

      smallTitleOpacity: clampedScrollY.interpolate({
        inputRange: [SCROLL_RANGE * 0.4, SCROLL_RANGE],
        outputRange: [0, 1],
        ...clampOpt,
      }),

      // Para Perfil: avatar size (60 → 36) y borderRadius (30 → 18)
      avatarSize: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [60, 36],
        ...clampOpt,
      }),

      avatarBorderRadius: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [30, 18],
        ...clampOpt,
      }),

      // Para Perfil: avatar opacity en header compacto (0 → 1)
      compactAvatarOpacity: clampedScrollY.interpolate({
        inputRange: [SCROLL_RANGE * 0.5, SCROLL_RANGE],
        outputRange: [0, 1],
        ...clampOpt,
      }),

      // ActionTrigger: escala y posición vertical sincronizada con el scroll
      actionScale: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [1, 0.85],
        ...clampOpt,
      }),
      actionTranslateY: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [0, 8],
        ...clampOpt,
      }),

      // AnimatedActionButton (cápsula neón): morfismo al colapsar
      labelOpacity: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.5],
        outputRange: [1, 0],
        ...clampOpt,
      }),
      labelWidth: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.5],
        outputRange: [55, 0],
        ...clampOpt,
      }),
      labelGap: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.5],
        outputRange: [6, 0],
        ...clampOpt,
      }),
      // Cápsula → círculo: ancho 110→32, padding 12→6, borderRadius 20→16
      capsuleWidth: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.5],
        outputRange: [110, 32],
        ...clampOpt,
      }),
      capsulePaddingH: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.5],
        outputRange: [12, 6],
        ...clampOpt,
      }),
      capsuleBorderRadius: clampedScrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.5],
        outputRange: [20, 16],
        ...clampOpt,
      }),
    };
  }, [insets.top, HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT, SCROLL_RANGE, scrollY]);

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return {
    scrollY,
    scrollHandler,
    insets,
    HEADER_MAX_HEIGHT,
    HEADER_MIN_HEIGHT,
    interpolations,
  };
}
