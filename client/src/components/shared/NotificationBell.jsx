import { useEffect, useRef, useState } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { useNotificationStore } from '../../store/stores'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, deleteNotification } = useNotificationStore()

  useEffect(() => { fetchNotifications(); const t = setInterval(fetchNotifications, 60000); return () => clearInterval(t) }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const typeColors = { deal: '#4ade80', post: '#7c6ef8', goal: '#fbbf24', ai: '#f472b6', system: '#60a5fa' }
  const renderNotificationIcon = (notification) => {
    if (notification.icon === 'logo' || (!notification.icon && notification.type === 'system')) {
      return <img src="/logo.png" alt="Brand OS" className="w-5 h-5 object-contain" />
    }

    return notification.icon
  }

  return (
    <div className="relative" ref={ref}>
      <button className="btn-icon relative" onClick={() => setOpen(v => !v)}>
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: '#f87171' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[360px] rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{ background: '#0f0f16', border: '1px solid #2a2a35' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e1e2a' }}>
            <span className="font-display font-semibold text-[14px]">Notifications</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button className="btn-ghost text-xs py-1 px-2" onClick={() => markAllRead()}>
                  <Check size={11} /> Mark all read
                </button>
              )}
              <button className="btn-icon w-6 h-6" onClick={() => setOpen(false)}><X size={13} /></button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-[#5a5a6a] text-[13px]">
                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : notifications.map(n => (
              <div key={n._id}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${!n.read ? 'bg-[rgba(124,110,248,0.04)]' : ''}`}
                style={{ borderBottom: '1px solid #13131c' }}
                onMouseEnter={e => e.currentTarget.style.background = '#13131c'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? '' : 'rgba(124,110,248,0.04)'}
                onClick={() => !n.read && markRead(n._id)}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: `${typeColors[n.type] || '#7c6ef8'}18` }}>
                  {renderNotificationIcon(n)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-[13px] font-medium leading-snug ${n.read ? 'text-[#9898a8]' : 'text-[#e8e8f0]'}`}>{n.title}</div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#7c6ef8] flex-shrink-0 mt-1.5" />}
                  </div>
                  <div className="text-[12px] text-[#5a5a6a] mt-0.5 leading-snug">{n.message}</div>
                  <div className="text-[11px] text-[#3a3a4a] mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                </div>
                <button className="btn-icon w-6 h-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  style={{ opacity: 0 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  onClick={e => { e.stopPropagation(); deleteNotification(n._id) }}>
                  <Trash2 size={12} className="text-[#f87171]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
