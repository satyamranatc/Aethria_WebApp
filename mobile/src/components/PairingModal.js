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
import { X, Check } from 'lucide-react-native';

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
            <Text style={styles.headerTitle}>Connection</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.body}>
            {/* Room Code */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Room Code</Text>
              <TextInput
                style={styles.input}
                value={roomId}
                onChangeText={setRoomId}
                placeholder="AETH-STUDIO"
                placeholderTextColor="#8E8E93"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Server URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Server URL</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://aethria-backend.onrender.com"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} strokeWidth={2.4} />
              <Text style={styles.applyButtonText}>Save & Connect</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    letterSpacing: -0.2
  },
  closeBtn: {
    padding: 4
  },
  body: {
    padding: 20,
    gap: 16
  },
  formGroup: {
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#86868B',
    letterSpacing: -0.1
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    color: '#1D1D1F',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1D1F',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1
  }
});

