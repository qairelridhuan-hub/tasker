import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    setError('');
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/onboarding')} activeOpacity={0.7}>
            <ChevronLeft color="#000" size={26} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

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

            <View>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passWrap}>
                <TextInput
                  style={styles.passInput}
                  placeholder="••••••••"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  {showPass
                    ? <EyeOff size={18} color="#aaa" />
                    : <Eye size={18} color="#aaa" />}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={handleSignIn} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotWrap}
              onPress={() => router.push('/(auth)/forgot-password' as any)} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} activeOpacity={0.7}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  back: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 36 },
  form: { gap: 16 },
  fieldLabel: { fontSize: 12, color: '#999', marginBottom: 6, fontWeight: '500' },
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', paddingHorizontal: 16, fontSize: 15, color: '#000', backgroundColor: '#fff', marginHorizontal: 1 },
  passWrap: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', paddingHorizontal: 16, backgroundColor: '#fff', marginHorizontal: 1 },
  passInput: { flex: 1, fontSize: 15, color: '#000', paddingRight: 8 },
  eyeBtn: { paddingLeft: 8 },
  error: { fontSize: 13, color: '#111111' },
  btn: { height: 54, borderRadius: 14, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  forgotWrap: { alignItems: 'center' },
  forgotText: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  switchText: { fontSize: 14, color: '#999' },
  switchLink: { fontSize: 14, color: '#000', fontWeight: '700' },
});
