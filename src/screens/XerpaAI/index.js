import React from 'react';
import { useXerpaAI } from './useXerpaAI';
import { XerpaAIView } from './XerpaAIView';
import { xerpaAIStyles } from './XerpaAIStyles';

export default function XerpaAIScreen({ user, route, onboardingParams, onOnboardingConsumed }) {
  const initialContext = route?.params?.initialContext;
  const { messages, input, setInput, loading, sendMessage } = useXerpaAI(
    user,
    onboardingParams,
    onOnboardingConsumed,
    initialContext
  );

  return (
    <XerpaAIView
      messages={messages}
      input={input}
      setInput={setInput}
      loading={loading}
      sendMessage={sendMessage}
      styles={xerpaAIStyles}
    />
  );
}
