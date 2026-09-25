import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Monitor,
  Tablet,
  Smartphone,
  GitPullRequest,
  Save,
  Trash2,
  Code2,
  RotateCcw
} from 'lucide-react-native';
import { THEME } from '../constants/theme';

export default function RemoteControlDeck({
  activeViewport = 'desktop',
  onSelectViewport,
  onTriggerAction
}) {
  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>STUDIO CONTROLS</Text>
        <Text style={styles.sectionSubtitle}>Controls Desktop Canvas</Text>
      </View>

      {/* Viewport Control Bar (Segmented Apple Style) */}
      <View style={styles.viewportRow}>
        <TouchableOpacity
          style={[
            styles.viewportButton,
            activeViewport === 'desktop' && styles.viewportButtonActive
          ]}
          onPress={() => onSelectViewport?.('desktop')}
          activeOpacity={0.7}
        >
          <Monitor
            size={15}
            color={activeViewport === 'desktop' ? THEME.colors.accent : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.viewportText,
              activeViewport === 'desktop' && styles.viewportTextActive
            ]}
          >
            Desktop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewportButton,
            activeViewport === 'tablet' && styles.viewportButtonActive
          ]}
          onPress={() => onSelectViewport?.('tablet')}
          activeOpacity={0.7}
        >
          <Tablet
            size={15}
            color={activeViewport === 'tablet' ? THEME.colors.accent : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.viewportText,
              activeViewport === 'tablet' && styles.viewportTextActive
            ]}
          >
            Tablet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewportButton,
            activeViewport === 'mobile' && styles.viewportButtonActive
          ]}
          onPress={() => onSelectViewport?.('mobile')}
          activeOpacity={0.7}
        >
          <Smartphone
            size={15}
            color={activeViewport === 'mobile' ? THEME.colors.accent : THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.viewportText,
              activeViewport === 'mobile' && styles.viewportTextActive
            ]}
          >
            Mobile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Deck Grid */}
      <View style={styles.actionsGrid}>
        {/* Push to VS Code */}
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardDark]}
          onPress={() => onTriggerAction?.('push_vscode')}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircleDark}>
            <GitPullRequest size={16} color="#FFF" />
          </View>
          <View style={styles.actionCardBody}>
            <Text style={styles.actionCardTitleDark}>Push to VS Code</Text>
            <Text style={styles.actionCardSubDark}>Sync to connected project</Text>
          </View>
        </TouchableOpacity>

        {/* Save Build */}
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardEmerald]}
          onPress={() => onTriggerAction?.('save_build')}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircleEmerald}>
            <Save size={16} color={THEME.colors.emeraldDark} />
          </View>
          <View style={styles.actionCardBody}>
            <Text style={styles.actionCardTitleEmerald}>Save Build</Text>
            <Text style={styles.actionCardSubEmerald}>Preserve speech & code</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Secondary Actions */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onTriggerAction?.('toggle_code')}
          activeOpacity={0.7}
        >
          <Code2 size={13} color={THEME.colors.accent} />
          <Text style={styles.secondaryText}>Code Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onTriggerAction?.('undo')}
          activeOpacity={0.7}
        >
          <RotateCcw size={13} color={THEME.colors.textSecondary} />
          <Text style={styles.secondaryText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, styles.clearBtn]}
          onPress={() => onTriggerAction?.('clear_canvas')}
          activeOpacity={0.7}
        >
          <Trash2 size={13} color={THEME.colors.rose} />
          <Text style={[styles.secondaryText, { color: THEME.colors.rose }]}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    backgroundColor: THEME.colors.background
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8
  },
  sectionSubtitle: {
    fontSize: 10,
    color: THEME.colors.textMuted
  },
  viewportRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.sm
  },
  viewportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: THEME.radius.sm,
    gap: 6
  },
  viewportButtonActive: {
    backgroundColor: THEME.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  viewportText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary
  },
  viewportTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '700'
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.lg,
    gap: 9,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2
  },
  actionCardDark: {
    backgroundColor: THEME.colors.darkButton,
    borderColor: '#1E293B'
  },
  actionCardEmerald: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.emeraldBorder
  },
  iconCircleDark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleEmerald: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.emeraldSubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionCardBody: {
    flex: 1
  },
  actionCardTitleDark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF'
  },
  actionCardSubDark: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 1
  },
  actionCardTitleEmerald: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.emeraldDark
  },
  actionCardSubEmerald: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: 1
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: THEME.spacing.xs
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2
  },
  clearBtn: {
    borderColor: THEME.colors.roseBorder,
    backgroundColor: THEME.colors.roseSubtle
  },
  secondaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary
  }
});
