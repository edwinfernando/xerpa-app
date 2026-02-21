import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabase';
import { useDeviceContext } from '../../hooks/useDeviceContext';
import { buildN8nPayload } from '../../utils/buildN8nPayload';

const CHAT_ENDPOINT = 'https://untremulent-isoagglutinative-irving.ngrok-free.dev/webhook/chat';

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

export function useXerpaAI(user) {
  const { location, pushToken } = useDeviceContext();
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

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !user?.id) return;

    const userMsg = {
      id: Date.now().toString(),
      text,
      role: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const body = buildN8nPayload({
        userId: user.id,
        mensaje: text,
        rol,
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
  }, [input, user?.id, rol, location, pushToken]);

  return {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
  };
}
