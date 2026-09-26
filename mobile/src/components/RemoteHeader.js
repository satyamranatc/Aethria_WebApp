import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Settings, LogOut } from 'lucide-react-native';

export default function RemoteHeader({
  isConnected,
  hasDesktopPeer,
  roomId,
  onOpenSettings,
  currentUser,
  onLogout
}) {
  const isReady = isConnected && hasDesktopPeer;

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brandGroup}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>Aethria</Text>
      </View>

      {/* Right Controls */}
      <View style={styles.rightGroup}>
        {/* Status Indicator */}
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isReady ? '#10B981' : isConnected ? '#6366F1' : '#F59E0B' }
            ]}
          />
          <Text style={styles.statusText}>
            {isReady ? 'Studio Synced' : isConnected ? 'Ready' : 'Connecting'}
          </Text>
        </View>

        {/* User Sign Out if authenticated */}
        {currentUser && currentUser.email && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#6E6E73" />
          </TouchableOpacity>
        )}

        {/* Settings */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Settings size={16} color="#6E6E73" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FBFBFD',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)'
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoImage: {
    width: 24,
    height: 24,
    borderRadius: 6
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    letterSpacing: -0.3
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F'
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
