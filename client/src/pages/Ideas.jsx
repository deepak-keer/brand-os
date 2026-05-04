import { useEffect, useState, useRef } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useIdeaStore } from '../store/stores'
import { Modal, Badge, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const COLS = [
  { key:'backlog', label:'Backlog', color:'#5a5a6a' },
  { key:'in-progress', label:'In Progress', color:'#fbbf24' },
  { key:'ready', label:'Ready', color:'#4ade80' },
]
const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok']
const EF = { title:'', description:'', platform:'YouTube', column:'backlog', tags:'', priority:'medium' }

export default function Ideas() {
  const { ideas, fetchIdeas, createIdea, updateIdea, deleteIdea, moveIdea, isLoading } = useIdeaStore()
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EF)
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [mobileCol, setMobileCol] = useState(COLS[0].key)
  const colRefs = useRef({})

  useEffect(() => { fetchIdeas() }, [])

  const openAdd = (col='backlog') => { setEdit(null); setForm({...EF,column:col}); setShow(true) }
  const openEdit = (i) => { setEdit(i); setForm({ title:i.title, description:i.description||'', platform:i.platform, column:i.column, tags:(i.tags||[]).join(', '), priority:i.priority||'medium' }); setShow(true) }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title required')
    setSaving(true)
    try {
      const d = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) }
      if (edit) await updateIdea(edit._id, d)
      else await createIdea(d)
      toast.success(edit ? 'Updated!' : 'Idea added!')
      setShow(false)
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const onDrop = async (e, col) => {
    e.preventDefault()
    if (!dragId) return
    const idea = ideas.find(i => i._id === dragId)
    if (idea && idea.column !== col) { await moveIdea(dragId, col, 0); toast.success(`Moved to ${col}`) }
    setDragId(null)
  }

  if (isLoading && !ideas.length) return <Spinner />

  const scrollToCol = (key) => {
    setMobileCol(key)
    colRefs.current[key]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-lg md:text-xl text-[#e8e8f0]">Idea Board</h1>
          <p className="text-[13px] text-[#9898a8] mt-0.5">{ideas.length} ideas · drag to move between stages</p>
        </div>
        <button className="btn-primary w-full sm:w-auto justify-center" onClick={() => openAdd()}><Plus size={14} /> New Idea</button>
      </div>

      <div className="lg:hidden mb-3">
        <label className="form-label">Column</label>
        <select className="select-field" value={mobileCol} onChange={e => scrollToCol(e.target.value)}>
          {COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      <div
        className="flex gap-4 overflow-x-auto flex-1 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none scroll-smooth"
        style={{ minHeight: 0 }}
      >
        {COLS.map(col => {
          const colIdeas = ideas.filter(i => i.column === col.key)
          return (
            <div
              key={col.key}
              ref={el => { colRefs.current[col.key] = el }}
              className="flex flex-col flex-shrink-0 w-[min(88vw,300px)] lg:w-[300px] snap-center lg:snap-start"
            >
              <div className="kanban-col-header">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{color:col.color}}>{col.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:'#1a1a24',color:'#9898a8'}}>{colIdeas.length}</span>
                  <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#2a2a35]" onClick={() => openAdd(col.key)}><Plus size={11} className="text-[#9898a8]" /></button>
                </div>
              </div>
              <div className="kanban-col-body" onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,col.key)}>
                {!colIdeas.length && <div className="text-[11px] text-[#3a3a4a] text-center py-8">Drop ideas here</div>}
                {colIdeas.map(idea => (
                  <div key={idea._id} draggable onDragStart={e=>{setDragId(idea._id);e.dataTransfer.effectAllowed='move'}} onClick={()=>openEdit(idea)} className="kanban-card cursor-grab active:cursor-grabbing">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-[13px] font-medium text-[#e8e8f0] leading-snug">{idea.title}</div>
                      {idea.aiSuggested && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded flex-shrink-0" style={{background:'rgba(124,110,248,0.15)',color:'#a78bfa'}}>
                          <Sparkles size={9} /> AI
                        </span>
                      )}
                    </div>
                    {idea.description && <div className="text-[11px] text-[#9898a8] mb-2 leading-relaxed line-clamp-2">{idea.description}</div>}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge label={idea.platform} />
                      {idea.priority && idea.priority !== 'medium' && <Badge label={idea.priority} />}
                      {(idea.tags||[]).slice(0,2).map(t => <span key={t} className="badge badge-purple text-[10px]">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {show && (
        <Modal title={edit?'Edit Idea':'New Idea'} onClose={()=>setShow(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-3">
            <div className="form-group"><label className="form-label">Title *</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Content idea..." /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="textarea-field" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief description..." /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-group"><label className="form-label">Platform</label><select className="select-field" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Priority</label><select className="select-field" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Column</label><select className="select-field" value={form.column} onChange={e=>setForm({...form,column:e.target.value})}>{COLS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Tags</label><input className="input-field" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="ai, tutorial, viral" /></div>
            {edit && <button className="text-[12px] text-[#f87171] hover:underline" onClick={async()=>{await deleteIdea(edit._id);toast.success('Deleted');setShow(false)}}>Delete Idea</button>}
          </div>
        </Modal>
      )}
    </div>
  )
}
