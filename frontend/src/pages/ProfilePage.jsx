import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Sparkles,
  Lock,
  Camera,
  Loader2,
  Trash2,
  Check,
  LogOut,
  Eye,
  EyeOff,
  AlertTriangle,
  Laptop,
  Copy,
  Key
} from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import Footer from '../components/layout/Footer';


export default function ProfilePage({
  user,
  sessions,
  onUpdateUser,
  onClearAllChats,
  onBackToWorkspace,
  onLogout
}) {
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('voicebox_token') || '' : '';

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // Total messages count across all sessions
  const totalMessagesCount = (sessions || []).reduce(
    (acc, s) => acc + (s.messages ? s.messages.length : 0),
    0
  );

  // Robust formatted member join date
  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const updatePayload = {
      name: nameInput.trim(),
      avatar: avatarUrl.trim() || null
    };

    if (currentPassword && newPassword) {
      updatePayload.currentPassword = currentPassword;
      updatePayload.newPassword = newPassword;
    }

    const res = await onUpdateUser(updatePayload);

    setIsSaving(false);

    if (res?.success) {
      setSaveSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(res?.error || 'Failed to update profile settings.');
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-[-apple-system,BlinkMacSystemFont,'Plus_Jakarta_Sans','SF_Pro_Display','Inter',sans-serif] flex flex-col">
      <SEOHead
        title="Profile & Cloud Token Settings — Aethria Intelligence"
        description="Manage your Aethria user account, copy your token for the VS Code extension, and configure neural voice preferences."
        canonicalUrl="https://www.aethria.in/profile"
      />
      <AmbientBackground />

      {/* Apple Frosted Minimalist Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/80 border-b border-black/[0.05] transition-all">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBackToWorkspace || (() => navigate('/chat'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-black/[0.04] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#6366F1]" />
            <span>Workspace</span>
          </button>

          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="Aethria" className="w-6 h-6 object-contain rounded" />
            <span className="font-bold text-sm text-[#0F172A]">Account Profile</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#FF3B30] hover:bg-[#FFF2F2] transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-6 animate-fadeIn">
        
        {/* Profile Card Header */}
        <div className="relative rounded-3xl bg-white border border-black/[0.06] shadow-[0_10px_35px_-10px_rgba(99,102,241,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-8 overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar Profile Photo */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white shadow-md shadow-black/5"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>

            {/* User Identity Details */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                {user?.name || 'Aethria User'}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#64748B] pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>{user?.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Member since {memberDate}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-medium">Conversations</span>
              <span className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                <MessageSquare className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{sessions?.length || 0}</div>
            <p className="text-[11px] text-[#94A3B8]">Saved threads in cloud storage</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-medium">Total Messages</span>
              <span className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{totalMessagesCount}</div>
            <p className="text-[11px] text-[#94A3B8]">Total messages exchanged</p>
          </div>
        </div>

        {/* VS Code Extension Bridge Token Card */}
        <div className="rounded-3xl bg-white border border-black/[0.06] shadow-xs p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shadow-xs flex-shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Aethria VS Code Bridge Token</h3>
                <p className="text-xs text-[#64748B]">Use this token to connect the Aethria VS Code Extension</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyToken}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer flex-shrink-0"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Token Copied!' : 'Copy VS Code Token'}</span>
            </button>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-black/[0.05] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
            <input
              type="password"
              readOnly
              value={token}
              className="flex-1 bg-transparent font-mono text-xs text-[#64748B] outline-none"
            />
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            In VS Code, open the <strong>Aethria Bridge</strong> sidebar, click <strong>Connect Account</strong>, and paste this token.
          </p>
        </div>

        {/* Profile Settings Form */}
        <div className="rounded-3xl bg-white border border-black/[0.06] shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Account Settings</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Update your display information and password</p>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-[#DCFCE7] border border-[#16A34A]/20 rounded-xl text-xs text-[#15803D] flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-[#FFF2F2] border border-[#FF3B30]/20 rounded-xl text-xs text-[#D70015]">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Profile Photo URL
              </label>
              <div className="relative flex items-center">
                <Camera className="absolute left-3.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or image link"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
                />
              </div>
            </div>

            {/* Change Password (Optional) */}
            <div className="pt-2 border-t border-black/[0.05] space-y-3">
              <span className="block text-xs font-bold text-[#0F172A]">Change Password (Optional)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-[#94A3B8] hover:text-[#0F172A]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1E293B] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
