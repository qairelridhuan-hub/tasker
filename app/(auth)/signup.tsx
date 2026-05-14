import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!email.includes('@') || !email.includes('.')) { setError('Enter a valid email address.'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return false; }
    return true;
  }

  async function handleSignUp() {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft color="#000" size={26} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start managing your tasks today</Text>

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
                  style={[styles.input, { flex: 1, borderWidth: 0, paddingRight: 0 }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  {showPass ? <EyeOff size={18} color="#aaa" /> : <Eye size={18} color="#aaa" />}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={styles.passWrap}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, paddingRight: 0 }]}
                  placeholder="Repeat password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={styles.eyeBtn}>
                  {showConfirm ? <EyeOff size={18} color="#aaa" /> : <Eye size={18} color="#aaa" />}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={handleSignUp} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <Text style={styles.terms}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.7}>
              <Text style={styles.switchLink}>Log In</Text>
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
  input: { height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', paddingHorizontal: 16, fontSize: 15, color: '#000', backgroundColor: '#fff' },
  passWrap: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', paddingHorizontal: 16, backgroundColor: '#fff' },
  eyeBtn: { paddingLeft: 8 },
  error: { fontSize: 13, color: '#dc2626' },
  btn: { height: 54, borderRadius: 14, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  terms: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 18 },
  termsLink: { color: '#666', textDecorationLine: 'underline' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  switchText: { fontSize: 14, color: '#999' },
  switchLink: { fontSize: 14, color: '#000', fontWeight: '700' },
});
