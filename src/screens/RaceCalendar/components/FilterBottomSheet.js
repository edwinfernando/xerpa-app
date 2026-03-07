/**
 * FilterBottomSheet — Panel de filtros ergonómico por secciones.
 * Orden: Ordenar por, Mes, Modalidad, Ubicación.
 */
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';

const SORT_OPTIONS = [
  { value: 'fecha_asc', label: 'Más Próximas' },
  { value: 'distancia_desc', label: 'Mayor Distancia' },
  { value: 'desnivel_desc', label: 'Mayor Desnivel' },
];

const SWIPE_HEADER_HEIGHT = 80;

function RenderFilterSection({
  title,
  data = [],
  selectedValue = '',
  onSelect,
  styles,
}) {
  if (!data.length) return null;

  return (
    <View style={styles.filterSectionWrap}>
      <Text style={styles.filterSectionLabel}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        {data.map((option) => {
          const isActive = (selectedValue || '').toLowerCase() === (option || '').toLowerCase();
          return (
            <TouchableOpacity
              key={`${title}-${option}`}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => onSelect(isActive ? '' : option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function FilterBottomSheet({
  visible,
  onClose,
  filters,
  setFilter,
  filterOptions = { meses: [], paises: [], deportes: [], tiposEvento: [], formatos: [], copas: [] },
  filteredCount,
  onClearAll,
  styles,
}) {
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

  const paises = filterOptions.paises || [];
  const deportes = filterOptions.deportes || [];
  const tiposEvento = filterOptions.tiposEvento || [];
  const formatos = filterOptions.formatos || [];
  const copas = filterOptions.copas || [];
  const meses = filterOptions.meses || [];
  const applyLabel = Number.isFinite(filteredCount)
    ? `Mostrar ${filteredCount} Carreras`
    : 'Aplicar Filtros';

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={propagateSwipe}
      scrollTo={scrollTo}
      scrollOffset={scrollOffsetY}
      scrollOffsetMax={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.filterSheet}>
          <View style={[styles.sheetHandle, { backgroundColor: '#E5E5EA' }]} />
          <View style={styles.filterSheetHeader}>
            <Text style={styles.sheetTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClearAll} style={styles.filterClearBtn} disabled={!onClearAll}>
              <Text style={styles.filterClearBtnText}>Restablecer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.filterSheetScrollContent}
          >
            <RenderFilterSection
              title="Ordenar por"
              data={SORT_OPTIONS.map((x) => x.label)}
              selectedValue={SORT_OPTIONS.find((x) => x.value === (filters.sortBy || 'fecha_asc'))?.label}
              onSelect={(label) => {
                const selected = SORT_OPTIONS.find((x) => x.label === label);
                setFilter('sortBy', selected?.value || 'fecha_asc');
              }}
              styles={styles}
            />

            <RenderFilterSection
              title="Mes"
              data={meses}
              selectedValue={filters.mes || ''}
              onSelect={(value) => setFilter('mes', value)}
              styles={styles}
            />

            <RenderFilterSection
              title="Modalidad"
              data={deportes}
              selectedValue={filters.tipoDeporte || ''}
              onSelect={(value) => setFilter('tipoDeporte', value)}
              styles={styles}
            />

            <RenderFilterSection
              title="Tipo de evento"
              data={tiposEvento}
              selectedValue={filters.tipoEvento || ''}
              onSelect={(value) => setFilter('tipoEvento', value)}
              styles={styles}
            />

            <RenderFilterSection
              title="Formato"
              data={formatos}
              selectedValue={filters.formatoEvento || ''}
              onSelect={(value) => setFilter('formatoEvento', value)}
              styles={styles}
            />

            <RenderFilterSection
              title="Copa"
              data={copas}
              selectedValue={filters.copa || ''}
              onSelect={(value) => setFilter('copa', value)}
              styles={styles}
            />

            <RenderFilterSection
              title="Ubicación"
              data={paises}
              selectedValue={filters.pais || ''}
              onSelect={(value) => setFilter('pais', value)}
              styles={styles}
            />
          </ScrollView>

          <View style={styles.filterSheetFooter}>
            <TouchableOpacity style={styles.filterSheetApply} onPress={onClose} activeOpacity={0.9}>
              <Text style={styles.filterSheetApplyText}>{applyLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
