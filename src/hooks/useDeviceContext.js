/**
 * useDeviceContext — Hook para contexto de dispositivo (geolocalización + push)
 *
 * Obtiene permisos de forma elegante y expone:
 *   - location: { lat, lon, city } | null
 *   - pushToken: string | null (ExpoPushToken)
 *   - loading: boolean
 *   - error: string | null
 *
 * Uso:
 *   const { location, pushToken, loading, error } = useDeviceContext();
 *
 * Requiere estar dentro de DeviceContextProvider (App.js).
 */
export { useDeviceContext } from '../context/DeviceContext';
