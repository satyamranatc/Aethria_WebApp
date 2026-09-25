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
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Radio, Sparkles } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function AuthSplashScreen({
  onAuthSuccess,
  onSkipAuth,
  serverUrl,
  onOpenServerConfig
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
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
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      onAuthSuccess({
        token: data.token,
        user: data.user || { name: name || 'Aethria Developer', email }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to Aethria server.');
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
        {/* Brand Splash Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Aethria</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>3.0</Text>
            </View>
          </View>

          <Text style={styles.brandTagline}>
            Voice-Driven Live Workspace
          </Text>
          <Text style={styles.brandSubDescription}>
            Handheld remote controller for Aethria Voice Studio
          </Text>
        </View>

        {/* Clean Apple White Card */}
        <View style={styles.authCard}>
          {/* Tabs */}
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
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error notice */}
          {errorMessage && (
            <View style={styles.errorNotice}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formFields}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <User size={16} color={THEME.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Satyam Rana"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputBox}>
                <Mail size={16} color={THEME.colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="developer@aethria.in"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputBox}>
                <Lock size={16} color={THEME.colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••••••"
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
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Sign In to Aethria' : 'Create Aethria Account'}
                  </Text>
                  <ArrowRight size={15} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Guest Connect */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={onSkipAuth}
              activeOpacity={0.7}
            >
              <Sparkles size={14} color={THEME.colors.accent} />
              <Text style={styles.guestButtonText}>
                Quick Connect as Remote Controller
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server Host Pill */}
        <TouchableOpacity
          style={styles.serverPill}
          onPress={onOpenServerConfig}
          activeOpacity={0.7}
        >
          <Radio size={12} color={THEME.colors.textMuted} />
          <Text style={styles.serverText}>Connected Host: {serverUrl}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: THEME.radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6
  },
  logoImage: {
    width: 44,
    height: 44
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5
  },
  versionBadge: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSecondary
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 2
  },
  brandSubDescription: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center'
  },
  authCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 3,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radius.sm
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary
  },
  tabTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '700'
  },
  errorNotice: {
    backgroundColor: THEME.colors.roseSubtle,
    borderColor: THEME.colors.roseBorder,
    borderWidth: 1,
    borderRadius: THEME.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: THEME.spacing.sm
  },
  errorText: {
    color: THEME.colors.rose,
    fontSize: 11,
    fontWeight: '500'
  },
  formFields: {
    gap: 12
  },
  inputGroup: {
    gap: 4
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingHorizontal: 12
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: THEME.colors.textPrimary,
    fontSize: 13
  },
  eyeBtn: {
    padding: 6
  },
  submitButton: {
    backgroundColor: THEME.colors.darkButton,
    paddingVertical: 13,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.surfaceBorder
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingVertical: 11,
    borderRadius: THEME.radius.md,
    gap: 6
  },
  guestButtonText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 18
  },
  serverText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontFamily: 'monospace'
  }
});
