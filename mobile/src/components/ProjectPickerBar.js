import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Folder,
  Plus,
  Check,
  ChevronDown,
  X,
  Code2,
  Layers,
  ArrowUpRight
} from 'lucide-react-native';

export default function ProjectPickerBar({
  projects = [],
  activeProject = null,
  onSelectProject,
  onCreateProject,
  isLoading = false,
  desktopState = null,
  onTriggerVsCodeSync
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFramework, setNewProjectFramework] = useState('React');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Project Name Required', 'Please enter a name for your new project.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onCreateProject({
        name: newProjectName.trim(),
        framework: newProjectFramework,
        language: 'javascript'
      });
      if (created) {
        setIsCreateMode(false);
        setNewProjectName('');
        setIsModalOpen(false);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVsCodeLinked = Boolean(
    activeProject?.workspacePath || desktopState?.activeProjectWorkspace
  );

  return (
    <>
      {/* Compact Top Project Status Bar */}
      <View style={styles.statusBarContainer}>
        <TouchableOpacity
          style={styles.projectButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.projectLeft}>
            <View style={[styles.folderIconBadge, !activeProject && styles.folderIconInactive]}>
              <Folder size={13} color={activeProject ? '#4F46E5' : '#8E8E93'} />
            </View>
            <View style={styles.projectNameBlock}>
              <Text style={styles.projectLabel}>ACTIVE CLOUD PROJECT</Text>
              <Text style={styles.projectName} numberOfLines={1}>
                {activeProject ? activeProject.name : 'Select or Create a Project...'}
              </Text>
            </View>
          </View>

          <View style={styles.projectRight}>
            {activeProject?.framework && (
              <View style={styles.frameworkBadge}>
                <Text style={styles.frameworkText}>{activeProject.framework}</Text>
              </View>
            )}
            <ChevronDown size={14} color="#8E8E93" />
          </View>
        </TouchableOpacity>

        {/* VS Code Quick Linked Pill */}
        {activeProject && (
          <View style={styles.statsRow}>
            <View style={styles.vsCodeStat}>
              <View
                style={[
                  styles.vsCodeDot,
                  { backgroundColor: isVsCodeLinked ? '#10B981' : '#F59E0B' }
                ]}
              />
              <Text style={styles.vsCodeText} numberOfLines={1}>
                {isVsCodeLinked ? 'VS Code Workspace Linked' : 'Cloud Workspace (Not in VS Code)'}
              </Text>
            </View>

            {isVsCodeLinked && onTriggerVsCodeSync && (
              <TouchableOpacity
                style={styles.quickPushBtn}
                onPress={onTriggerVsCodeSync}
                activeOpacity={0.7}
              >
                <Text style={styles.quickPushText}>Push</Text>
                <ArrowUpRight size={11} color="#4F46E5" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Projects Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color="#1D1D1F" />
                <Text style={styles.modalTitle}>Cloud Projects</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsModalOpen(false);
                  setIsCreateMode(false);
                }}
                style={styles.closeBtn}
              >
                <X size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* List or Create Form */}
            {!isCreateMode ? (
              <View style={styles.listContainer}>
                <Text style={styles.sectionSubtitle}>
                  Choose a project to pair-program with on Voice Studio.
                </Text>

                {isLoading ? (
                  <View style={styles.loaderBox}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                    <Text style={styles.loaderText}>Loading cloud projects...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.projectsScroll} showsVerticalScrollIndicator={false}>
                    {projects.map((proj) => {
                      const isSelected = activeProject && (activeProject._id === proj._id || activeProject.id === proj._id);
                      return (
                        <TouchableOpacity
                          key={proj._id || proj.id}
                          style={[styles.projectCard, isSelected && styles.projectCardSelected]}
                          onPress={() => {
                            onSelectProject(proj);
                            setIsModalOpen(false);
                          }}
                          activeOpacity={0.75}
                        >
                          <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                                {proj.name}
                              </Text>
                              <Text style={styles.cardSub}>
                                {proj.workspacePath ? `Local: ${proj.workspacePath.split('/').slice(-2).join('/')}` : 'Cloud Only'}
                              </Text>
                            </View>
                            {isSelected && (
                              <View style={styles.checkCircle}>
                                <Check size={13} color="#FFFFFF" strokeWidth={2.6} />
                              </View>
                            )}
                          </View>

                          <View style={styles.cardFooter}>
                            <View style={styles.tag}>
                              <Code2 size={11} color="#6E6E73" />
                              <Text style={styles.tagText}>{proj.framework || 'React'}</Text>
                            </View>
                            {proj.filesCount !== undefined && (
                              <Text style={styles.fileCountText}>{proj.filesCount} files</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {projects.length === 0 && (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No Projects Found</Text>
                        <Text style={styles.emptySub}>
                          Create a project to start voice pair programming.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}

                {/* Create Project Button */}
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setIsCreateMode(true)}
                  activeOpacity={0.85}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create New Cloud Project</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Create Project Form */
              <View style={styles.formContainer}>
                <Text style={styles.sectionSubtitle}>
                  Create a new Aethria project for your voice builds.
                </Text>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Project Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Luxury Real Estate, AI Dashboard"
                    placeholderTextColor="#8E8E93"
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    autoFocus
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Framework</Text>
                  <View style={styles.frameworkPickerRow}>
                    {['React', 'Next.js', 'Vanilla HTML'].map((fw) => (
                      <TouchableOpacity
                        key={fw}
                        style={[
                          styles.frameworkChoice,
                          newProjectFramework === fw && styles.frameworkChoiceActive
                        ]}
                        onPress={() => setNewProjectFramework(fw)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.frameworkChoiceText,
                            newProjectFramework === fw && styles.frameworkChoiceTextActive
                          ]}
                        >
                          {fw}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsCreateMode(false)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitBtn, !newProjectName.trim() && styles.submitBtnDisabled]}
                    onPress={handleCreateSubmit}
                    disabled={isSubmitting || !newProjectName.trim()}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Create Project</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  statusBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)'
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)'
  },
  projectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  folderIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  folderIconInactive: {
    backgroundColor: '#E5E5EA'
  },
  projectNameBlock: {
    flex: 1
  },
  projectLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#86868B',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  projectName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  projectRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  frameworkBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  frameworkText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5'
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4
  },
  vsCodeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  vsCodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  vsCodeText: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500'
  },
  quickPushBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  quickPushText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  closeBtn: {
    padding: 4
  },
  listContainer: {
    padding: 20
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6E6E73',
    marginBottom: 14
  },
  loaderBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10
  },
  loaderText: {
    fontSize: 12,
    color: '#86868B'
  },
  projectsScroll: {
    maxHeight: 280
  },
  projectCard: {
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  projectCardSelected: {
    backgroundColor: 'rgba(79, 70, 229, 0.04)',
    borderColor: '#4F46E5'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  cardTitleSelected: {
    color: '#4F46E5'
  },
  cardSub: {
    fontSize: 11,
    color: '#86868B',
    marginTop: 2
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)'
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  tagText: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500'
  },
  fileCountText: {
    fontSize: 11,
    color: '#8E8E93'
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginTop: 12
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  formContainer: {
    padding: 20
  },
  formField: {
    marginBottom: 16
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6
  },
  fieldInput: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: '#1D1D1F'
  },
  frameworkPickerRow: {
    flexDirection: 'row',
    gap: 8
  },
  frameworkChoice: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  frameworkChoiceActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    borderColor: '#4F46E5'
  },
  frameworkChoiceText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6E6E73'
  },
  frameworkChoiceTextActive: {
    color: '#4F46E5',
    fontWeight: '600'
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F7'
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73'
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4F46E5'
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
