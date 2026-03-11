/**
 * stravaAuthService — Intercambio de código OAuth con Strava vía Edge Function
 */
import { supabase, supabaseUrl } from '../../supabase';

const STRAVA_AUTH_URL = `${supabaseUrl}/functions/v1/strava-auth`;

export async function exchangeStravaCode(code, userId) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(STRAVA_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ code, user_id: userId }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error ?? 'Error al conectar con Strava.');
  }

  return json;
}
