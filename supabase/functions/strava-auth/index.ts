/**
 * strava-auth — Edge Function blindada para intercambio OAuth 2.0 con Strava.
 * Usa SERVICE_ROLE_KEY para bypass de RLS. CORS manejado. Errores explícitos.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, user_id } = await req.json();

    const clientId = Deno.env.get('STRAVA_CLIENT_ID');
    const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret) {
      throw new Error('Faltan las credenciales de Strava en el servidor Supabase');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta (SUPABASE_URL o SERVICE_ROLE_KEY)');
    }

    if (!code || !user_id) {
      throw new Error('Faltan code o user_id en el body');
    }

    // Negociación con Strava
    const stravaResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const stravaData = await stravaResponse.json();

    if (!stravaResponse.ok) {
      console.error('Strava rechazó la petición:', stravaData);
      return new Response(
        JSON.stringify({ error: 'Rechazo de Strava', details: stravaData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stravaData?.athlete?.id) {
      const msg = 'Strava no devolvió datos del atleta (código usado, expirado o respuesta inesperada)';
      console.error(msg, stravaData);
      return new Response(
        JSON.stringify({ error: msg, details: stravaData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Guardado seguro en base de datos (usuario_id = columna real en integraciones_terceros)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from('integraciones_terceros')
      .upsert(
        {
          usuario_id: user_id,
          plataforma: 'strava',
          id_externo: stravaData.athlete.id.toString(),
          access_token: stravaData.access_token,
          refresh_token: stravaData.refresh_token,
          expires_at: new Date(stravaData.expires_at * 1000).toISOString(),
          estado: 'Activa',
        },
        { onConflict: 'usuario_id,plataforma' }
      );

    if (dbError) {
      console.error('Error guardando en base de datos:', dbError);
      throw dbError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error?.message ?? 'Error inesperado';
    const details = error?.code ? { code: error.code } : undefined;
    console.error('Error crítico en la Edge Function:', message, error);
    return new Response(
      JSON.stringify({ error: message, ...(details && { details }) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
