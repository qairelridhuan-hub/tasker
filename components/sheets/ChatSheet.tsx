import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(messages: Message[], mood: string | null): Promise<string> {
  const key = process.env.EXPO_PUBLIC_GROQ_KEY ?? '';

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a warm, emotionally intelligent AI assistant inside a productivity app called Tasker. The user is currently feeling: ${mood ?? 'neutral'}. Be supportive, concise, and helpful. Respond in 2-3 sentences max unless more detail is needed.`,
      },
      ...messages,
    ],
    max_tokens: 250,
    temperature: 0.75,
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Groq error:', err);
    throw new Error(`API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

export default function ChatSheet({ onClose }: { onClose: () => void }) {
  const { mood, moodAdvice } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: moodAdvice
        || `Hi! I'm here to help. You're feeling ${mood?.label ?? 'today'} — what's on your mind?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const reply = await callGroq(history, mood?.label ?? null);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply || "I'm not sure how to answer that. Try rephrasing?" },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't connect. Please check your internet and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
    >
      <View style={s.handle} />
      <Text style={s.title}>AI Chat</Text>
      {mood && <Text style={s.subtitle}>Based on how you're feeling — {mood.label}</Text>}

      <ScrollView
        ref={scrollRef}
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, i) => (
          <View key={i} style={[s.bubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
            <Text style={[s.bubbleText, msg.role === 'user' ? s.userText : s.aiText]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[s.bubble, s.aiBubble, { paddingVertical: 14 }]}>
            <ActivityIndicator size="small" color="#888" />
          </View>
        )}
      </ScrollView>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={send}
          blurOnSubmit={false}
          multiline
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnOff]}
          onPress={send}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Send size={17} color="#fff" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  handle: {
    width: 40, height: 4, backgroundColor: '#E0E0E0',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 3, marginBottom: 12 },

  list: { flex: 1 },
  listContent: { paddingVertical: 8, gap: 8 },

  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  aiBubble:  { alignSelf: 'flex-start', backgroundColor: '#F2F2F2', borderBottomLeftRadius: 4 },
  userBubble:{ alignSelf: 'flex-end',   backgroundColor: '#111',    borderBottomRightRadius: 4 },
  bubbleText:{ fontSize: 14, lineHeight: 20 },
  aiText:    { color: '#111' },
  userText:  { color: '#fff' },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 8, paddingTop: 10, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1, backgroundColor: '#F5F5F5',
    borderRadius: 20, paddingHorizontal: 16,
    paddingTop: 10, paddingBottom: 10,
    fontSize: 14, color: '#111', maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#111', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: '#CCC' },
});
