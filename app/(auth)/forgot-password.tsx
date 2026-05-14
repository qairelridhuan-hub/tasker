import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft color="#000" size={26} strokeWidth={2} />
          </TouchableOpacity>

          {sent ? (
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <CheckCircle color="#000" size={48} strokeWidth={1.5} />
              </View>
              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>
                We sent a password reset link to{'\n'}
                <Text style={{ color: '#000', fontWeight: '600' }}>{email}</Text>
              </Text>
              <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.85}>
                <Text style={styles.btnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password.
              </Text>

              <View style={styles.form}>
                <View>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]}
                  onPress={handleSend} activeOpacity={0.85} disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>Send Reset Link</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  back: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 36, lineHeight: 22 },
  form: { gap: 16 },
  fieldLabel: { fontSize: 12, color: '#999', marginBottom: 6, fontWeight: '500' },
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', paddingHorizontal: 16, fontSize: 15, color: '#000', backgroundColor: '#fff' },
  error: { fontSize: 13, color: '#dc2626' },
  btn: { height: 54, borderRadius: 14, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 60 },
  successIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
