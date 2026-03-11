/**
 * URLs de la app para compartir.
 * Actualiza IOS_APP_STORE_ID cuando publiques en App Store.
 */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.anonymous.xerpaapp';

/** ID numérico de la app en App Store (ej: 1234567890). Actualizar tras publicación. */
export const IOS_APP_STORE_ID = '';

export const IOS_APP_STORE_URL = IOS_APP_STORE_ID
  ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
  : '';
