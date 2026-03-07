import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

function clampProgress(progress) {
  const n = Number(progress);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function LinearProgress({
  progress = 0,
  color = '#00F0FF',
  height = 8,
  trackColor = 'rgba(255,255,255,0.1)',
  showLabel = false,
}) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const clampedProgress = clampProgress(progress);

  useEffect(() => {
    if (!trackWidth) return;
    const target = (trackWidth * clampedProgress) / 100;
    Animated.timing(animatedWidth, {
      toValue: target,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, clampedProgress, trackWidth]);

  const trackStyle = useMemo(
    () => [
      styles.track,
      {
        height,
        backgroundColor: trackColor,
        borderRadius: height / 2,
      },
    ],
    [height, trackColor]
  );

  const fillStyle = useMemo(
    () => [
      styles.fill,
      {
        width: animatedWidth,
        backgroundColor: color,
        borderRadius: height / 2,
        shadowColor: color,
      },
    ],
    [animatedWidth, color, height]
  );

  return (
    <View style={styles.container}>
      <View
        style={trackStyle}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={fillStyle} />
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.14)',
  },
  fill: {
    height: '100%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    marginTop: 6,
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
});
