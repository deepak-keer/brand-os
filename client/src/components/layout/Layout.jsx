import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, FileText, Lightbulb, Handshake,
  BarChart2, DollarSign, Sparkles, Settings, LogOut, ChevronRight,
  Menu, X,
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

/** Bottom tab bar: 5 primary destinations (icons only on mobile/tablet). */
const BOTTOM_TABS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/posts', label: 'Posts', icon: FileText },
  { path: '/deals', label: 'Deals', icon: Handshake },
  { path: '/ai', label: 'AI', icon: Sparkles },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { posts, fetchPosts } = usePostStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => { fetchPosts() }, [])
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  const draftCount  = posts.filter(p => p.status === 'draft' || p.status === 'review').length
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'CR'

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const allItems = NAV.flatMap(g => g.items)
  const current = allItems.find(i => location.pathname === i.path) || allItems[0]

  const SidebarBody = ({ onNavigate, onCloseDrawer }) => (
    <>
      <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: '1px solid #1e1e2a' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#111119', border: '1px solid #2a2a35' }}>
          <img src="/logo.png" alt="Brand OS" className="w-6 h-6 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[15px] text-[#e8e8f0] leading-none">Brand OS</div>
          <div className="text-[10px] text-[#5a5a6a] font-medium tracking-widest uppercase mt-0.5">Creator Suite</div>
        </div>
        {onCloseDrawer && (
          <button type="button" className="btn-icon min-h-[44px] min-w-[44px] flex-shrink-0" onClick={onCloseDrawer} aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(group => (
          <div key={group.group}>
            <div className="section-label px-4 pt-4 pb-1.5">{group.group}</div>
            {group.items.map(item => {
              const active = location.pathname === item.path
              const badgeCount = item.badge === 'drafts' ? draftCount : 0
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onNavigate?.()}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
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

      <div className="p-3" style={{ borderTop: '1px solid #1e1e2a' }}>
        <div className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer group transition-colors hover:bg-[#13131c]"
          onClick={() => { navigate('/settings'); onNavigate?.() }}>
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
          <button type="button" onClick={e => { e.stopPropagation(); handleLogout() }}
            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-2 min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 lg:p-1 rounded-lg hover:bg-[#1e1e2a] flex items-center justify-center">
            <LogOut size={13} className="text-[#f87171]" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070709' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 flex-col" style={{ background: '#0c0c13', borderRight: '1px solid #1e1e2a' }}>
        <SidebarBody />
      </aside>

      {/* Mobile / tablet drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-[min(100%,288px)] flex flex-col shadow-2xl animate-[slideDrawer_0.2s_ease-out]"
            style={{ background: '#0c0c13', borderRight: '1px solid #1e1e2a' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <SidebarBody onNavigate={() => setDrawerOpen(false)} onCloseDrawer={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDrawer {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div
          className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 flex-shrink-0 min-h-[56px]"
          style={{ background: '#0c0c13', borderBottom: '1px solid #1e1e2a' }}
        >
          <button
            type="button"
            className="btn-icon lg:hidden min-h-[44px] min-w-[44px] flex-shrink-0"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[#5a5a6a] text-[12px] lg:text-[13px] hidden sm:inline">Brand OS</span>
            <ChevronRight size={13} className="text-[#3a3a4a] hidden sm:block flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#e8e8f0] truncate">{current?.label}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <NotificationBell />
            <button
              type="button"
              className="btn-primary text-[12px] px-3 max-lg:min-h-[44px] max-lg:px-3 max-lg:py-2.5 hidden sm:inline-flex"
              onClick={() => navigate('/ai')}
            >
              <Sparkles size={12} /> <span className="max-md:hidden">AI Studio</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar (mobile + tablet) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        style={{ background: '#0c0c13', borderTop: '1px solid #1e1e2a' }}
      >
        {BOTTOM_TABS.map(tab => {
          const active = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] rounded-xl transition-colors ${
                active ? 'text-[#a78bfa]' : 'text-[#5a5a6a] hover:text-[#9898a8]'
              }`}
              aria-label={tab.label}
            >
              <tab.icon size={22} strokeWidth={active ? 2.25 : 2} />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
