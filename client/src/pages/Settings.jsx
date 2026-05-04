import { useState, useRef } from 'react'
import { Camera, Save, Lock, Target, Globe } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { uploadApi, authApi } from '../api'
import { Progress, Divider } from '../components/ui'
import toast from 'react-hot-toast'

const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok']
const NICHES = ['Tech','Finance','Health & Fitness','Lifestyle','Education','Gaming','Food','Travel','Business','Fashion','Art','Music','Sports','Other']
const TABS = ['Profile','Security','Goals','Platforms']

export default function Settings() {
  const { user, updateMe } = useAuthStore()
  const [tab, setTab] = useState('Profile')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const [profile, setProfile] = useState({ name: user?.name || '', niche: user?.niche || '', bio: user?.bio || '', website: user?.website || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [goals, setGoals] = useState(user?.monthlyGoals || { posts: 20, income: 5000, currentPosts: 0, currentIncome: 0 })
  const [platforms, setPlatforms] = useState(user?.platforms || [])

  const saveProfile = async () => {
    setSaving(true)
    try { await updateMe(profile); toast.success('Profile updated!') }
    catch { toast.error('Failed to update profile') }
    setSaving(false)
  }

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match')
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try { await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }); toast.success('Password changed!'); setPasswords({ currentPassword: '', newPassword: '', confirm: '' }) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const saveGoals = async () => {
    setSaving(true)
    try { await updateMe({ monthlyGoals: goals }); toast.success('Goals saved!') }
    catch { toast.error('Failed') }
    setSaving(false)
  }

  const savePlatforms = async () => {
    setSaving(true)
    try { await updateMe({ platforms }); toast.success('Platforms saved!') }
    catch { toast.error('Failed') }
    setSaving(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData(); fd.append('avatar', file)
    try { await uploadApi.avatar(fd); await updateMe({}); toast.success('Avatar updated!') }
    catch { toast.error('Upload failed') }
  }

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'CR'
  const postsPct = Math.min(100, ((goals.currentPosts || 0) / (goals.posts || 1)) * 100)
  const incomePct = Math.min(100, ((goals.currentIncome || 0) / (goals.income || 1)) * 100)

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display font-bold text-lg md:text-xl text-[#e8e8f0]">Settings</h1>
        <p className="text-[13px] text-[#9898a8] mt-0.5">Manage your profile, security, and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:overflow-visible" style={{ background: '#0f0f16', border: '1px solid #1e1e2a' }}>
        {TABS.map(t => (
          <button type="button" key={t} onClick={() => setTab(t)}
            className={`flex-1 min-w-[44px] min-h-[44px] sm:min-h-0 py-2.5 sm:py-2 px-2 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all whitespace-nowrap ${tab === t ? 'bg-[#18181f] text-[#e8e8f0] border border-[#2a2a35]' : 'text-[#9898a8] hover:text-[#e8e8f0]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'Profile' && (
        <div className="card space-y-5">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white" style={{ background: 'linear-gradient(135deg, #7c6ef8, #e879f9)' }}>{initials}</div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#7c6ef8' }}>
                <Camera size={13} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <div className="font-semibold text-[15px]">{user?.name}</div>
              <div className="text-[13px] text-[#9898a8]">{user?.email}</div>
              <div className="text-[12px] text-[#5a5a6a] mt-0.5 capitalize">{user?.plan || 'Free'} plan</div>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input-field" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Niche / Category</label>
              <select className="select-field" value={profile.niche} onChange={e => setProfile({ ...profile, niche: e.target.value })}>
                <option value="">Select niche</option>
                {NICHES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="textarea-field" rows={3} placeholder="Tell us about yourself..." value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="input-field" placeholder="https://yourwebsite.com" value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={saveProfile} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {tab === 'Security' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} className="text-[#7c6ef8]" />
            <span className="font-semibold text-[14px]">Change Password</span>
          </div>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="input-field" type="password" placeholder="Min 6 characters" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="input-field" type="password" placeholder="Repeat new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={savePassword} disabled={saving}>
            <Lock size={14} /> {saving ? 'Saving...' : 'Change Password'}
          </button>
        </div>
      )}

      {/* ── GOALS TAB ── */}
      {tab === 'Goals' && (
        <div className="card space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-[#4ade80]" />
            <span className="font-semibold text-[14px]">Monthly Goals</span>
          </div>

          {/* Posts goal */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: '#18181f', border: '1px solid #2a2a35' }}>
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">Posts Published</span>
              <span className="text-[#9898a8]">{goals.currentPosts} / {goals.posts}</span>
            </div>
            <Progress value={postsPct} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="form-label">Target</label><input className="input-field" type="number" min="0" value={goals.posts} onChange={e => setGoals({ ...goals, posts: +e.target.value })} /></div>
              <div><label className="form-label">Current</label><input className="input-field" type="number" min="0" value={goals.currentPosts} onChange={e => setGoals({ ...goals, currentPosts: +e.target.value })} /></div>
            </div>
          </div>

          {/* Income goal */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: '#18181f', border: '1px solid #2a2a35' }}>
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">Income Goal</span>
              <span className="text-[#9898a8]">${goals.currentIncome?.toLocaleString()} / ${goals.income?.toLocaleString()}</span>
            </div>
            <Progress value={incomePct} color="#4ade80" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="form-label">Target ($)</label><input className="input-field" type="number" min="0" value={goals.income} onChange={e => setGoals({ ...goals, income: +e.target.value })} /></div>
              <div><label className="form-label">Earned ($)</label><input className="input-field" type="number" min="0" value={goals.currentIncome} onChange={e => setGoals({ ...goals, currentIncome: +e.target.value })} /></div>
            </div>
          </div>

          <button className="btn-primary" onClick={saveGoals} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      )}

      {/* ── PLATFORMS TAB ── */}
      {tab === 'Platforms' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-[#60a5fa]" />
            <span className="font-semibold text-[14px]">Active Platforms</span>
          </div>
          <p className="text-[13px] text-[#9898a8]">Select the platforms you actively create content for.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLATFORMS.map(p => {
              const active = platforms.includes(p)
              return (
                <button key={p}
                  onClick={() => setPlatforms(active ? platforms.filter(x => x !== p) : [...platforms, p])}
                  className="flex items-center gap-3 p-3.5 rounded-xl text-[13px] font-medium text-left transition-all"
                  style={{ background: active ? 'rgba(124,110,248,0.1)' : '#18181f', border: active ? '1px solid rgba(124,110,248,0.35)' : '1px solid #2a2a35', color: active ? '#a78bfa' : '#9898a8' }}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${active ? 'bg-[#7c6ef8]' : 'border border-[#3a3a4a]'}`}>
                    {active && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  {p}
                </button>
              )
            })}
          </div>
          <button className="btn-primary" onClick={savePlatforms} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Platforms'}
          </button>
        </div>
      )}
    </div>
  )
}
