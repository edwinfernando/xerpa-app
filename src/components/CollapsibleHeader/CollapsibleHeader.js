/**
 * CollapsibleHeader — Encabezado animado que colapsa al hacer scroll
 *
 * - Header grande: título + subtítulo
 * - Header compacto: título pequeño centrado + acción opcional (ej. botón +)
 * - Fondo con color sólido y sombra para separar del contenido
 * - useNativeDriver compatible para opacidad/transform
 */
import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

const NEON_ACCENT = '#00D2FF';
const GREY_SUBTLE = '#8E8E93';

export function CollapsibleHeader({
  bigTitle,
  bigSubtitle,
  bigTitleRow1,
  bigTitleRow2,
  bigSubtitlePrefix,
  bigSubtitleAccent,
  bigSubtitleNeon,
  editorialLabel,
  editorialTitle,
  smallTitle,
  rightAction,
  interpolations,
  insets,
}) {
  const { headerHeight, bigTitleOpacity, smallTitleOpacity } = interpolations;
  const useDashboardLayout = !!bigTitleRow1;
  const useEditorialLayout = !!editorialLabel;

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: insets.top,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Fondo: color sólido con sombra para que el contenido debajo no confunda */}
      <View style={[StyleSheet.absoluteFill, styles.background]} />

      {/* Contenido del header */}
      <View style={styles.content}>
        {/* Título grande + subtítulo (fade out al hacer scroll) */}
        <Animated.View
          style={[styles.bigTitleWrap, { opacity: bigTitleOpacity }]}
          pointerEvents="none"
        >
          {useDashboardLayout ? (
            <>
              {bigTitleRow1 ? (
                <Text style={styles.bigTitleRow1} numberOfLines={1}>
                  {bigTitleRow1}
                </Text>
              ) : null}
              {bigTitleRow2 ? (
                <Text style={styles.bigTitleRow2} numberOfLines={1}>
                  {bigTitleRow2}
                </Text>
              ) : null}
              {bigSubtitleNeon ? (
                <Text style={styles.bigSubtitleNeon} numberOfLines={2}>
                  {bigSubtitleNeon}
                </Text>
              ) : (bigSubtitlePrefix || bigSubtitleAccent) ? (
                <Text style={styles.bigSubtitleRow3} numberOfLines={1}>
                  {bigSubtitlePrefix}
                  {bigSubtitleAccent ? (
                    <Text style={styles.bigSubtitleAccent}>{bigSubtitleAccent}</Text>
                  ) : null}
                </Text>
              ) : null}
            </>
          ) : useEditorialLayout ? (
            <>
              {editorialLabel ? (
                <Text style={styles.editorialLabel} numberOfLines={1}>
                  {editorialLabel}
                </Text>
              ) : null}
              {editorialTitle ? (
                <Text style={styles.editorialTitle} numberOfLines={1}>
                  {editorialTitle}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.bigTitle} numberOfLines={2}>
                {bigTitle}
              </Text>
              {bigSubtitle ? (
                <Text style={styles.bigSubtitle} numberOfLines={1}>
                  {bigSubtitle}
                </Text>
              ) : null}
            </>
          )}
        </Animated.View>

        {/* Título pequeño en barra compacta (fade in) */}
        <Animated.View
          style={[styles.smallTitleWrap, { opacity: smallTitleOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.smallTitle} numberOfLines={1}>
            {smallTitle}
          </Text>
        </Animated.View>

        {/* Acción derecha (ej. botón +) — fija en el header */}
        {rightAction ? (
          <View style={styles.rightAction} pointerEvents="box-none">
            {rightAction}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  background: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  bigTitleWrap: {
    position: 'absolute',
    bottom: 16,
    left: theme.spacing.screenPadding,
    right: 125, // espacio para AnimatedActionButton (cápsula ~110px + padding)
  },
  bigTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  bigSubtitle: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 1,
  },
  bigTitleRow1: {
    color: GREY_SUBTLE,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  bigTitleRow2: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  bigSubtitleRow3: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  bigSubtitleAccent: {
    color: NEON_ACCENT,
    fontWeight: '600',
  },
  bigSubtitleNeon: {
    color: NEON_ACCENT,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 18,
    marginTop: 6,
    alignSelf: 'stretch',
  },
  editorialLabel: {
    color: GREY_SUBTLE,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  editorialTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  smallTitleWrap: {
    position: 'absolute',
    bottom: 16,
    left: theme.spacing.screenPadding,
    right: 125,
    justifyContent: 'center',
  },
  smallTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rightAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 16,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
