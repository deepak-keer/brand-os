import { X, AlertTriangle } from 'lucide-react'

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose, onSave, saveLabel = 'Save', saving = false, wide = false, danger = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center max-md:p-0 md:items-center md:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={`
          w-full flex flex-col
          max-md:min-h-[100dvh] max-md:max-h-[100dvh] max-md:rounded-none max-md:p-4 max-md:pt-3
          md:max-h-[90vh] md:overflow-y-auto md:rounded-2xl md:p-6
          lg:max-h-[88vh]
          ${wide ? 'md:max-w-[640px]' : 'md:max-w-[480px]'}
        `}
        style={{ background: '#0f0f16', border: '1px solid #2a2a35', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex md:hidden flex-col items-center pt-1 pb-2 flex-shrink-0" aria-hidden>
          <div className="w-10 h-1 rounded-full bg-[#3a3a4a]" />
        </div>
        <div className="flex items-center justify-between mb-4 md:mb-5 gap-3 flex-shrink-0">
          <h2 id="modal-title" className="font-display font-bold text-base md:text-lg text-[#e8e8f0] pr-2">{title}</h2>
          <button type="button" onClick={onClose} className="btn-icon min-h-[44px] min-w-[44px] md:min-h-8 md:min-w-8 flex-shrink-0" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto md:overflow-visible">
          {children}
        </div>
        {onSave && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-5 pt-4 flex-shrink-0" style={{ borderTop: '1px solid #1e1e2a' }}>
            <button type="button" className="btn-ghost w-full sm:w-auto justify-center" onClick={onClose}>Cancel</button>
            <button type="button" className={`${danger ? 'btn-danger' : 'btn-primary'} w-full sm:w-auto justify-center`} onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, onConfirm, onCancel, dangerous = true }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center max-md:p-0 md:items-center md:p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full md:w-[360px] md:max-h-[90vh] md:overflow-y-auto max-md:min-h-[100dvh] max-md:rounded-none rounded-2xl p-4 md:p-6 flex flex-col justify-center"
        style={{ background: '#0f0f16', border: '1px solid #2a2a35' }}
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex md:hidden flex-col items-center gap-1 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#3a3a4a]" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          {dangerous && <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(248,113,113,0.12)' }}><AlertTriangle size={18} className="text-[#f87171]" /></div>}
          <h3 className="font-display font-bold text-[15px] md:text-[16px]">{title}</h3>
        </div>
        <p className="text-[13px] text-[#9898a8] mb-5 leading-relaxed">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
          <button type="button" className="btn-ghost w-full sm:w-auto justify-center" onClick={onCancel}>Cancel</button>
          <button type="button" className={`${dangerous ? 'btn-danger' : 'btn-primary'} w-full sm:w-auto justify-center`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  idea:'badge-gray', draft:'badge-amber', review:'badge-blue', scheduled:'badge-purple', published:'badge-green',
  outreach:'badge-gray', negotiating:'badge-amber', confirmed:'badge-blue', completed:'badge-green', cancelled:'badge-red',
  sponsored:'badge-purple', affiliate:'badge-blue', product:'badge-pink', ambassador:'badge-green', consulting:'badge-amber',
  YouTube:'badge-red', Instagram:'badge-pink', Twitter:'badge-blue', LinkedIn:'badge-blue', TikTok:'badge-purple',
  low:'badge-gray', medium:'badge-amber', high:'badge-red',
}
export function Badge({ label, className = '' }) {
  return <span className={`badge ${BADGE_MAP[label] || 'badge-gray'} ${className}`}>{label}</span>
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ title, value, sub, subColor, icon: Icon, iconColor = '#7c6ef8', onClick }) {
  return (
    <div className={`card ${onClick ? 'cursor-pointer hover:border-[#2a2a35] transition-colors' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-[12px] text-[#9898a8] font-medium">{title}</div>
        {Icon && <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}18` }}><Icon size={14} style={{ color: iconColor }} /></div>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="text-[11px] mt-1.5" style={{ color: subColor || '#5a5a6a' }}>{sub}</div>}
    </div>
  )
}

// ── Progress ──────────────────────────────────────────────────────────────────
export function Progress({ value, color = '#7c6ef8', height = 6 }) {
  return (
    <div className="rounded-full overflow-hidden" style={{ background: '#1a1a24', height }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <div className="font-display font-semibold text-[16px] text-[#e8e8f0] mb-1.5">{title}</div>
      <div className="text-[13px] text-[#5a5a6a] max-w-[260px] leading-relaxed mb-5">{description}</div>
      {action}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="rounded-full border-2 border-[#2a2a35] border-t-[#7c6ef8] animate-spin" style={{ width: size, height: size }} />
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (label) return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: '#1e1e2a' }} />
      <span className="text-[11px] text-[#5a5a6a] font-medium">{label}</span>
      <div className="flex-1 h-px" style={{ background: '#1e1e2a' }} />
    </div>
  )
  return <div className="h-px my-4" style={{ background: '#1e1e2a' }} />
}

// ── Input helpers ─────────────────────────────────────────────────────────────
export function FormGroup({ label, children, hint }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {hint && <div className="text-[11px] text-[#5a5a6a] mt-1">{hint}</div>}
    </div>
  )
}
