import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Monitor, Smartphone, ArrowUpRight, RotateCcw, Trash2 } from 'lucide-react-native';

export default function RemoteControlDeck({
  activeViewport = 'desktop',
  onSelectViewport,
  onTriggerAction
}) {
  return (
    <View style={styles.container}>
      {/* Top Row: Segmented Viewport Switcher & Clear/Undo */}
      <View style={styles.topRow}>
        {/* Segmented Viewport */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeViewport === 'desktop' && styles.segmentItemActive
            ]}
            onPress={() => onSelectViewport?.('desktop')}
            activeOpacity={0.7}
          >
            <Monitor
              size={13}
              color={activeViewport === 'desktop' ? '#1D1D1F' : '#86868B'}
            />
            <Text
              style={[
                styles.segmentText,
                activeViewport === 'desktop' && styles.segmentTextActive
              ]}
            >
              Desktop
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeViewport === 'mobile' && styles.segmentItemActive
            ]}
            onPress={() => onSelectViewport?.('mobile')}
            activeOpacity={0.7}
          >
            <Smartphone
              size={13}
              color={activeViewport === 'mobile' ? '#1D1D1F' : '#86868B'}
            />
            <Text
              style={[
                styles.segmentText,
                activeViewport === 'mobile' && styles.segmentTextActive
              ]}
            >
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Utility Tools */}
        <View style={styles.utilityGroup}>
          <TouchableOpacity
            style={styles.utilityButton}
            onPress={() => onTriggerAction?.('undo')}
            activeOpacity={0.7}
            title="Undo"
          >
            <RotateCcw size={14} color="#6E6E73" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.utilityButton}
            onPress={() => onTriggerAction?.('clear_canvas')}
            activeOpacity={0.7}
            title="Clear canvas"
          >
            <Trash2 size={14} color="#6E6E73" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Action Bar */}
      <View style={styles.actionRow}>
        {/* Sync to VS Code (Primary Dark Pill) */}
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => onTriggerAction?.('push_vscode')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>Sync to VS Code</Text>
          <ArrowUpRight size={15} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Save Design */}
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => onTriggerAction?.('save_build')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryActionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FBFBFD'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EEEEF0',
    borderRadius: 12,
    padding: 3,
    flex: 1,
    maxWidth: 200
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: 9
  },
  segmentItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#86868B'
  },
  segmentTextActive: {
    color: '#1D1D1F',
    fontWeight: '600'
  },
  utilityGroup: {
    flexDirection: 'row',
    gap: 8
  },
  utilityButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  primaryAction: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1D1D1F',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingVertical: 12,
    borderRadius: 14
  },
  secondaryActionText: {
    color: '#1D1D1F',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2
  }
});
