import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SendHorizontal } from 'lucide-react-native';

function TypingIndicator({ styles }) {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color="#39FF14" />
        <Text style={styles.typingText}>Xerpa está escribiendo...</Text>
      </View>
    </View>
  );
}

export function XerpaAIView({ messages, input, setInput, loading, sendMessage, styles }) {
  const flatListRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, loading]);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const borderColor = item.borderColor || '#39FF14';

    if (isUser) {
      return (
        <View style={styles.bubbleUser}>
          <Text style={styles.bubbleTextUser}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.bubbleAssistant, { borderColor, shadowColor: borderColor }]}>
        <Text style={styles.bubbleTextAssistant}>{item.text}</Text>
      </View>
    );
  };

  const listData = loading ? [...messages] : messages;

  return (
    <ScreenWrapper style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? <TypingIndicator styles={styles} /> : null}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            submitBehavior="submit"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={loading || !input.trim()}
          >
            <SendHorizontal color="#121212" size={22} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
