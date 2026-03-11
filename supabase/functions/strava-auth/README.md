# strava-auth

Edge Function que intercambia el código OAuth 2.0 de Strava por tokens y los guarda en `integraciones_terceros`.

## Secrets requeridos

Configurar en Supabase Dashboard → Edge Functions → strava-auth → Secrets:

- `STRAVA_CLIENT_ID` — ID de tu app en https://www.strava.com/settings/api
- `STRAVA_CLIENT_SECRET` — Secret de tu app en Strava

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_ANON_KEY` se inyectan automáticamente por Supabase.

## Despliegue

```bash
supabase functions deploy strava-auth
```

La función usa `verify_jwt = false` en `supabase/config.toml` para evitar 401 con JWT ES256.

## Migración

Ejecutar la migración que añade columnas `access_token`, `refresh_token`, `expires_at`:

```bash
supabase db push
```
