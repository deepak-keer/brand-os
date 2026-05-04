import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import usePostStore from '../store/postStore'
import { Modal, Badge, EmptyState, Spinner, Divider } from '../components/ui'
import toast from 'react-hot-toast'

const COLS = [
  { key:'idea',label:'Idea',color:'#5a5a6a' },
  { key:'draft',label:'Draft',color:'#fbbf24' },
  { key:'review',label:'In Review',color:'#60a5fa' },
  { key:'scheduled',label:'Scheduled',color:'#7c6ef8' },
  { key:'published',label:'Published',color:'#4ade80' },
]
const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok']
const EF = { title:'',caption:'',platform:'YouTube',status:'idea',scheduledDate:'',tags:'',notes:'',metrics:{views:0,likes:0,comments:0,shares:0,saves:0} }

export default function Posts() {
  const { posts, fetchPosts, createPost, updatePost, deletePost, isLoading } = usePostStore()
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EF)
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState(null)

  useEffect(() => { fetchPosts() }, [])

  const openAdd = (status='idea') => { setEdit(null); setForm({...EF,status}); setShow(true) }
  const openEdit = (p) => { setEdit(p); setForm({ title:p.title, caption:p.caption||'', platform:p.platform, status:p.status, scheduledDate:p.scheduledDate?p.scheduledDate.slice(0,10):'', tags:(p.tags||[]).join(', '), notes:p.notes||'', metrics:p.metrics||EF.metrics }); setShow(true) }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) }
      if (edit) await updatePost(edit._id, payload)
      else await createPost(payload)
      toast.success(edit ? 'Post updated!' : 'Post created!')
      setShow(false)
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    await deletePost(edit._id); toast.success('Post deleted'); setShow(false)
  }

  const onDrop = async (e, status) => {
    e.preventDefault()
    if (!dragId) return
    const p = posts.find(x => x._id === dragId)
    if (p && p.status !== status) { await updatePost(dragId, { ...p, tags:(p.tags||[]).join(','), status }); toast.success(`Moved to ${status}`) }
    setDragId(null)
  }

  if (isLoading && !posts.length) return <Spinner />

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-lg md:text-xl text-[#e8e8f0]">Post Tracker</h1>
          <p className="text-[13px] text-[#9898a8] mt-0.5">{posts.length} posts · drag to change status</p>
        </div>
        <button className="btn-primary w-full sm:w-auto justify-center" onClick={() => openAdd()}><Plus size={14} /> New Post</button>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-4 flex-1 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none scroll-smooth"
        style={{ minHeight: 0 }}
      >
        {COLS.map(col => {
          const colPosts = posts.filter(p => p.status === col.key)
          return (
            <div key={col.key} className="flex flex-col flex-shrink-0 w-[min(85vw,280px)] lg:w-[240px] snap-center lg:snap-start">
              <div className="kanban-col-header">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{color:col.color}}>{col.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:'#1a1a24',color:'#9898a8'}}>{colPosts.length}</span>
                  <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#2a2a35]" onClick={() => openAdd(col.key)}><Plus size={11} className="text-[#9898a8]" /></button>
                </div>
              </div>
              <div className="kanban-col-body" onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,col.key)}>
                {!colPosts.length && <div className="text-[11px] text-[#3a3a4a] text-center py-6">Drop here</div>}
                {colPosts.map(p => (
                  <div key={p._id} draggable onDragStart={e=>{setDragId(p._id);e.dataTransfer.effectAllowed='move'}} onClick={()=>openEdit(p)} className="kanban-card">
                    <div className="text-[13px] font-medium text-[#e8e8f0] mb-2 leading-snug">{p.title}</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge label={p.platform} />
                      {p.scheduledDate && <span className="text-[10px] text-[#5a5a6a]">{new Date(p.scheduledDate).toLocaleDateString()}</span>}
                    </div>
                    {p.status==='published' && p.metrics?.views > 0 && (
                      <div className="text-[10px] text-[#5a5a6a] mt-2 flex gap-3">
                        <span>👁 {p.metrics.views.toLocaleString()}</span>
                        <span>❤ {p.metrics.likes.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {show && (
        <Modal title={edit?'Edit Post':'New Post'} onClose={()=>setShow(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-3">
            <div className="form-group"><label className="form-label">Title *</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Post title" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-group"><label className="form-label">Platform</label><select className="select-field" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Status</label><select className="select-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{COLS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Scheduled Date</label><input className="input-field" type="date" value={form.scheduledDate} onChange={e=>setForm({...form,scheduledDate:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Caption</label><textarea className="textarea-field" rows={3} value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})} placeholder="Write your caption..." /></div>
            <div className="form-group"><label className="form-label">Tags (comma-separated)</label><input className="input-field" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="tips, creator" /></div>
            <div className="form-group"><label className="form-label">Notes</label><input className="input-field" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Internal notes..." /></div>
            {edit && (<><Divider label="Metrics" /><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{['views','likes','comments','shares'].map(m=><div key={m} className="form-group"><label className="form-label capitalize">{m}</label><input className="input-field" type="number" min="0" value={form.metrics[m]} onChange={e=>setForm({...form,metrics:{...form.metrics,[m]:+e.target.value}})} /></div>)}</div></>)}
            {edit && <button className="text-[12px] text-[#f87171] hover:underline mt-1" onClick={handleDelete}>Delete Post</button>}
          </div>
        </Modal>
      )}
    </div>
  )
}
