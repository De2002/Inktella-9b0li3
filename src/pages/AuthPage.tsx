import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Step = 'choose' | 'register-email' | 'register-otp' | 'register-details' | 'login' | 'login-otp';

function mapUser(user: any) {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url,
  };
}

export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/feed', { replace: true });
  }, [user, navigate]);

  // REGISTER FLOW
  async function sendOtp() {
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setStep('register-otp');
    toast.success('Check your inbox for a 4-digit code');
    setLoading(false);
  }

  async function verifyOtpAndContinue() {
    if (otp.length !== 4) {
      toast.error('Enter the 4-digit code');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) {
      toast.error('Invalid or expired code');
      setLoading(false);
      return;
    }
    // Check if user has a password set; if not, require password setup
    if (data.user && !data.user.user_metadata?.has_password) {
      setStep('register-details');
    } else {
      // User already has password (shouldn't happen in signup flow, but handle it)
      setStep('register-details');
    }
    setLoading(false);
  }

  async function completeRegistration() {
    if (!username.trim() || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password,
      data: { username: username.toLowerCase().replace(/\s+/g, '_') },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Update profile username
    if (data.user) {
      await supabase.from('user_profiles').update({
        username: username.toLowerCase().replace(/\s+/g, '_'),
      }).eq('id', data.user.id);

      // Grant signup Ink bonus transaction
      await supabase.from('ink_transactions').insert({
        user_id: data.user.id,
        amount: 100,
        reason: 'Welcome bonus',
      });

      login(mapUser(data.user));
      navigate('/feed');
    }
    setLoading(false);
  }

  // LOGIN FLOW
  async function handleLogin() {
    if (!email || !password) {
      toast.error('Fill in all fields');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Invalid email or password' : error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      login(mapUser(data.user));
      navigate('/feed');
    }
  }

  async function sendLoginOtp() {
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setStep('login-otp');
    toast.success('Check your inbox for a 4-digit code');
    setLoading(false);
  }

  async function verifyLoginOtp() {
    if (otp.length !== 4) {
      toast.error('Enter the 4-digit code');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) {
      toast.error('Invalid or expired code');
      setLoading(false);
      return;
    }
    if (data.user) {
      // Check if user is a new user without a password (created via sign-up email code)
      // If they don't have a password, redirect to password setup instead of feed
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (!profileData) {
        // New user without profile - needs to set password
        setStep('register-details');
        setLoading(false);
        return;
      }
      
      login(mapUser(data.user));
      navigate('/feed');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-serif font-bold text-3xl text-foreground">Inktella</h1>
            <p className="text-foreground-muted text-sm mt-1">Words. Feedback. Growth.</p>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-7 shadow-sm">
          {/* Choose: Register or Login */}
          {step === 'choose' && (
            <div className="space-y-3">
              <h2 className="font-serif font-semibold text-xl text-foreground mb-1">Welcome to Inktella</h2>
              <p className="text-foreground-secondary text-sm mb-5">The platform where feedback earns your voice.</p>

              <button
                onClick={() => setStep('register-email')}
                className="w-full flex items-center justify-between p-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors group"
              >
                <span>Create an account</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setStep('login')}
                className="w-full flex items-center justify-between p-4 border border-border hover:border-brand-300 text-foreground rounded-xl font-medium transition-colors"
              >
                <span>Sign in</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-xs text-center text-foreground-muted pt-2">
                New members receive 100 Ink to start writing.
              </p>
            </div>
          )}

          {/* Register: Email */}
          {step === 'register-email' && (
            <div className="space-y-4">
              <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-2">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="font-serif font-semibold text-xl text-foreground">Create your account</h2>
              <p className="text-sm text-foreground-muted">We'll send a verification code to your email.</p>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  className="w-full pl-9 pr-4 py-3 bg-background-subtle border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </div>
          )}

          {/* Register: OTP */}
          {step === 'register-otp' && (
            <div className="space-y-4">
              <button onClick={() => setStep('register-email')} className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-2">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="font-serif font-semibold text-xl text-foreground">Check your email</h2>
              <p className="text-sm text-foreground-muted">
                We sent a 4-digit code to <strong className="text-foreground">{email}</strong>
              </p>
              <input
                type="text"
                placeholder="0 0 0 0"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={e => e.key === 'Enter' && verifyOtpAndContinue()}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 bg-background-subtle border border-border rounded-xl text-foreground outline-none focus:border-brand-400 transition-colors"
                maxLength={4}
              />
              <button
                onClick={verifyOtpAndContinue}
                disabled={loading || otp.length !== 4}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
              <button onClick={sendOtp} className="w-full text-sm text-foreground-muted hover:text-brand-500 transition-colors">
                Resend code
              </button>
            </div>
          )}

          {/* Register: Details */}
          {step === 'register-details' && (
            <div className="space-y-4">
              <h2 className="font-serif font-semibold text-xl text-foreground">Almost there</h2>
              <p className="text-sm text-foreground-muted">Choose your poet name and set a password.</p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">@</span>
                <input
                  type="text"
                  placeholder="poetname"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, ''))}
                  className="w-full pl-7 pr-4 py-3 bg-background-subtle border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && completeRegistration()}
                  className="w-full pl-9 pr-10 py-3 bg-background-subtle border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                onClick={completeRegistration}
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? 'Creating account...' : 'Join Inktella'}
              </button>

              <div className="bg-ink-50 dark:bg-ink-900/20 border border-ink-200 dark:border-ink-800 rounded-xl p-3 text-xs text-ink-700 dark:text-ink-400">
                🎉 You'll receive <strong>100 Ink</strong> as a welcome gift to start publishing.
              </div>
            </div>
          )}

          {/* Login */}
          {step === 'login' && (
            <div className="space-y-4">
              <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-2">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="font-serif font-semibold text-xl text-foreground">Welcome back</h2>

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-background-subtle border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-9 pr-10 py-3 bg-background-subtle border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-foreground-muted">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={sendLoginOtp}
                disabled={loading}
                className="w-full border border-border hover:border-brand-300 text-foreground py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Sign in with email code instead
              </button>

              <p className="text-xs text-center text-foreground-muted">
                Don't have an account?{' '}
                <button onClick={() => setStep('register-email')} className="text-brand-500 hover:text-brand-600 font-medium">
                  Register here
                </button>
              </p>
            </div>
          )}

          {/* Login OTP */}
          {step === 'login-otp' && (
            <div className="space-y-4">
              <button onClick={() => setStep('login')} className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-2">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="font-serif font-semibold text-xl text-foreground">Check your email</h2>
              <p className="text-sm text-foreground-muted">
                We sent a 4-digit code to <strong className="text-foreground">{email}</strong>
              </p>
              <input
                type="text"
                placeholder="0 0 0 0"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={e => e.key === 'Enter' && verifyLoginOtp()}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-4 bg-background-subtle border border-border rounded-xl text-foreground outline-none focus:border-brand-400 transition-colors"
                maxLength={4}
              />
              <button
                onClick={verifyLoginOtp}
                disabled={loading || otp.length !== 4}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? 'Verifying...' : 'Sign in'}
              </button>
              <button onClick={sendLoginOtp} className="w-full text-sm text-foreground-muted hover:text-brand-500 transition-colors">
                Resend code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
