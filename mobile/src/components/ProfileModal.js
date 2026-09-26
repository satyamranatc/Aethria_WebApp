import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { User, Mail, Server, LogOut, X, ShieldCheck } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function ProfileModal({
  visible,
  onClose,
  currentUser,
  serverUrl,
  activeProject,
  onLogout
}) {
  const name = currentUser?.name || 'Developer';
  const email = currentUser?.email || 'Authenticated Session';
  const initial = (name.charAt(0) || 'U').toUpperCase();

  const handleSignOut = () => {
    onClose();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Account Profile</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#6E6E73" />
                </TouchableOpacity>
              </View>

              {/* Profile Hero */}
              <View style={styles.profileHero}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.heroMeta}>
                  <Text style={styles.userName} numberOfLines={1}>{name}</Text>
                  <View style={styles.statusBadge}>
                    <ShieldCheck size={11} color="#34C759" />
                    <Text style={styles.statusText}>Cloud Verified</Text>
                  </View>
                </View>
              </View>

              {/* Details List */}
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconWrapper}>
                    <Mail size={14} color="#6E6E73" />
                  </View>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{email}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailIconWrapper}>
                    <Server size={14} color="#6E6E73" />
                  </View>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Aethria Cloud Server</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{serverUrl || 'https://aethria-backend.onrender.com'}</Text>
                  </View>
                </View>

                {activeProject && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrapper}>
                        <User size={14} color="#6E6E73" />
                      </View>
                      <View style={styles.detailInfo}>
                        <Text style={styles.detailLabel}>Active Project</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {activeProject.name} ({activeProject.framework || 'React'})
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionsGroup}>
                <TouchableOpacity
                  style={styles.signOutBtn}
                  onPress={handleSignOut}
                  activeOpacity={0.8}
                >
                  <LogOut size={16} color="#FF3B30" style={{ marginRight: 6 }} />
                  <Text style={styles.signOutText}>Sign Out of Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.2
  },
  closeBtn: {
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#F4F5F7'
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)'
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  heroMeta: {
    flex: 1
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    marginBottom: 4
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#248A3D'
  },
  detailsBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6
  },
  detailIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)'
  },
  detailInfo: {
    flex: 1
  },
  detailLabel: {
    fontSize: 10,
    color: '#86868B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 1
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginVertical: 4
  },
  actionsGroup: {
    gap: 8
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    paddingVertical: 12,
    borderRadius: 14
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30'
  }
});
