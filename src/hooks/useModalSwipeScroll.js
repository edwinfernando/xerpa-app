/**
 * Hook reutilizable para modales con ScrollView y gesto de swipe.
 * Evita que el modal capture el swipe cuando el usuario está scrolleando dentro del contenido.
 * Uso: Modal (react-native-modal) con propagateSwipe, scrollTo, scrollOffset; ScrollView con ref y onScroll.
 *
 * @param {number} swipeHeaderHeight - Altura en px del header fijo; el swipe solo cierra si el toque es bajo esta zona
 * @param {boolean} visible - Si el modal está visible (para resetear offset al abrir/cerrar)
 * @returns {{ scrollViewRef, scrollOffsetY, propagateSwipe, scrollTo, onScroll }}
 */
import { useRef, useState, useCallback, useEffect } from 'react';

export function useModalSwipeScroll(swipeHeaderHeight = 110, visible = false) {
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  useEffect(() => {
    if (!visible) {
      scrollOffsetRef.current = 0;
      setScrollOffsetY(0);
    }
  }, [visible]);

  const propagateSwipe = useCallback(
    (evt) => {
      const locationY = evt?.nativeEvent?.locationY ?? 0;
      return locationY > swipeHeaderHeight;
    },
    [swipeHeaderHeight]
  );

  const scrollTo = useCallback((offset) => {
    if (offset && typeof offset.y === 'number') {
      const currentY = scrollOffsetRef.current;
      const newY = Math.max(0, currentY + offset.y);
      scrollOffsetRef.current = newY;
      setScrollOffsetY(newY);
      scrollViewRef.current?.scrollTo({ y: newY, animated: false });
    }
  }, []);

  const onScroll = useCallback((e) => {
    const y = Math.max(0, e.nativeEvent.contentOffset.y);
    scrollOffsetRef.current = y;
    setScrollOffsetY(y);
  }, []);

  return {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  };
}
