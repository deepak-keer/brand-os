import { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import usePostStore from '../store/postStore'
import { Modal } from '../components/ui'
import toast from 'react-hot-toast'

const STATUS_COLORS = { idea:'#5a5a6a', draft:'#fbbf24', review:'#60a5fa', scheduled:'#7c6ef8', published:'#4ade80' }
const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok']
const STATUSES = ['idea','draft','review','scheduled','published']
const EF = { title:'', platform:'YouTube', status:'scheduled', caption:'', tags:'', scheduledDate:'' }

function useNarrowCalendar() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  const calRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => {
      const n = mq.matches
      setNarrow(n)
      const api = calRef.current?.getApi()
      if (api) {
        try {
          api.changeView(n ? 'listWeek' : 'dayGridMonth')
        } catch { /* ignore */ }
      }
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return { narrow, calRef }
}

export default function Calendar() {
  const { posts, fetchPosts, createPost, updatePost } = usePostStore()
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EF)
  const [saving, setSaving] = useState(false)
  const { narrow, calRef } = useNarrowCalendar()

  useEffect(() => { fetchPosts() }, [])

  const events = posts.filter(p=>p.scheduledDate).map(p => ({
    id: p._id,
    title: p.title,
    date: p.scheduledDate?.slice(0,10),
    backgroundColor: STATUS_COLORS[p.status] || '#5a5a6a',
    borderColor: 'transparent',
    textColor: '#0a0a0f',
    extendedProps: { post: p },
  }))

  const handleDateClick = (info) => {
    setEdit(null); setForm({...EF, scheduledDate: info.dateStr}); setShow(true)
  }
  const handleEventClick = (info) => {
    const p = info.event.extendedProps.post
    setEdit(p); setForm({ title:p.title, platform:p.platform, status:p.status, caption:p.caption||'', tags:(p.tags||[]).join(', '), scheduledDate:p.scheduledDate?.slice(0,10)||'' }); setShow(true)
  }
  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title required')
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) }
      if (edit) await updatePost(edit._id, payload)
      else await createPost(payload)
      toast.success(edit ? 'Updated!' : 'Post scheduled!'); setShow(false)
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-lg md:text-xl text-[#e8e8f0]">Content Calendar</h1>
          <p className="text-[13px] text-[#9898a8] mt-0.5">Click any date to schedule a post</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {Object.entries(STATUS_COLORS).map(([s,c]) => (
            <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />
              <span className="text-[11px] capitalize text-[#9898a8]">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-2 sm:p-4">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView={narrow ? 'listWeek' : 'dayGridMonth'}
          headerToolbar={narrow
            ? { left: 'prev,next', center: 'title', right: 'dayGridMonth' }
            : { left:'prev,next today', center:'title', right:'dayGridMonth,dayGridWeek,listWeek' }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height={narrow ? 'auto' : 'calc(100vh - 220px)'}
          eventDisplay="block"
        />
      </div>

      {show && (
        <Modal title={edit ? 'Edit Post' : `Schedule Post`} onClose={()=>setShow(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-3">
            <div className="form-group"><label className="form-label">Title *</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Post title" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-group"><label className="form-label">Platform</label><select className="select-field" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Status</label><select className="select-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Date</label><input className="input-field" type="date" value={form.scheduledDate} onChange={e=>setForm({...form,scheduledDate:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Caption</label><textarea className="textarea-field" rows={3} value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})} placeholder="Write caption..." /></div>
            <div className="form-group"><label className="form-label">Tags</label><input className="input-field" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="tips, creator, viral" /></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
