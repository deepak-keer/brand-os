import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { authApi } from '../api'
import toast from 'react-hot-toast'

// ─── SHARED AUTH SHELL ───────────────────────────────────────────────────────
function AuthShell({ title, sub, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: '#070709' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[min(100vw,500px)] h-[min(100vw,500px)] rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(ellipse, #7c6ef8, transparent 70%)' }} />
      </div>
      <div className="relative w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-6 md:mb-7">
          <Link to="/" className="flex items-center gap-2 mb-4 md:mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#111119', border: '1px solid #2a2a35' }}>
              <img src="/logo.png" alt="Brand OS" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display font-bold text-[15px] md:text-[16px] text-[#e8e8f0]">Brand OS</span>
          </Link>
          <h1 className="font-display font-bold text-xl md:text-[22px] text-[#e8e8f0] text-center">{title}</h1>
          <p className="text-[13px] text-[#9898a8] mt-1 text-center px-2">{sub}</p>
        </div>
        <div className="p-4 md:p-6 rounded-2xl" style={{ background: '#0f0f16', border: '1px solid #2a2a35' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    try { await login(email, password); toast.success('Welcome back!'); navigate('/dashboard') }
    catch (err) { toast.error(err.response?.data?.message || 'Login failed') }
  }

  return (
    <AuthShell title="Welcome back" sub="Sign in to your Brand OS">
      <form onSubmit={handle} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="relative">
            <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={14} className="text-[#5a5a6a]" /> : <Eye size={14} className="text-[#5a5a6a]" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[12px] text-[#a78bfa] hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-[13px] text-[#9898a8] mt-5">
        No account? <Link to="/register" className="text-[#a78bfa] hover:underline">Create one free</Link>
      </p>
    </AuthShell>
  )
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    try { await register(form.username, form.email, form.password); toast.success('Account created!'); navigate('/dashboard') }
    catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
  }

  return (
    <AuthShell title="Create your Brand OS" sub="Start managing your creator business">
      <form onSubmit={handle} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="input-field" placeholder="Your Name" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="relative">
            <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={14} className="text-[#5a5a6a]" /> : <Eye size={14} className="text-[#5a5a6a]" />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Get Started Free'}
        </button>
        <p className="text-[11px] text-[#5a5a6a] text-center">By signing up you agree to our Terms of Service.</p>
      </form>
      <p className="text-center text-[13px] text-[#9898a8] mt-5">
        Have an account? <Link to="/login" className="text-[#a78bfa] hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await authApi.forgotPassword({ email }); setSent(true) }
    catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  return (
    <AuthShell title="Reset your password" sub="We'll send a reset link to your email">
      {sent ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.24)' }}>
            <Mail size={22} className="text-[#60a5fa]" />
          </div>
          <div className="font-medium text-[15px] mb-2">Check your email</div>
          <div className="text-[13px] text-[#9898a8]">We sent a link to <span className="text-[#a78bfa]">{email}</span></div>
          <Link to="/login" className="btn-ghost mt-6 justify-center inline-flex"><ArrowLeft size={13} /> Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handle} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <p className="text-center text-[13px] text-[#9898a8] mt-5">
        <Link to="/login" className="inline-flex items-center gap-1 text-[#a78bfa] hover:underline"><ArrowLeft size={12} /> Back to login</Link>
      </p>
    </AuthShell>
  )
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { token } = useParams()

  const handle = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try { await authApi.resetPassword(token, { password }); toast.success('Password reset! Please log in.'); navigate('/login') }
    catch (err) { toast.error(err.response?.data?.message || 'Reset failed') }
    setLoading(false)
  }

  return (
    <AuthShell title="Set new password" sub="Choose a strong password">
      <form onSubmit={handle} className="space-y-4">
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input className="input-field" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input className="input-field" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthShell>
  )
}
