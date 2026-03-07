/**
 * EventFilters — Search bar + botón para abrir filtros en BottomSheet
 */
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { Input } from '../../../components/ui/Input';

export function EventFilters({ filters, setFilter, onOpenFilters, hasActiveFilters, styles }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.filtersContainer}>
      <View style={styles.searchRow}>
        <View style={[styles.searchInputWrap, focused && styles.searchInputWrapFocused]}>
          <Search color="#555" size={16} />
          <Input
            variant="embedded"
            hideFocusBorder
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            value={filters.search}
            onChangeText={(v) => setFilter('search', v)}
            placeholder="Buscar por nombre, ciudad o circuito"
            placeholderTextColor="#444"
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1 }}
            rightAccessory={
                  <TouchableOpacity
                onPress={onOpenFilters}
                style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
              >
                <SlidersHorizontal color={hasActiveFilters ? '#0D0D0D' : '#555'} size={18} />
              </TouchableOpacity>
            }
          />
        </View>
      </View>
    </View>
  );
}
