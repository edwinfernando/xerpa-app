/**
 * EventFilters — Search bar + botón para abrir filtros en BottomSheet
 */
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

export function EventFilters({ filters, setFilter, onOpenFilters, hasActiveFilters, styles }) {
  return (
    <View style={styles.filtersContainer}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Search color="#555" size={18} />
          <TextInput
            style={styles.searchInput}
            value={filters.search}
            onChangeText={(v) => setFilter('search', v)}
            placeholder="Buscar por nombre, ciudad o circuito"
            placeholderTextColor="#444"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={onOpenFilters}
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          >
            <SlidersHorizontal color={hasActiveFilters ? '#0D0D0D' : '#555'} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
