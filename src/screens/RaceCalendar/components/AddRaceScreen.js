import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, ChevronDown, MapPin } from 'lucide-react-native';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ScreenWrapper } from '../../../components/ScreenWrapper';
import { showXerpaError } from '../../../utils/ErrorHandler';
import { PRIORIDADES } from '../../../constants/prioridades';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSheetModalStyle, getSheetModalProps } from '../../../constants/sheetModalConfig';

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const EMPTY_FORM = {
  nombre: '',
  circuito_nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  ciudad: '',
  pais: '',
  latitud: '',
  longitud: '',
  distancia_km: '',
  desnivel_m: '',
  prioridad: 'B',
  tipo_evento: 'ruta_local',
  tipo_deporte: '',
  tss_estimado: '',
  tipo_evento_id: null,
  formato_evento_id: null,
  tipo_deporte_id: null,
  pais_id: null,
  ciudad_id: null,
  tipo_evento_codigo: 'ruta_local',
  tipo_deporte_nombre: '',
  pais_nombre: '',
  ciudad_nombre: '',
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function formatDateLabel(dateStr) {
  if (!dateStr) return 'Seleccionar fecha';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function OptionPickerSheet({
  visible,
  title,
  options,
  selectedId,
  search,
  onChangeSearch,
  onClose,
  onSelect,
  styles,
  idKey = 'id',
  labelKey = 'nombre',
  emptyText = 'Sin opciones',
}) {
  const filteredOptions = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o?.[labelKey] || '').toLowerCase().includes(q));
  }, [options, search, labelKey]);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={[getSheetModalStyle()]}
      {...getSheetModalProps()}
    >
      <View style={[styles.manualPickerSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.manualModalHandle} />
        <View style={styles.manualPickerHeader}>
          <Text style={styles.manualPickerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.manualPickerClose}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        <Input
          value={search}
          onChangeText={onChangeSearch}
          placeholder="Buscar..."
          variant="embedded"
          style={styles.manualPickerSearchInput}
        />

        {filteredOptions.length === 0 ? (
          <Text style={styles.manualSelectEmptyText}>{emptyText}</Text>
        ) : (
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => String(item[idKey])}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const id = item[idKey];
              const isActive = selectedId === id;
              return (
                <TouchableOpacity
                  style={[styles.manualPickerItem, isActive && styles.manualPickerItemActive]}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.manualPickerItemText, isActive && styles.manualPickerItemTextActive]}>
                    {item[labelKey]}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

function OptionField({
  title,
  valueText,
  placeholder,
  onPress,
  styles,
  disabled = false,
}) {
  return (
    <>
      <Text style={styles.manualLabel}>{title}</Text>
      <TouchableOpacity
        style={styles.manualSelectField}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <Text style={[styles.manualSelectFieldText, !valueText && styles.manualSelectFieldPlaceholder]}>
          {valueText || placeholder}
        </Text>
        <ChevronDown size={16} color="#8E8E93" />
      </TouchableOpacity>
    </>
  );
}

export function AddRaceScreen({
  onSave,
  showToast,
  styles,
  catalogs,
  catalogLoading,
  onLoadCatalogs,
  onSaved,
  navigation,
  route,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [nombreError, setNombreError] = useState('');
  const [fechaInicioError, setFechaInicioError] = useState('');
  const [fechaFinError, setFechaFinError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePickerFor, setShowDatePickerFor] = useState(null);
  const [activeSelector, setActiveSelector] = useState(null);
  const [selectorSearch, setSelectorSearch] = useState('');

  const tiposEvento = catalogs?.tiposEvento || [];
  const formatosEvento = catalogs?.formatosEvento || [];
  const tiposDeporte = catalogs?.tiposDeporte || [];
  const paises = catalogs?.paises || [];
  const ciudades = catalogs?.ciudades || [];

  const ciudadesFiltradas = useMemo(() => {
    if (!form.pais_id) return ciudades;
    return ciudades.filter((c) => c.pais_id === form.pais_id);
  }, [ciudades, form.pais_id]);

  const selectedTipoEvento = useMemo(
    () => tiposEvento.find((x) => x.id === form.tipo_evento_id) || null,
    [tiposEvento, form.tipo_evento_id]
  );
  const selectedFormato = useMemo(
    () => formatosEvento.find((x) => x.id === form.formato_evento_id) || null,
    [formatosEvento, form.formato_evento_id]
  );
  const selectedTipoDeporte = useMemo(
    () => tiposDeporte.find((x) => x.id === form.tipo_deporte_id) || null,
    [tiposDeporte, form.tipo_deporte_id]
  );
  const selectedPais = useMemo(
    () => paises.find((x) => x.id === form.pais_id) || null,
    [paises, form.pais_id]
  );
  const selectedCiudad = useMemo(
    () => ciudadesFiltradas.find((x) => x.id === form.ciudad_id) || null,
    [ciudadesFiltradas, form.ciudad_id]
  );

  const insets = useSafeAreaInsets();

  const selectorMeta = useMemo(() => {
    if (activeSelector === 'tipo_evento') {
      return { title: 'Tipo de evento', options: tiposEvento, emptyText: catalogLoading ? 'Cargando tipos de evento...' : 'Sin tipos disponibles' };
    }
    if (activeSelector === 'formato_evento') {
      return { title: 'Formato', options: formatosEvento, emptyText: catalogLoading ? 'Cargando formatos...' : 'Sin formatos disponibles' };
    }
    if (activeSelector === 'tipo_deporte') {
      return { title: 'Tipo de deporte', options: tiposDeporte, emptyText: catalogLoading ? 'Cargando deportes...' : 'Sin deportes disponibles' };
    }
    if (activeSelector === 'pais') {
      return { title: 'País', options: paises, emptyText: catalogLoading ? 'Cargando países...' : 'Sin países disponibles' };
    }
    if (activeSelector === 'ciudad') {
      return {
        title: 'Ciudad',
        options: ciudadesFiltradas,
        emptyText: form.pais_id ? 'Sin ciudades para este país' : 'Selecciona un país primero',
      };
    }
    return { title: '', options: [], emptyText: 'Sin opciones' };
  }, [activeSelector, tiposEvento, formatosEvento, tiposDeporte, paises, ciudadesFiltradas, catalogLoading, form.pais_id]);

  useEffect(() => {
    onLoadCatalogs?.();
  }, [onLoadCatalogs]);

  useEffect(() => {
    const picked = route?.params?.pickedLocation;
    if (!picked) return;
    if (picked?.clear) {
      setForm((prev) => ({
        ...prev,
        latitud: '',
        longitud: '',
      }));
      navigation?.setParams?.({ pickedLocation: undefined });
      return;
    }
    const lat = Number(picked.latitud);
    const lon = Number(picked.longitud);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setForm((prev) => {
        const next = {
          ...prev,
          latitud: String(lat),
          longitud: String(lon),
        };
        const address = picked.address || null;
        const countryName = address?.country || '';
        const cityName = address?.city || '';
        const districtName = address?.district || '';
        const streetName = address?.street || address?.name || '';
        const circuitoSugerido = [streetName, districtName].filter(Boolean).join(' - ');

        // Solo completamos automáticamente campos vacíos para no pisar edición manual.
        if (!next.circuito_nombre && circuitoSugerido) {
          next.circuito_nombre = circuitoSugerido;
        }

        const normalizedCountry = normalizeText(countryName);
        const matchedPais = normalizedCountry
          ? paises.find((p) => normalizeText(p?.nombre) === normalizedCountry)
          : null;

        if (!next.pais_id && matchedPais) {
          next.pais_id = matchedPais.id;
          next.pais_nombre = matchedPais.nombre || '';
          next.pais = matchedPais.nombre || '';
        } else if (!next.pais && countryName) {
          next.pais = countryName;
          next.pais_nombre = countryName;
        }

        const normalizedCity = normalizeText(cityName);
        const searchPaisId = matchedPais?.id || next.pais_id || null;
        const sourceCiudades = searchPaisId
          ? ciudades.filter((c) => c.pais_id === searchPaisId)
          : ciudades;
        const matchedCiudad = normalizedCity
          ? sourceCiudades.find((c) => normalizeText(c?.nombre) === normalizedCity)
          : null;

        if (!next.ciudad_id && matchedCiudad) {
          next.ciudad_id = matchedCiudad.id;
          next.ciudad_nombre = matchedCiudad.nombre || '';
          next.ciudad = matchedCiudad.nombre || '';
        } else if (!next.ciudad && cityName) {
          next.ciudad = cityName;
          next.ciudad_nombre = cityName;
        }

        return next;
      });
    }
    navigation?.setParams?.({ pickedLocation: undefined });
  }, [route?.params?.pickedLocation, navigation, paises, ciudades]);

  function openSelector(key) {
    setActiveSelector(key);
    setSelectorSearch('');
  }

  function closeSelector() {
    setActiveSelector(null);
    setSelectorSearch('');
  }

  function handleSelectFromPicker(opt) {
    if (!opt || !activeSelector) return;
    if (activeSelector === 'tipo_evento') {
      setForm((prev) => ({
        ...prev,
        tipo_evento_id: opt.id,
        tipo_evento_codigo: opt.codigo || prev.tipo_evento || 'ruta_local',
        tipo_evento: opt.codigo || prev.tipo_evento || 'ruta_local',
      }));
    } else if (activeSelector === 'formato_evento') {
      setField('formato_evento_id', opt.id);
    } else if (activeSelector === 'tipo_deporte') {
      setForm((prev) => ({
        ...prev,
        tipo_deporte_id: opt.id,
        tipo_deporte_nombre: opt.nombre || '',
        tipo_deporte: opt.nombre || '',
      }));
    } else if (activeSelector === 'pais') {
      setField('pais_id', opt.id);
    } else if (activeSelector === 'ciudad') {
      setForm((prev) => ({
        ...prev,
        ciudad_id: opt.id,
        ciudad_nombre: opt.nombre || '',
        ciudad: opt.nombre || '',
      }));
    }
    closeSelector();
  }

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'pais_id') {
        const paisObj = paises.find((p) => p.id === value) || null;
        next.pais_nombre = paisObj?.nombre || '';
        next.pais = paisObj?.nombre || '';
        next.ciudad_id = null;
        next.ciudad_nombre = '';
        next.ciudad = '';
      }
      return next;
    });
    if (field === 'nombre' && nombreError) setNombreError('');
    if (field === 'fecha_inicio' && fechaInicioError) setFechaInicioError('');
    if (field === 'fecha_fin' && fechaFinError) setFechaFinError('');
  }

  function handleDateChange(event, selectedDate) {
    if (event?.type === 'dismissed') {
      setShowDatePickerFor(null);
      return;
    }
    if (!selectedDate || !showDatePickerFor) return;
    const iso = selectedDate.toISOString().slice(0, 10);
    setField(showDatePickerFor, iso);
    if (showDatePickerFor === 'fecha_inicio' && !form.fecha_fin) {
      setField('fecha_fin', iso);
    }
    if (Platform.OS === 'android') setShowDatePickerFor(null);
  }

  async function handleSave() {
    let hasError = false;
    if (!form.nombre.trim()) {
      setNombreError('El nombre del evento es obligatorio.');
      hasError = true;
    }
    if (!form.fecha_inicio.trim()) {
      setFechaInicioError('La fecha de inicio es obligatoria.');
      hasError = true;
    } else if (!DATE_REGEX.test(form.fecha_inicio.trim())) {
      setFechaInicioError('Selecciona una fecha válida.');
      hasError = true;
    }
    if (form.fecha_fin.trim() && !DATE_REGEX.test(form.fecha_fin.trim())) {
      setFechaFinError('Selecciona una fecha válida.');
      hasError = true;
    }
    if (form.fecha_inicio.trim() && form.fecha_fin.trim()) {
      if (new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
        setFechaFinError('La fecha fin debe ser igual o posterior.');
        hasError = true;
      }
    }
    if (hasError) return;

    setSaving(true);
    try {
      await onSave(form);
      setForm(EMPTY_FORM);
      onSaved?.();
    } catch (err) {
      showXerpaError(err, 'RACE-ADD-01', showToast);
      setNombreError(err?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenWrapper style={styles.safeContainer} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.manualModalSheet, { flex: 1, maxHeight: undefined, borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28) }}
          >
            <Text style={styles.manualLabel}>Nombre del evento / copa *</Text>
            <Input
              value={form.nombre}
              onChangeText={(v) => setField('nombre', v)}
              placeholder="Ej. Copa Andalucía XCO"
              error={!!nombreError}
              errorText={nombreError}
              style={{ marginBottom: 14 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Nombre del circuito / pista</Text>
            <Input
              value={form.circuito_nombre}
              onChangeText={(v) => setField('circuito_nombre', v)}
              placeholder="Ej. Pista Cerro Verde"
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Fecha inicio *</Text>
            <TouchableOpacity
              style={[
                styles.manualDateTrigger,
                !!fechaInicioError && styles.manualDateTriggerError,
              ]}
              onPress={() =>
                setShowDatePickerFor((prev) => (prev === 'fecha_inicio' ? null : 'fecha_inicio'))
              }
              activeOpacity={0.85}
              disabled={saving}
            >
              <Calendar color="#00D2FF" size={16} />
              <Text style={[styles.manualDateTriggerText, !form.fecha_inicio && styles.manualDateTriggerPlaceholder]}>
                {formatDateLabel(form.fecha_inicio)}
              </Text>
            </TouchableOpacity>
            {!!fechaInicioError && <Text style={styles.formHelperText}>{fechaInicioError}</Text>}
            {showDatePickerFor === 'fecha_inicio' && Platform.OS === 'ios' && (
              <>
                <View style={{ backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 12, marginBottom: 8 }}>
                  <DateTimePicker
                    mode="date"
                    value={form.fecha_inicio ? new Date(`${form.fecha_inicio}T00:00:00`) : new Date()}
                    display="inline"
                    onChange={handleDateChange}
                    minimumDate={getTodayStart()}
                    maximumDate={new Date(2030, 11, 31)}
                    locale="es-ES"
                    themeVariant="dark"
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setShowDatePickerFor(null)} activeOpacity={0.7}>
                    <Text style={{ color: '#00D2FF', fontWeight: '700' }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={styles.manualLabel}>Fecha fin (opcional)</Text>
            <TouchableOpacity
              style={[
                styles.manualDateTrigger,
                !!fechaFinError && styles.manualDateTriggerError,
                { marginBottom: 16 },
              ]}
              onPress={() =>
                setShowDatePickerFor((prev) => (prev === 'fecha_fin' ? null : 'fecha_fin'))
              }
              activeOpacity={0.85}
              disabled={saving}
            >
              <Calendar color="#00D2FF" size={16} />
              <Text style={[styles.manualDateTriggerText, !form.fecha_fin && styles.manualDateTriggerPlaceholder]}>
                {form.fecha_fin ? formatDateLabel(form.fecha_fin) : 'Sin fecha fin'}
              </Text>
            </TouchableOpacity>
            {!!fechaFinError && <Text style={styles.formHelperText}>{fechaFinError}</Text>}
            {showDatePickerFor === 'fecha_fin' && Platform.OS === 'ios' && (
              <>
                <View style={{ backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 12, marginBottom: 8 }}>
                  <DateTimePicker
                    mode="date"
                    value={form.fecha_fin ? new Date(`${form.fecha_fin}T00:00:00`) : new Date()}
                    display="inline"
                    onChange={handleDateChange}
                    minimumDate={
                      form.fecha_inicio
                        ? new Date(`${form.fecha_inicio}T00:00:00`)
                        : getTodayStart()
                    }
                    maximumDate={new Date(2030, 11, 31)}
                    locale="es-ES"
                    themeVariant="dark"
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setShowDatePickerFor(null)} activeOpacity={0.7}>
                    <Text style={{ color: '#00D2FF', fontWeight: '700' }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <OptionField
              title="Tipo de evento"
              valueText={selectedTipoEvento?.nombre || ''}
              placeholder={catalogLoading ? 'Cargando tipos...' : 'Seleccionar tipo'}
              onPress={() => openSelector('tipo_evento')}
              styles={styles}
              disabled={catalogLoading}
            />

            <OptionField
              title="Formato"
              valueText={selectedFormato?.nombre || ''}
              placeholder={catalogLoading ? 'Cargando formatos...' : 'Seleccionar formato'}
              onPress={() => openSelector('formato_evento')}
              styles={styles}
              disabled={catalogLoading}
            />

            <OptionField
              title="Tipo de deporte"
              valueText={selectedTipoDeporte?.nombre || ''}
              placeholder={catalogLoading ? 'Cargando deportes...' : 'Seleccionar deporte'}
              onPress={() => openSelector('tipo_deporte')}
              styles={styles}
              disabled={catalogLoading}
            />

            <OptionField
              title="País"
              valueText={selectedPais?.nombre || ''}
              placeholder={catalogLoading ? 'Cargando países...' : 'Seleccionar país'}
              onPress={() => openSelector('pais')}
              styles={styles}
              disabled={catalogLoading}
            />

            <OptionField
              title="Ciudad"
              valueText={selectedCiudad?.nombre || ''}
              placeholder={form.pais_id ? 'Seleccionar ciudad' : 'Selecciona un país primero'}
              onPress={() => openSelector('ciudad')}
              styles={styles}
              disabled={!form.pais_id}
            />

            {!catalogLoading && !tiposEvento.length && (
              <Text style={styles.manualSelectEmptyText}>
                No hay catálogos disponibles. Revisa migraciones y permisos.
              </Text>
            )}

            <Text style={styles.manualLabel}>Ubicación en mapa (lat / lon)</Text>
            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.latitud}
                  onChangeText={(v) => setField('latitud', v)}
                  placeholder="Latitud"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.longitud}
                  onChangeText={(v) => setField('longitud', v)}
                  placeholder="Longitud"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.manualSelectField, { marginBottom: 12 }]}
              activeOpacity={0.85}
              onPress={() =>
                navigation?.navigate?.('AddRaceMapPicker', {
                  latitud: form.latitud || null,
                  longitud: form.longitud || null,
                })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} color="#00D2FF" />
                <Text style={styles.manualSelectFieldText}>Elegir ubicación en mapa</Text>
              </View>
              <Text style={styles.manualPickerClose}>Abrir</Text>
            </TouchableOpacity>

            <Text style={styles.manualLabel}>Distancia (km) / Desnivel (m D+)</Text>
            <View style={styles.manualRow}>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.distancia_km}
                  onChangeText={(v) => setField('distancia_km', v)}
                  placeholder="80"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
              <View style={styles.manualRowItem}>
                <Input
                  value={form.desnivel_m}
                  onChangeText={(v) => setField('desnivel_m', v)}
                  placeholder="2400"
                  keyboardType="numeric"
                  style={{ marginBottom: 16 }}
                  editable={!saving}
                />
              </View>
            </View>

            <Text style={styles.manualLabel}>TSS estimado (para XERPA Readiness)</Text>
            <Input
              value={form.tss_estimado}
              onChangeText={(v) => setField('tss_estimado', v)}
              placeholder="Ej. 85"
              keyboardType="numeric"
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Prioridad (A=objetivo principal, B, C)</Text>
            <View style={styles.prioridadPills}>
              {PRIORIDADES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.prioridadPill, form.prioridad === p && styles.prioridadPillActive]}
                  onPress={() => setField('prioridad', p)}
                >
                  <Text style={[styles.prioridadPillText, form.prioridad === p && styles.prioridadPillTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.manualActions}>
              <Button
                title="Guardar Carrera"
                variant="solid"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={[styles.manualSaveBtn, { flex: 1 }]}
              />
            </View>

            {showDatePickerFor && Platform.OS === 'android' && (
              <DateTimePicker
                mode="date"
                value={
                  form[showDatePickerFor]
                    ? new Date(`${form[showDatePickerFor]}T00:00:00`)
                    : new Date()
                }
                display="calendar"
                onChange={handleDateChange}
                minimumDate={
                  showDatePickerFor === 'fecha_fin' && form.fecha_inicio
                    ? new Date(`${form.fecha_inicio}T00:00:00`)
                    : getTodayStart()
                }
                maximumDate={new Date(2030, 11, 31)}
                locale="es-ES"
                themeVariant="dark"
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <OptionPickerSheet
        visible={!!activeSelector}
        title={selectorMeta.title}
        options={selectorMeta.options}
        selectedId={
          activeSelector === 'tipo_evento' ? form.tipo_evento_id
            : activeSelector === 'formato_evento' ? form.formato_evento_id
              : activeSelector === 'tipo_deporte' ? form.tipo_deporte_id
                : activeSelector === 'pais' ? form.pais_id
                  : form.ciudad_id
        }
        search={selectorSearch}
        onChangeSearch={setSelectorSearch}
        onClose={closeSelector}
        onSelect={handleSelectFromPicker}
        styles={styles}
        emptyText={selectorMeta.emptyText}
      />
    </ScreenWrapper>
  );
}

