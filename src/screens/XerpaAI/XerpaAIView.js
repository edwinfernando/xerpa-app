import React, { useRef, useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';

const MIN_INPUT_HEIGHT = 50;
const MAX_INPUT_HEIGHT = 150; // ~5 líneas (lineHeight ~22 + padding)

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
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, loading]);

  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    const verticalPadding = 24; // paddingTop + paddingBottom
    const totalHeight = Math.ceil(height) + verticalPadding;
    const clamped = Math.min(Math.max(totalHeight, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT);
    setInputHeight(clamped);
  };

  useEffect(() => {
    if (!input.trim()) setInputHeight(MIN_INPUT_HEIGHT);
  }, [input]);

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
    <ScreenWrapper style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatInner}>
          <FlatList
            ref={flatListRef}
            data={listData}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messagesListWrapper}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={loading ? <TypingIndicator styles={styles} /> : null}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.chatInput, { height: inputHeight }]}
              value={input}
              onChangeText={setInput}
              onContentSizeChange={handleContentSizeChange}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#666"
              multiline
              scrollEnabled
              maxLength={500}
              editable={!loading}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
              blurOnSubmit={false}
              keyboardType="default"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (loading || !input.trim()) && styles.sendButtonDisabled,
              ]}
              onPress={() => sendMessage()}
              disabled={loading || !input.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={22} color="#0D0D0D" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
