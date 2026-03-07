import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Calcula altura adaptativa para BottomSheets con header + body + footer.
 * El body hace scroll solo cuando el contenido supera la altura disponible.
 */
export function useAdaptiveSheetHeight({
  visible,
  minHeight = 340,
  maxHeightRatio = 0.9,
  minBodyHeight = 180,
} = {}) {
  const { height: screenHeight } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (visible) return;
    setHeaderHeight(0);
    setFooterHeight(0);
    setContentHeight(0);
  }, [visible]);

  const maxSheetHeight = useMemo(
    () => Math.floor((screenHeight || 0) * maxHeightRatio),
    [screenHeight, maxHeightRatio]
  );

  const maxBodyHeight = useMemo(
    () => Math.max(minBodyHeight, maxSheetHeight - headerHeight - footerHeight),
    [minBodyHeight, maxSheetHeight, headerHeight, footerHeight]
  );

  const shouldScroll = contentHeight > maxBodyHeight;

  const computedSheetHeight = useMemo(() => {
    const desired = headerHeight + footerHeight + (shouldScroll ? maxBodyHeight : contentHeight);
    return Math.max(minHeight, Math.min(maxSheetHeight, desired || minHeight));
  }, [headerHeight, footerHeight, shouldScroll, maxBodyHeight, contentHeight, minHeight, maxSheetHeight]);

  const onHeaderLayout = useCallback((e) => {
    const h = Math.ceil(e?.nativeEvent?.layout?.height || 0);
    if (!h) return;
    setHeaderHeight((prev) => (Math.abs(prev - h) >= 2 ? h : prev));
  }, []);

  const onFooterLayout = useCallback((e) => {
    const h = Math.ceil(e?.nativeEvent?.layout?.height || 0);
    if (!h) return;
    setFooterHeight((prev) => (Math.abs(prev - h) >= 2 ? h : prev));
  }, []);

  const onBodyContentSizeChange = useCallback((_, h) => {
    const next = Math.ceil(h || 0);
    if (!next) return;
    setContentHeight((prev) => {
      // Suaviza micro-oscilaciones, pero conserva ajuste natural (sube y baja).
      return Math.abs(next - prev) >= 2 ? next : prev;
    });
  }, []);

  return {
    minSheetHeight: minHeight,
    maxSheetHeight,
    maxBodyHeight,
    shouldScroll,
    computedSheetHeight,
    onHeaderLayout,
    onFooterLayout,
    onBodyContentSizeChange,
  };
}

