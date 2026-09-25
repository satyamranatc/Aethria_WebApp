import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Wifi, WifiOff, Settings, LogOut, User } from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function RemoteHeader({
  isConnected,
  hasDesktopPeer,
  roomId,
  desktopState,
  onOpenSettings,
  currentUser,
  onLogout
}) {
  const isReady = isConnected && hasDesktopPeer;

  return (
    <View style={styles.container}>
      {/* Top Navbar Row */}
      <View style={styles.cardHeader}>
        {/* Brand Group */}
        <View style={styles.brandGroup}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.brandTextGroup}>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Aethria</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>3.0</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Voice Studio Remote</Text>
          </View>
        </View>

        {/* Right Actions: User & Room Tag */}
        <View style={styles.rightActions}>
          {currentUser && (
            <TouchableOpacity
              style={styles.userBadge}
              onPress={onLogout}
              activeOpacity={0.7}
              title="Tap to sign out"
            >
              <User size={11} color={THEME.colors.accent} />
              <Text style={styles.userName} numberOfLines={1}>
                {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
              </Text>
              <LogOut size={10} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.roomTag}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isReady ? THEME.colors.emerald : THEME.colors.amber }
              ]}
            />
            <Text style={styles.roomText}>{roomId || 'NOT PAIRED'}</Text>
            <Settings size={11} color={THEME.colors.textMuted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Desktop Sync Banner */}
      <View
        style={[
          styles.syncBanner,
          {
            backgroundColor: isReady
              ? THEME.colors.emeraldSubtle
              : THEME.colors.amberSubtle,
            borderColor: isReady
              ? THEME.colors.emeraldBorder
              : THEME.colors.amberBorder
          }
        ]}
      >
        <View style={styles.bannerLeft}>
          {isReady ? (
            <Wifi size={12} color={THEME.colors.emeraldDark} />
          ) : (
            <WifiOff size={12} color={THEME.colors.amber} />
          )}
          <Text
            style={[
              styles.bannerText,
              { color: isReady ? THEME.colors.emeraldDark : THEME.colors.amber }
            ]}
            numberOfLines={1}
          >
            {isReady
              ? desktopState?.status === 'thinking'
                ? 'Desktop Studio: Generating UI...'
                : desktopState?.title
                ? `Desktop: ${desktopState.title}`
                : 'Desktop Studio Synced & Live'
              : isConnected
              ? 'Waiting for Desktop Studio to open...'
              : 'Disconnected from Backend Server'}
          </Text>
        </View>

        {isReady && desktopState?.status === 'thinking' && (
          <View style={styles.thinkingPill}>
            <Text style={styles.thinkingText}>AI Live</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xs,
    backgroundColor: THEME.colors.background
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoWrapper: {
    width: 28,
    height: 28,
    borderRadius: THEME.radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  logoImage: {
    width: 22,
    height: 22
  },
  brandTextGroup: {
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3
  },
  versionBadge: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder
  },
  versionText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textSecondary
  },
  brandSubtitle: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: -1
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder
  },
  userName: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    maxWidth: 55
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  roomText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    fontFamily: 'monospace'
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    borderWidth: 1
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '600'
  },
  thinkingPill: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.full
  },
  thinkingText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700'
  }
});
