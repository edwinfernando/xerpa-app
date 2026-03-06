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
import { Calendar, ChevronDown } from 'lucide-react-native';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { showXerpaError } from '../../../utils/ErrorHandler';
import { useModalSwipeScroll } from '../../../hooks/useModalSwipeScroll';
import { PRIORIDADES } from '../../../constants/prioridades';

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const EMPTY_FORM = {
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  ciudad: '',
  pais: '',
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

function formatDateLabel(dateStr) {
  if (!dateStr) return 'Seleccionar fecha';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
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

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={styles.manualPickerSheet}>
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

export function AddRaceModal({
  visible,
  onClose,
  onSave,
  showToast,
  styles,
  catalogs,
  catalogLoading,
  onLoadCatalogs,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [nombreError, setNombreError] = useState('');
  const [fechaInicioError, setFechaInicioError] = useState('');
  const [fechaFinError, setFechaFinError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePickerFor, setShowDatePickerFor] = useState(null);
  const [activeSelector, setActiveSelector] = useState(null);
  const [selectorSearch, setSelectorSearch] = useState('');

  const SWIPE_HEADER_HEIGHT = 95;
  const {
    scrollViewRef,
    scrollOffsetY,
    propagateSwipe,
    scrollTo,
    onScroll,
  } = useModalSwipeScroll(SWIPE_HEADER_HEIGHT, visible);

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
    if (visible) onLoadCatalogs?.();
  }, [visible, onLoadCatalogs]);

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

  function reset() {
    setForm(EMPTY_FORM);
    setNombreError('');
    setFechaInicioError('');
    setFechaFinError('');
    setSaving(false);
  }

  function handleClose() {
    reset();
    setShowDatePickerFor(null);
    closeSelector();
    onClose();
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
      reset();
      onClose();
    } catch (err) {
      showXerpaError(err, 'RACE-ADD-01', showToast);
      setNombreError(err?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={scrollOffsetY <= 0 ? ['down'] : undefined}
      propagateSwipe={propagateSwipe}
      scrollTo={scrollTo}
      scrollOffset={scrollOffsetY}
      scrollOffsetMax={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <KeyboardAvoidingView
        style={styles.manualModalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <View style={styles.manualModalSheet}>
          <View style={styles.manualModalHandle} />
          <Text style={styles.manualModalTitle}>Nueva Carrera</Text>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <Text style={styles.manualLabel}>Nombre del evento *</Text>
            <Input
              value={form.nombre}
              onChangeText={(v) => setField('nombre', v)}
              placeholder="Ej. XCO Copa Andalucía"
              error={!!nombreError}
              errorText={nombreError}
              style={{ marginBottom: 16 }}
              editable={!saving}
            />

            <Text style={styles.manualLabel}>Fecha inicio *</Text>
            <TouchableOpacity
              style={[
                styles.manualDateTrigger,
                !!fechaInicioError && styles.manualDateTriggerError,
              ]}
              onPress={() => setShowDatePickerFor('fecha_inicio')}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Calendar color="#00D2FF" size={16} />
              <Text style={[styles.manualDateTriggerText, !form.fecha_inicio && styles.manualDateTriggerPlaceholder]}>
                {formatDateLabel(form.fecha_inicio)}
              </Text>
            </TouchableOpacity>
            {!!fechaInicioError && <Text style={styles.formHelperText}>{fechaInicioError}</Text>}

            <Text style={styles.manualLabel}>Fecha fin (opcional)</Text>
            <TouchableOpacity
              style={[
                styles.manualDateTrigger,
                !!fechaFinError && styles.manualDateTriggerError,
                { marginBottom: 16 },
              ]}
              onPress={() => setShowDatePickerFor('fecha_fin')}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Calendar color="#00D2FF" size={16} />
              <Text style={[styles.manualDateTriggerText, !form.fecha_fin && styles.manualDateTriggerPlaceholder]}>
                {form.fecha_fin ? formatDateLabel(form.fecha_fin) : 'Sin fecha fin'}
              </Text>
            </TouchableOpacity>
            {!!fechaFinError && <Text style={styles.formHelperText}>{fechaFinError}</Text>}

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

            {showDatePickerFor && (
              <DateTimePicker
                mode="date"
                value={
                  form[showDatePickerFor]
                    ? new Date(`${form[showDatePickerFor]}T00:00:00`)
                    : new Date()
                }
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
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
    </Modal>
  );
}

