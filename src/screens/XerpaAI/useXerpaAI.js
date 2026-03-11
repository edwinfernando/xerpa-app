import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutAnimation } from 'react-native';
import { supabase } from '../../../supabase';
import { useDeviceContext } from '../../hooks/useDeviceContext';
import { useUserContext } from '../../context/UserContext';
import { buildN8nPayload } from '../../utils/buildN8nPayload';

const CHAT_ENDPOINT = 'https://untremulent-isoagglutinative-irving.ngrok-free.dev/webhook/chat';

const PLAN_GENERADO_PHRASE = 'Tu primer plan de entrenamiento semanal ha sido generado';
const ONBOARDING_COMPLETE_KEYWORDS = [
  'perfil ha sido configurado',
  'perfil configurado',
  'plan de entrenamiento ha sido generado',
  'plan generado',
  'configuración completada',
  'perfil completado',
];

function isOnboardingCompleteMessage(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return ONBOARDING_COMPLETE_KEYWORDS.some((kw) => lower.includes(kw));
}

function mapIntensityToColor(intensityHint) {
  switch (intensityHint) {
    case 'neon_green':
      return '#39FF14';
    case 'neon_red':
      return '#ff5252';
    case 'neon_cyan':
    case 'neon_blue':
      return '#00F0FF';
    case 'neon_orange':
      return '#ff9800';
    case 'neon_yellow':
      return '#ffca28';
    default:
      return '#39FF14';
  }
}

export function useXerpaAI(user, onboardingParams, onOnboardingConsumed, initialContext) {
  const { location, pushToken } = useDeviceContext();
  const { refreshUserData } = useUserContext();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Hola! Soy Xerpa, tu guía invisible. ¿En qué puedo ayudarte hoy?',
      role: 'assistant',
      intensityHint: 'neon_green',
      borderColor: '#39FF14',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rol, setRol] = useState('Atleta');
  const onboardingSentRef = useRef(false);

  useEffect(() => {
    async function fetchRol() {
      if (!user?.id) return;
      const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.rol) setRol(data.rol);
    }
    fetchRol();
  }, [user?.id]);

  const sendMessage = useCallback(async (overrideText, rolOverride) => {
    const textToProcess = typeof overrideText === 'string' ? overrideText : input;
    const text = (textToProcess ?? '').toString().trim();
    if (!text || !user?.id) return;

    const effectiveRol = rolOverride ?? rol;

    const userMsg = {
      id: Date.now().toString(),
      text,
      role: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    if (typeof overrideText !== 'string') setInput('');
    setLoading(true);

    try {
      const body = buildN8nPayload({
        userId: user.id,
        mensaje: text,
        rol: effectiveRol,
        location,
        pushToken,
        includeMessageAlias: true,
      });

      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      const answer = json?.answer ?? 'No pude procesar tu mensaje.';
      const metadata = json?.metadata ?? {};
      const intensityHint = metadata?.intensity_hint ?? 'neon_green';
      const action = metadata?.action;

      if (action === 'update_profile' || action === 'suggest_rpe') {
        console.log('[Xerpa AI] Action:', action, metadata);
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: answer,
        role: 'assistant',
        intensityHint,
        borderColor: mapIntensityToColor(intensityHint),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (answer.includes(PLAN_GENERADO_PHRASE) || isOnboardingCompleteMessage(answer) || metadata?.action === 'update_profile') {
        await refreshUserData();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    } catch (err) {
      console.error('[Xerpa AI] Error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: 'Error de conexión. Intenta de nuevo.',
        role: 'assistant',
        intensityHint: 'neon_red',
        borderColor: '#ff5252',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, user?.id, rol, location, pushToken, refreshUserData]);

  useEffect(() => {
    if (!onboardingParams?.isNewUser || !onboardingParams?.userRole || !user?.id || onboardingSentRef.current) return;
    onboardingSentRef.current = true;
    const rolLabel = onboardingParams.userRole === 'Tutor' ? 'Padre/Tutor' : onboardingParams.userRole;
    const welcomeText = `Hola XERPA, soy un nuevo ${rolLabel}. Ayúdame a configurar mi perfil.`;
    sendMessage(welcomeText, onboardingParams.userRole);
    onOnboardingConsumed?.();
  }, [onboardingParams?.isNewUser, onboardingParams?.userRole, user?.id, sendMessage]);

  useEffect(() => {
    if (initialContext && typeof initialContext === 'string') {
      setInput(initialContext);
    }
  }, [initialContext]);

  return {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
  };
}
