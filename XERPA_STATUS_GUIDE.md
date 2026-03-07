# XERPA — Guía de Estado del Proyecto

**Auditoría técnica realizada como Senior Full-Stack Architect**  
Fecha: 26 de febrero de 2025

---

## Resumen ejecutivo

Este documento resume el estado actual del proyecto XERPA: lo implementado, lo roto y el plan de acción inmediato. Sirve como guía de desarrollo para priorizar correcciones y completar funcionalidades pendientes.

> **Nota:** El archivo `supabase-schema.sql` y el documento de HU XERPA no se encontraron en el repositorio. El análisis se basa en el código fuente, la migración SQL disponible, el README y la arquitectura descrita.

---

## 1. Estado de la integración (Frontend–Backend)

### 1.1 Comunicación con el Router de Entrada de n8n

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Payload** | ✅ Correcto | `buildN8nPayload.js` construye el payload con `user_id`, `mensaje`, `rol`, `contexto_dispositivo` (lat, lon, push_token) y opcionalmente `message` como alias. |
| **Endpoints** | ⚠️ Hardcodeados | URLs de ngrok fijas en código. El README define `N8N_CHAT_ENDPOINT` en `.env` pero no se usa. |
| **Consumo** | ✅ Implementado | `useXerpaAI.js` (chat) y `usePlan.js` (generar plan) hacen `POST` a los webhooks n8n con headers `Content-Type: application/json` y `ngrok-skip-browser-warning`. |

**Archivos relevantes:**
- `src/utils/buildN8nPayload.js` — construcción del payload
- `src/screens/XerpaAI/useXerpaAI.js` — `CHAT_ENDPOINT` línea 12
- `src/screens/Plan/usePlan.js` — `N8N_WEBHOOK_URL` línea 9

**Corrección recomendada:** Leer la URL del webhook desde `process.env.N8N_CHAT_ENDPOINT` o `expo-constants` en lugar de hardcodearla.

---

### 1.2 Uso de Supabase: ¿`columns` vs `select`?

| Hallazgo | Estado |
|----------|--------|
| Uso incorrecto de `columns` | ✅ No se encontró |
| Uso de `.select()` | ✅ Todas las consultas usan `.select()`, nunca `columns` |

**Resumen:** No hay llamadas incorrectas. Supabase se usa correctamente con `.select('*')`, `.select('col1, col2')` o `.select()` tras `.insert()` para devolver el registro insertado.

---

## 2. Integridad del flujo de onboarding (WF00)

### 2.1 Redirección post-registro al tab XERPA IA

| Paso | Implementación | Estado |
|------|----------------|--------|
| SignUp guarda flag | `useSignUp.js`: guarda `{ isNewUser: true, userRole: 'Atleta' }` en AsyncStorage (`ONBOARDING_KEY`) | ✅ |
| App lee flag | `App.js`: lee `ONBOARDING_KEY` y pasa `onboardingData` a MainTabNavigator | ✅ |
| Tab inicial | `MainTabNavigator`: `initialRouteName={onboardingData?.isNewUser ? 'XerpaAI' : undefined}` | ✅ |
| Resultado | Si `isNewUser`, se abre directamente el tab XERPA IA | ✅ |

**Conclusión:** La App está preparada para enviar al usuario al tab XERPA IA tras el registro. El flujo está implementado.

---

### 2.2 Listeners en el Chat para detectar fin de conversación y refrescar perfil

| Requisito | Implementación | Estado |
|-----------|----------------|--------|
| Detección fin onboarding | `useXerpaAI.js`: función `isOnboardingCompleteMessage()` con keywords (`perfil configurado`, `plan generado`, etc.) | ✅ |
| Acción update_profile | `sendMessage`: si `metadata?.action === 'update_profile'` → `refreshUserData()` | ✅ |
| Frase plan generado | Si `answer.includes(PLAN_GENERADO_PHRASE)` → `refreshUserData()` | ✅ |
| Llamada a UserContext | `refreshUserData` viene de `useUserContext()` y actualiza `profileData` globalmente | ✅ |

**Conclusión:** El componente Chat tiene la lógica necesaria para detectar el fin del onboarding y ejecutar el refresco del perfil vía `refreshUserData()`.

---

### 2.3 Posible problema de timing

- En `useXerpaAI.js` línea 155: `onOnboardingConsumed?.()` se llama en el mismo `useEffect` que envía el mensaje de bienvenida.
- Consecuencia: `onboardingData` se limpia antes de que el usuario vea la respuesta.
- No afecta al flujo de onboarding en sí, pero podría causar comportamiento raro si se usa `onboardingData` en otros sitios tras enviar el mensaje.

---

## 3. Consistencia de datos (Supabase)

### 3.1 Tabla `usuarios` — comparación código vs esquema

El README define la tabla base `usuarios` con: `id`, `nombre`, `email`, `rol`, `codigo_vinculacion`, `created_at`. Las relaciones atleta-entrenador/tutor se gestionan en `relaciones_usuarios`.  
En el código se usan además: `edad`, `peso`, `disciplina`, `perfil_completado`, `push_token`, `ultima_lat`, `ultima_lon`, `ultima_ciudad`, `athlete_id`, `rol`.

| Columna (supuesta en DB) | Uso en código | Estado |
|--------------------------|---------------|--------|
| `perfil_completado` | `ProfileCompletionBanner`, `UserContext` | ✅ Mapeado |
| `edad` | `ProfileCompletionBanner` | ⚠️ Si la DB usa `talla_cm` en lugar de `edad`, hay desajuste |
| `peso` | `ProfileCompletionBanner` | ⚠️ Si la DB usa `peso_kg`, hay desajuste |
| `talla_cm` | No encontrado en código | ❌ No mapeado |
| `peso_kg` | No encontrado en código | ❌ No mapeado |
| `condiciones_especiales` | No encontrado en código | ❌ No mapeado |
| `disciplina` | `ProfileCompletionBanner` | ✅ Usado |

**ProfileCompletionBanner.js** usa:
```javascript
hasPerfilCompletado = data.perfil_completado === true
hasEdad = data.edad != null && String(data.edad).trim() !== ''
hasPeso = data.peso != null && String(data.peso).trim() !== ''
hasDisciplina = data.disciplina != null && String(data.disciplina).trim() !== ''
```

**Recomendación:** Verificar en Supabase los nombres exactos de columnas. Si el esquema real usa `talla_cm` y `peso_kg`, actualizar `ProfileCompletionBanner` para que coincidan y se eviten banners que no se ocultan.

---

### 3.2 Otras tablas utilizadas

| Tabla | Uso |
|-------|-----|
| `plan_entrenamientos` | Plan semanal, entreno hoy, TSS planeado |
| `wellness_cache` | CTL, ATL, TSB, TSS semanal |
| `esfuerzo_manual` | RPE diario |
| `vista_calendario_atletas` | Próxima carrera, mis carreras |
| `carreras` | Catálogo global de carreras |
| `usuario_carreras` | Inscripciones |
| `usuarios` | Perfil, rol, push_token, ubicación |

---

## 4. Gap analysis (funcionalidad pendiente según HU XERPA)

### 4.1 Dashboard

| Función | Estado | Detalle |
|---------|--------|---------|
| TSS semanal / anillo de progreso | ✅ Implementado | `TSSSection`, `ProgressRing` |
| CTL / ATL / TSB | ✅ Implementado | `QuickMetrics` |
| Misión de hoy | ✅ Implementado | `MisionHoy` con hora y punto de encuentro |
| Próxima carrera / countdown | ✅ Implementado | `CountdownCard` |
| RPE diario | ✅ Implementado | `RpeSliderSection`, `saveRPE` |
| Botón SOS ("Me lesioné") | ⚠️ Parcial | Muestra `Alert` pero "Ir a XERPA AI" tiene `onPress: () => {}` — no navega |
| Botón PXERPA | ⚠️ Parcial | Solo `Alert` "Próximamente", no navega al chat |
| Sincronizar datos | ⚠️ Parcial | Solo `Alert` "Próximamente" |
| Contador de carreras | ✅ Implementado | Cuenta de días hasta próxima carrera |
| Calificación de entrenos | ✅ Parcial | RPE diario en Dashboard; RPE en `TimerFinishSheet` del Plan |
| Vincular Strava/Intervalos | ⚠️ Parcial | UI presente, handlers muestran "Próximamente" |

---

### 4.2 Plan de entrenamiento

| Función | Estado | Detalle |
|---------|--------|---------|
| Semana actual | ✅ Implementado | Cards por día, tipos, hora, punto_encuentro |
| Historial | ✅ Implementado | `HistoryTab` agrupado por mes |
| Generar plan vía n8n | ✅ Implementado | `handleGeneratePlan` con `buildN8nPayload` |
| Añadir entreno manual | ✅ Implementado | `AddManualModal` |
| Marcar completado | ✅ Implementado | `markComplete` |
| Cronómetro + guardar sesión | ✅ Implementado | `WorkoutContext`, `WorkoutActiveScreen`, `TimerFinishSheet` |
| Calificación RPE post-entreno | ✅ Implementado | RPE en `TimerFinishSheet` al terminar grabación |

---

### 4.3 Funciones críticas pendientes (resumen)

1. Botón SOS: navegar al tab XERPA IA con mensaje predefinido (ej. "Me lesioné").
2. Botón PXERPA: navegar al tab XERPA IA.
3. Sincronización real con Strava/Intervalos.icu (o al menos UI preparada).
4. Calificación de entrenos pasados: añadir RPE editable para entrenamientos ya completados (más allá del RPE diario y del RPE al terminar la grabación).

---

## 5. Lista de correcciones prioritarias

### 5.1 Todo List técnico

| # | Tipo | Tarea | Prioridad |
|---|------|-------|-----------|
| 1 | Reactividad | **Banner no se quita:** Alinear nombres de columnas entre DB y `ProfileCompletionBanner`. Si la DB usa `peso_kg` y `talla_cm`, actualizar el componente para usarlos en lugar de `peso` y `edad`. | P0 |
| 2 | Reactividad | **Banner no reacciona:** Confirmar que `refreshUserData()` se ejecuta tras actualización del perfil por XERPA IA. Añadir logs o validar que el flujo n8n devuelve `action: 'update_profile'` cuando corresponde. | P0 |
| 3 | Sincronización | **Datos de perfil desfasados:** Garantizar que `UserContext.refreshUserData` se llame tras cualquier mutación del perfil (IA, Perfil, DeviceContext) para mantener UI consistente. | P1 |
| 4 | Navegación | **SOS "Ir a XERPA AI" no hace nada:** Implementar `onPress` en `handleReportInjury` para navegar a `MainTabs` → `XerpaAI` y opcionalmente enviar mensaje "Me lesioné" o similar. | P0 |
| 5 | Navegación | **PXERPA no abre chat:** Implementar `handleOpenXerpa` para navegar a `MainTabs` → `XerpaAI`. | P1 |
| 6 | Config | **URLs n8n hardcodeadas:** Extraer `CHAT_ENDPOINT` / `N8N_WEBHOOK_URL` a variables de entorno (`.env` + `expo-constants`) para dev/prod. | P1 |
| 7 | Datos | **Columnas `talla_cm`, `peso_kg`, `condiciones_especiales`:** Si existen en el esquema real, mapearlas en `ProfileCompletionBanner`, `UserContext` y pantallas de perfil donde aplique. | P2 |
| 8 | Documentación | Crear `supabase-schema.sql` con DDL actual de tablas para referencia del equipo. | P2 |
| 9 | Documentación | Añadir documento de HU XERPA al repositorio para alinear backlog con código. | P2 |

---

### 5.2 Plan de acción inmediato (próximas 2 semanas)

1. **Semana 1**
   - Revisar esquema real de `usuarios` en Supabase.
   - Corregir mapeo de columnas en `ProfileCompletionBanner` (`peso_kg`, `talla_cm`, etc.).
   - Implementar navegación real en SOS y PXERPA (ir a tab XerpaAI).
   - Mover URLs de n8n a variables de entorno.

2. **Semana 2**
   - Validar flujo completo de onboarding: registro → tab XERPA IA → chat → actualización perfil → desaparición del banner.
   - Añadir tests o flujos manuales para confirmar reactividad del banner.
   - Documentar `supabase-schema.sql` y HU XERPA.

---

## 6. Estructura de endpoints n8n

| Endpoint | Uso | Payload |
|----------|-----|---------|
| `/webhook/chat` | Chat XERPA AI, generar plan | `user_id`, `mensaje`, `rol`, `contexto_dispositivo`, `message` (alias) |

---

## 7. Dependencias clave

- **Supabase:** Auth + PostgreSQL
- **n8n:** Webhooks para chat y generación de plan
- **Expo:** Push notifications, Location
- **UserContext / DeviceContext / WorkoutContext:** Estado global

---

## 8. Conclusión

- La integración con n8n está funcional y el flujo de onboarding está implementado.
- El principal problema de reactividad del banner proviene probablemente del desajuste entre nombres de columnas en la DB (`peso_kg`, `talla_cm`) y el código (`peso`, `edad`).
- Las correcciones prioritarias son: alinear columnas en el banner, conectar SOS y PXERPA con navegación real, y externalizar las URLs de n8n.

Este documento debe actualizarse conforme evolucione el esquema y las HUs de XERPA.
