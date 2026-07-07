import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, User, Lock, Globe, AtSign, FileText,
  Eye, EyeOff, Check, Loader2, Send, Shield, ChevronRight,
  LayoutTemplate, Upload, Camera, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { LevelBadgeImage } from '@/components/features/LevelBadge';

// ─── OTP password change flow states ─────────────────────────────────────────
type PasswordStep = 'idle' | 'sending' | 'verify' | 'verifying' | 'set' | 'saving';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // ── Profile fields ──────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDragOver, setAvatarDragOver] = useState(false);

  // ── Cover upload ─────────────────────────────────────────────────────────────
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverDragOver, setCoverDragOver] = useState(false);

  // ── Password change ─────────────────────────────────────────────────────────
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
      setAvatarUrl(profile.avatar_url || '');
      setCoverUrl(profile.cover_url || '');
      setAvatarPreview(null);
      setCoverPreview(null);
    }
  }, [profile]);

  // Track dirty state
  useEffect(() => {
    if (!profile) return;
    const dirty =
      username !== (profile.username || '') ||
      bio !== (profile.bio || '') ||
      website !== (profile.website || '') ||
      avatarUrl !== (profile.avatar_url || '') ||
      coverUrl !== (profile.cover_url || '');
    setProfileDirty(dirty);
  }, [username, bio, website, avatarUrl, coverUrl, profile]);

  // ── Save profile ────────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!user || !profileDirty) return;
    setSavingProfile(true);

    const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!trimmed) { toast.error('Username cannot be empty'); setSavingProfile(false); return; }
    if (trimmed.length < 3) { toast.error('Username must be at least 3 characters'); setSavingProfile(false); return; }

    // Check username uniqueness if changed
    if (trimmed !== profile?.username) {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', user.id)
        .single();
      if (existing) {
        toast.error('That username is already taken');
        setSavingProfile(false);
        return;
      }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        username: trimmed,
        bio: bio.trim() || null,
        website: website.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        cover_url: coverUrl.trim() || null,
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      await refreshProfile();
      toast.success('Profile updated');
      setProfileDirty(false);
    }
    setSavingProfile(false);
  }

  // ── Avatar upload handler ────────────────────────────────────────────────────
  async function handleAvatarFile(file: File | null) {
    if (!file || !user) return;

    // Validate
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, or GIF images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setAvatarUploading(true);
    setAvatarProgress(0);

    // Simulate progress ticks while uploading
    const progressInterval = setInterval(() => {
      setAvatarProgress(p => Math.min(p + 12, 85));
    }, 120);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      clearInterval(progressInterval);

      if (uploadError) {
        toast.error('Upload failed: ' + uploadError.message);
        setAvatarPreview(null);
        setAvatarUploading(false);
        setAvatarProgress(0);
        return;
      }

      setAvatarProgress(100);

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      // Save immediately to DB
      const { error: saveError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (saveError) {
        toast.error('Saved image but failed to update profile');
      } else {
        setAvatarUrl(publicUrl);
        await refreshProfile();
        toast.success('Avatar updated!');
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setAvatarUploading(false);
        setAvatarProgress(0);
      }, 600);
    }
  }

  // ── Cover upload handler ─────────────────────────────────────────────────────
  async function handleCoverFile(file: File | null) {
    if (!file || !user) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be under 5 MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    setCoverUploading(true);
    setCoverProgress(0);

    const progressInterval = setInterval(() => {
      setCoverProgress(p => Math.min(p + 10, 85));
    }, 130);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/cover_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(path, file, { upsert: true, contentType: file.type });

      clearInterval(progressInterval);

      if (uploadError) {
        toast.error('Upload failed: ' + uploadError.message);
        setCoverPreview(null);
        setCoverUploading(false);
        setCoverProgress(0);
        return;
      }

      setCoverProgress(100);

      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      const { error: saveError } = await supabase
        .from('user_profiles')
        .update({ cover_url: publicUrl })
        .eq('id', user.id);

      if (saveError) {
        toast.error('Saved image but failed to update profile');
      } else {
        setCoverUrl(publicUrl);
        await refreshProfile();
        toast.success('Cover updated!');
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setCoverUploading(false);
        setCoverProgress(0);
      }, 600);
    }
  }

  // ── OTP: request code ───────────────────────────────────────────────────────
  async function handleRequestOtp() {
    if (!user) return;
    setPasswordStep('sending');
    setOtpError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      toast.error(error.message);
      setPasswordStep('idle');
    } else {
      toast.success('Verification code sent to ' + user.email);
      setPasswordStep('verify');
    }
  }

  // ── OTP: verify code ────────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    if (!user || otpCode.length !== 4) { setOtpError('Enter the 4-digit code'); return; }
    setPasswordStep('verifying');
    setOtpError('');
    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token: otpCode,
      type: 'email',
    });
    if (error) {
      setOtpError('Invalid or expired code. Try again.');
      setPasswordStep('verify');
    } else {
      setPasswordStep('set');
    }
  }

  // ── Set new password ────────────────────────────────────────────────────────
  async function handleSetPassword() {
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setPasswordStep('saving');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      setPasswordStep('set');
    } else {
      toast.success('Password updated successfully');
      setPasswordStep('idle');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  if (!user || !profile) return null;

  const level = getLevel(profile.tella_balance);
  const levelCfg = LEVEL_CONFIG[level];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif font-bold text-2xl text-foreground flex items-center gap-2.5 mb-1">
          <Settings size={22} className="text-brand-500" />
          Settings
        </h1>
        <p className="text-sm text-foreground-muted">Manage your profile and account security.</p>
      </div>

      {/* ── Profile Preview ────────────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-border">
        {/* Cover */}
        <div
          className="h-24 w-full bg-gradient-to-r from-brand-100 to-tella-100 dark:from-brand-900/30 dark:to-tella-900/30"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        {/* Avatar + name */}
        <div className="px-5 pb-4">
          <div className="flex items-end gap-3 -mt-7 mb-3">
            <div
              className={cn('w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-base font-bold border-4 border-background shrink-0', levelCfg.borderClass)}
              style={{ background: levelCfg.color + '15', color: levelCfg.color }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : getInitials(username || user.email || '?')
              }
            </div>
            <div className="pb-1">
              <p className="font-serif font-semibold text-foreground leading-none">@{username || user.email?.split('@')[0]}</p>
              <span className={cn('text-xs font-medium', levelCfg.textClass)}>{levelCfg.badgeText}</span>
            </div>
          </div>
          {bio && <p className="text-sm text-foreground-secondary italic font-serif line-clamp-2">{bio}</p>}
        </div>
        <div className="absolute top-3 right-3 bg-black/30 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
          Preview
        </div>
      </div>

      {/* ── Section: Profile Identity ──────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <User size={16} className="text-foreground-muted" />
          <h2 className="font-serif font-semibold text-base text-foreground">Profile Identity</h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <div className="space-y-4">
          {/* Username */}
          <FieldRow
            icon={<AtSign size={14} />}
            label="Username"
            hint="Only lowercase letters, numbers, _ and . allowed."
          >
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              maxLength={30}
              className="settings-input"
            />
          </FieldRow>

          {/* Bio */}
          <FieldRow
            icon={<FileText size={14} />}
            label="Bio"
            hint="A short description shown on your profile. Max 200 chars."
          >
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A few words about you, your writing, your obsessions…"
              maxLength={200}
              rows={3}
              className="settings-input resize-none leading-relaxed"
            />
            <div className="flex justify-end mt-1">
              <span className={cn('text-xs', bio.length > 180 ? 'text-foreground-muted' : 'text-foreground-muted opacity-60')}>
                {bio.length}/200
              </span>
            </div>
          </FieldRow>

          {/* Website */}
          <FieldRow
            icon={<Globe size={14} />}
            label="Website"
            hint="Optional personal link shown on your profile."
          >
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="settings-input"
            />
          </FieldRow>

          {/* Avatar upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">
              <Camera size={14} className="text-foreground-muted" />
              Avatar
            </label>

            <div className="flex items-center gap-4">
              {/* Current avatar preview */}
              <div
                className={cn(
                  'relative w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-base font-bold border-2 transition-all',
                  levelCfg.borderClass
                )}
                style={{ background: levelCfg.color + '15', color: levelCfg.color }}
              >
                {(avatarPreview || avatarUrl) ? (
                  <img
                    src={avatarPreview || avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(username || user.email || '?')
                )}

                {/* Progress overlay */}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-full">
                    <Loader2 size={18} className="text-white animate-spin" />
                    <span className="text-white text-[10px] font-bold mt-0.5">{avatarProgress}%</span>
                  </div>
                )}

                {/* Remove button */}
                {!avatarUploading && (avatarPreview || avatarUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(null);
                      setAvatarUrl('');
                      setProfileDirty(true);
                    }}
                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    style={{ opacity: 1 }}
                    title="Remove avatar"
                  >
                    <X size={10} className="text-white" strokeWidth={3} />
                  </button>
                )}
              </div>

              {/* Upload zone */}
              <div
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setAvatarDragOver(true); }}
                onDragLeave={() => setAvatarDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setAvatarDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleAvatarFile(file);
                }}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                  avatarDragOver
                    ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-border hover:border-brand-300 hover:bg-background-subtle',
                  avatarUploading && 'pointer-events-none opacity-60'
                )}
              >
                <Upload size={18} className={cn('transition-colors', avatarDragOver ? 'text-brand-500' : 'text-foreground-muted')} />
                <p className="text-xs font-medium text-foreground text-center">
                  {avatarUploading ? `Uploading… ${avatarProgress}%` : 'Click or drag to upload'}
                </p>
                <p className="text-[10px] text-foreground-muted text-center">JPEG, PNG, WebP · max 2 MB</p>

                {/* Progress bar */}
                {avatarUploading && (
                  <div className="w-full mt-1 bg-border rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-150"
                      style={{ width: `${avatarProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={e => handleAvatarFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Cover image upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">
              <LayoutTemplate size={14} className="text-foreground-muted" />
              Cover Image
            </label>

            {/* Wide banner preview */}
            <div
              onClick={() => !coverUploading && coverInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setCoverDragOver(true); }}
              onDragLeave={() => setCoverDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setCoverDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleCoverFile(file);
              }}
              className={cn(
                'relative w-full rounded-xl overflow-hidden cursor-pointer transition-all border-2 border-dashed',
                coverDragOver
                  ? 'border-brand-400 ring-2 ring-brand-300/40'
                  : 'border-border hover:border-brand-300',
                coverUploading && 'pointer-events-none'
              )}
              style={{ aspectRatio: '16 / 3.5' }}
            >
              {/* Background: uploaded image or gradient placeholder */}
              {(coverPreview || coverUrl) ? (
                <img
                  src={coverPreview || coverUrl}
                  alt="Cover preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-brand-100 to-tella-100 dark:from-brand-900/30 dark:to-tella-900/30" />
              )}

              {/* Overlay: upload prompt (when no image or on hover) */}
              <div
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all',
                  (coverPreview || coverUrl) && !coverUploading
                    ? 'bg-black/0 hover:bg-black/40 opacity-0 hover:opacity-100'
                    : 'bg-black/0'
                )}
              >
                {!coverUploading && (
                  <>
                    <Upload size={18} className={cn('transition-colors', (coverPreview || coverUrl) ? 'text-white' : coverDragOver ? 'text-brand-500' : 'text-foreground-muted')} />
                    <p className={cn('text-xs font-semibold', (coverPreview || coverUrl) ? 'text-white' : 'text-foreground-muted')}>
                      {(coverPreview || coverUrl) ? 'Click to change' : 'Click or drag to upload cover'}
                    </p>
                    <p className={cn('text-[10px]', (coverPreview || coverUrl) ? 'text-white/70' : 'text-foreground-muted')}>
                      JPEG, PNG, WebP · max 5 MB · wide format works best
                    </p>
                  </>
                )}
              </div>

              {/* Upload progress overlay */}
              {coverUploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={22} className="text-white animate-spin" />
                  <span className="text-white text-xs font-bold">Uploading… {coverProgress}%</span>
                  <div className="w-2/3 bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-150"
                      style={{ width: `${coverProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Remove button */}
              {!coverUploading && (coverPreview || coverUrl) && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setCoverPreview(null);
                    setCoverUrl('');
                    setProfileDirty(true);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  title="Remove cover"
                >
                  <X size={12} className="text-white" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <p className="text-xs text-foreground-muted opacity-70 mt-1.5 leading-snug">
              Wide banner shown at the top of your profile. 16:9 or wider ratios look best.
            </p>

            {/* Hidden file input */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => handleCoverFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile || !profileDirty}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all',
              profileDirty
                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                : 'bg-background-subtle text-foreground-muted cursor-not-allowed',
              savingProfile && 'opacity-70 cursor-wait'
            )}
          >
            {savingProfile
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : profileDirty
                ? <><Check size={14} /> Save changes</>
                : 'No changes'
            }
          </button>
          {profileDirty && (
            <button
              onClick={() => {
                if (profile) {
                  setUsername(profile.username || '');
                  setBio(profile.bio || '');
                  setWebsite(profile.website || '');
                  setAvatarUrl(profile.avatar_url || '');
                  setCoverUrl(profile.cover_url || '');
                }
              }}
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Discard
            </button>
          )}
        </div>
      </section>

      {/* ── Section: Password & Security ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <Lock size={16} className="text-foreground-muted" />
          <h2 className="font-serif font-semibold text-base text-foreground">Password & Security</h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <div className="border border-border rounded-2xl overflow-hidden">
          {/* Step 0: Idle */}
          {passwordStep === 'idle' && (
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-background-subtle flex items-center justify-center shrink-0">
                <Shield size={18} className="text-foreground-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Change Password</p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  We'll send a 4-digit verification code to{' '}
                  <span className="font-medium text-foreground">{user.email}</span> first.
                </p>
              </div>
              <button
                onClick={handleRequestOtp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background-subtle border border-border hover:border-brand-300 dark:hover:border-brand-700 text-sm font-medium text-foreground transition-all shrink-0"
              >
                Begin <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Step: Sending */}
          {passwordStep === 'sending' && (
            <div className="p-5 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-brand-500 shrink-0" />
              <p className="text-sm text-foreground-secondary">Sending verification code…</p>
            </div>
          )}

          {/* Step: Verify OTP */}
          {(passwordStep === 'verify' || passwordStep === 'verifying') && (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Send size={14} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Enter verification code</p>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    A 4-digit code was sent to <span className="font-medium text-foreground">{user.email}</span>
                  </p>
                </div>
              </div>

              {/* OTP input */}
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={otpCode}
                  onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="0000"
                  className={cn(
                    'w-36 text-center text-2xl font-bold tracking-[0.4em] bg-background-subtle border rounded-xl px-4 py-3 text-foreground outline-none transition-colors',
                    otpError
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-border focus:border-brand-400'
                  )}
                />
                {otpError && (
                  <p className="text-xs text-red-500 mt-1.5">{otpError}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpCode.length !== 4 || passwordStep === 'verifying'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                >
                  {passwordStep === 'verifying'
                    ? <><Loader2 size={13} className="animate-spin" /> Verifying…</>
                    : 'Verify code'
                  }
                </button>
                <button
                  onClick={() => { setPasswordStep('idle'); setOtpCode(''); setOtpError(''); }}
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestOtp}
                  className="text-xs text-brand-500 hover:text-brand-600 underline underline-offset-2 ml-auto transition-colors"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {/* Step: Set new password */}
          {(passwordStep === 'set' || passwordStep === 'saving') && (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Identity verified</p>
                  <p className="text-xs text-foreground-muted mt-0.5">Choose your new password.</p>
                </div>
              </div>

              {/* New password */}
              <div className="space-y-3">
                <div className="relative">
                  <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="settings-input pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPassword.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-all',
                            newPassword.length >= i * 3
                              ? newPassword.length >= 12 ? 'bg-green-400'
                                : newPassword.length >= 8 ? 'bg-ink-400'
                                  : 'bg-red-400'
                              : 'bg-border'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className={cn(
                      'settings-input',
                      confirmPassword && newPassword !== confirmPassword && 'border-red-400 focus:border-red-400'
                    )}
                    autoComplete="new-password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSetPassword}
                  disabled={
                    passwordStep === 'saving' ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold transition-all"
                >
                  {passwordStep === 'saving'
                    ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    : <><Lock size={13} /> Update password</>
                  }
                </button>
                <button
                  onClick={() => { setPasswordStep('idle'); setNewPassword(''); setConfirmPassword(''); }}
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="mt-4 p-4 rounded-xl bg-background-subtle border border-border-subtle">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <Shield size={12} />
            <span>Signed in as <strong className="text-foreground">{user.email}</strong></span>
            <span className="ml-auto">
              <LevelBadgeImage level={level} size={24} showTooltip={true} />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Field row helper ──────────────────────────────────────────────────────────
interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldRow({ icon, label, hint, children }: FieldRowProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-1.5">
        <span className="text-foreground-muted">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-foreground-muted opacity-70 mt-1 leading-snug">{hint}</p>}
    </div>
  );
}
