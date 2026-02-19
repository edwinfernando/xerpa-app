import React from 'react';
import { useXerpaAI } from './useXerpaAI';
import { XerpaAIView } from './XerpaAIView';
import { xerpaAIStyles } from './XerpaAIStyles';

export default function XerpaAIScreen({ user }) {
  const { messages, input, setInput, loading, sendMessage } = useXerpaAI(user);

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
