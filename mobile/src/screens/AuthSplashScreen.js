import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Radio } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function AuthSplashScreen({
  onAuthSuccess,
  onSkipAuth,
  serverUrl,
  onOpenServerConfig
}) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter email and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email: email.trim(), password }
      : { name: name.trim(), email: email.trim(), password };

    try {
      const res = await fetch(`${serverUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onAuthSuccess({
        token: data.token,
        user: data.user || { name: name || 'Developer', email }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to reach Aethria service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emblem Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandTitle}>Aethria</Text>
          <Text style={styles.brandSubtitle}>Voice Studio Remote</Text>
        </View>

        {/* Primary Clean Apple Action Card */}
        <View style={styles.actionCard}>
          {!showEmailForm ? (
            <View style={styles.quickAccessSection}>
              {/* Primary One-Tap Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onSkipAuth}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Connect to Studio</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Secondary Clean Option */}
              <TouchableOpacity
                style={styles.secondaryOption}
                onPress={() => setShowEmailForm(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryOptionText}>Sign in with account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              {/* Mode Switcher */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
                  onPress={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, mode === 'register' && styles.tabButtonActive]}
                  onPress={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                    New Account
                  </Text>
                </TouchableOpacity>
              </View>

              {errorMessage && (
                <View style={styles.errorNotice}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Input Fields */}
              <View style={styles.formFields}>
                {mode === 'register' && (
                  <View style={styles.inputBox}>
                    <User size={16} color={THEME.colors.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Name"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputBox}>
                  <Mail size={16} color={THEME.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputBox}>
                  <Lock size={16} color={THEME.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color={THEME.colors.textMuted} />
                    ) : (
                      <Eye size={16} color={THEME.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backOption}
                  onPress={() => setShowEmailForm(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backOptionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Minimal subtle host info */}
        <TouchableOpacity
          style={styles.hostPill}
          onPress={onOpenServerConfig}
          activeOpacity={0.7}
        >
          <View style={styles.hostIndicator} />
          <Text style={styles.hostText}>Render Cloud Live</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFD'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 36
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    marginBottom: 20
  },
  logoImage: {
    width: 52,
    height: 52
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6E6E73',
    marginTop: 4,
    letterSpacing: -0.1
  },
  actionCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3
  },
  quickAccessSection: {
    alignItems: 'center',
    gap: 16
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1D1D1F',
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  secondaryOption: {
    paddingVertical: 8
  },
  secondaryOptionText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '500'
  },
  formContainer: {
    width: '100%'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E73'
  },
  tabTextActive: {
    color: '#1D1D1F',
    fontWeight: '600'
  },
  formFields: {
    gap: 10
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFD',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1D1D1F'
  },
  eyeBtn: {
    padding: 6
  },
  submitButton: {
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  backOption: {
    alignItems: 'center',
    paddingVertical: 6
  },
  backOptionText: {
    fontSize: 12,
    color: '#6E6E73'
  },
  errorNotice: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center'
  },
  hostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.03)'
  },
  hostIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  hostText: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500'
  }
});
