import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard, Calendar, FileText, Lightbulb, Handshake,
  BarChart2, DollarSign, Sparkles, Settings, LogOut, ChevronRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import usePostStore from '../../store/postStore'
import NotificationBell from '../shared/NotificationBell'
import toast from 'react-hot-toast'

const NAV = [
  { group: 'Workspace', items: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar',  label: 'Calendar',   icon: Calendar },
    { path: '/posts',     label: 'Post Tracker', icon: FileText, badge: 'drafts' },
    { path: '/ideas',     label: 'Idea Board',  icon: Lightbulb },
  ]},
  { group: 'Business', items: [
    { path: '/deals',     label: 'Brand Deals', icon: Handshake, badge: 'active' },
    { path: '/analytics', label: 'Analytics',   icon: BarChart2 },
    { path: '/income',    label: 'Income',       icon: DollarSign },
  ]},
  { group: 'Tools', items: [
    { path: '/ai',        label: 'AI Studio',   icon: Sparkles },
    { path: '/settings',  label: 'Settings',    icon: Settings },
  ]},
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { posts, fetchPosts } = usePostStore()

  useEffect(() => { fetchPosts() }, [])

  const draftCount  = posts.filter(p => p.status === 'draft' || p.status === 'review').length
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'CR'

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  // Current page title
  const allItems = NAV.flatMap(g => g.items)
  const current = allItems.find(i => location.pathname === i.path) || allItems[0]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070709' }}>
      {/* ── Sidebar ── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col" style={{ background: '#0c0c13', borderRight: '1px solid #1e1e2a' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: '1px solid #1e1e2a' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#111119', border: '1px solid #2a2a35' }}>
            <img src="/logo.png" alt="Brand OS" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-[15px] text-[#e8e8f0] leading-none">Brand OS</div>
            <div className="text-[10px] text-[#5a5a6a] font-medium tracking-widest uppercase mt-0.5">Creator Suite</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(group => (
            <div key={group.group}>
              <div className="section-label px-4 pt-4 pb-1.5">{group.group}</div>
              {group.items.map(item => {
                const active = location.pathname === item.path
                const badgeCount = item.badge === 'drafts' ? draftCount : 0
                return (
                  <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#7c6ef8', color: '#fff' }}>{badgeCount}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid #1e1e2a' }}>
          <div className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer group transition-colors hover:bg-[#13131c]"
            onClick={() => navigate('/settings')}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c6ef8, #e879f9)' }}>{initials}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#e8e8f0] truncate">{user?.name || 'Creator'}</div>
              <div className="text-[11px] text-[#5a5a6a] truncate">{user?.niche || user?.email || ''}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); handleLogout() }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#1e1e2a]">
              <LogOut size={13} className="text-[#f87171]" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center px-6 py-3 flex-shrink-0" style={{ background: '#0c0c13', borderBottom: '1px solid #1e1e2a', height: 56 }}>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[#5a5a6a] text-[13px]">Brand OS</span>
            <ChevronRight size={13} className="text-[#3a3a4a]" />
            <span className="text-[13px] font-medium text-[#e8e8f0]">{current?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button className="btn-primary text-[12px] py-1.5 px-3" onClick={() => navigate('/ai')}>
              <Sparkles size={12} /> AI Studio
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
