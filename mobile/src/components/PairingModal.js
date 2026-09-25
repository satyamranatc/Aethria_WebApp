import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X, Radio, Server, KeyRound, Check } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function PairingModal({
  visible,
  onClose,
  initialServerUrl,
  initialRoomId,
  onSave
}) {
  const [serverUrl, setServerUrl] = useState(initialServerUrl || 'https://aethria-backend.onrender.com');
  const [roomId, setRoomId] = useState(initialRoomId || 'AETH-STUDIO');

  const handleApply = () => {
    onSave({
      serverUrl: serverUrl.trim(),
      roomId: roomId.trim().toUpperCase()
    });
    onClose();
  };

  const handleQuickHost = (preset) => {
    setServerUrl(preset);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.iconCircle}>
                <Radio size={15} color={THEME.colors.accent} />
              </View>
              <Text style={styles.headerTitle}>Studio Sync Pairing</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.body}>
            {/* Room Code */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <KeyRound size={12} color={THEME.colors.accent} /> Studio Pairing Code
              </Text>
              <TextInput
                style={styles.input}
                value={roomId}
                onChangeText={setRoomId}
                placeholder="e.g. AETH-STUDIO"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Text style={styles.hint}>
                Matches the Room Code displayed in your Desktop Voice Studio header.
              </Text>
            </View>

            {/* Server API URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                <Server size={12} color={THEME.colors.emeraldDark} /> Real-Time Sync Host
              </Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://aethria-backend.onrender.com"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>
                Default is live production backend: https://aethria-backend.onrender.com
              </Text>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickHost('https://aethria-backend.onrender.com')}
              >
                <Text style={styles.presetText}>Render Cloud (Default)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickHost('https://api.aethria.in')}
              >
                <Text style={styles.presetText}>api.aethria.in</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickHost('http://10.0.2.2:5000')}
              >
                <Text style={styles.presetText}>Local Emulator</Text>
              </TouchableOpacity>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.applyButtonText}>Connect to Voice Studio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingBottom: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary
  },
  closeBtn: {
    padding: 6
  },
  body: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md
  },
  formGroup: {
    gap: 5
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.radius.md,
    color: THEME.colors.textPrimary,
    fontSize: 13,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontFamily: 'monospace'
  },
  hint: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    lineHeight: 14
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2
  },
  presetChip: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.full
  },
  presetText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600'
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.darkButton,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    marginTop: THEME.spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
