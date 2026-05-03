import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { dealsApi } from '../api'
import { Modal, Badge, StatCard, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const TYPES = ['sponsored','affiliate','product','ambassador','consulting']
const STATUSES = ['outreach','negotiating','confirmed','completed','cancelled']

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)
  const EF = { brandName:'',contactName:'',contactEmail:'',dealType:'sponsored',status:'outreach',amount:0,deadline:'',notes:'',isPaid:false,contractSigned:false }
  const [form, setForm] = useState(EF)

  const load = async () => {
    setLoading(true)
    try {
      const [d,s] = await Promise.all([dealsApi.getAll(), dealsApi.getSummary()])
      setDeals(d.data.deals); setSummary(s.data)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEdit(null); setForm(EF); setShow(true) }
  const openEdit = (d) => { setEdit(d); setForm({ brandName:d.brandName, contactName:d.contactName||'', contactEmail:d.contactEmail||'', dealType:d.dealType, status:d.status, amount:d.amount, deadline:d.deadline?d.deadline.slice(0,10):'', notes:d.notes||'', isPaid:d.isPaid, contractSigned:d.contractSigned||false }); setShow(true) }

  const handleSave = async () => {
    if (!form.brandName.trim()) return toast.error('Brand name required')
    setSaving(true)
    try {
      if (edit) await dealsApi.update(edit._id, form)
      else await dealsApi.create(form)
      toast.success(edit ? 'Deal updated!' : 'Deal added!'); setShow(false); load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-[#e8e8f0]">Brand Deals CRM</h1>
          <p className="text-[13px] text-[#9898a8] mt-0.5">{deals.length} deals in pipeline</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={14} /> New Deal</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Total Pipeline" value={`$${summary?.totalPipeline?.toLocaleString()||0}`} />
        <StatCard title="Earned" value={`$${summary?.totalEarned?.toLocaleString()||0}`} subColor="#4ade80" sub="Paid" />
        <StatCard title="Pending" value={`$${summary?.totalPending?.toLocaleString()||0}`} subColor="#fbbf24" sub="Awaiting payment" />
        <StatCard title="Active" value={deals.filter(d=>d.status==='confirmed'||d.status==='negotiating').length} sub="Confirmed + Negotiating" />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="data-table w-full">
          <thead><tr>
            {['Brand','Type','Status','Value','Deadline','Payment',''].map(h=><th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {deals.map(d => (
              <tr key={d._id}>
                <td><div className="font-medium text-[#e8e8f0]">{d.brandName}</div>{d.contactEmail&&<div className="text-[11px] text-[#5a5a6a]">{d.contactEmail}</div>}</td>
                <td><Badge label={d.dealType} /></td>
                <td><Badge label={d.status} /></td>
                <td className="font-semibold">${d.amount.toLocaleString()}</td>
                <td className="text-[#9898a8]">{d.deadline?new Date(d.deadline).toLocaleDateString():'—'}</td>
                <td><span className={`badge ${d.isPaid?'badge-green':'badge-amber'}`}>{d.isPaid?'Paid':'Pending'}</span></td>
                <td><button className="btn-ghost text-[11px]" onClick={()=>openEdit(d)}>Edit</button></td>
              </tr>
            ))}
            {!deals.length && <tr><td colSpan={7} className="text-center py-12 text-[#5a5a6a]">No deals yet. Add your first brand deal!</td></tr>}
          </tbody>
        </table>
      </div>

      {summary?.byType?.length>0 && (
        <div className="card">
          <div className="text-[13px] font-medium text-[#9898a8] mb-3">Income by Deal Type</div>
          <div className="space-y-2">
            {summary.byType.map(b=>(
              <div key={b._id} className="flex items-center justify-between py-2" style={{borderBottom:'1px solid #13131c'}}>
                <div className="flex items-center gap-2"><Badge label={b._id} /><span className="text-[11px] text-[#9898a8]">{b.count} deal{b.count!==1?'s':''}</span></div>
                <span className="font-semibold text-[13px]">${b.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {show && (
        <Modal title={edit?'Edit Deal':'New Brand Deal'} onClose={()=>setShow(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-3">
            <div className="form-group"><label className="form-label">Brand Name *</label><input className="input-field" value={form.brandName} onChange={e=>setForm({...form,brandName:e.target.value})} placeholder="e.g. NordVPN" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label className="form-label">Contact Name</label><input className="input-field" value={form.contactName} onChange={e=>setForm({...form,contactName:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Contact Email</label><input className="input-field" type="email" value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label className="form-label">Deal Type</label><select className="select-field" value={form.dealType} onChange={e=>setForm({...form,dealType:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Status</label><select className="select-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label className="form-label">Value ($)</label><input className="input-field" type="number" min="0" value={form.amount} onChange={e=>setForm({...form,amount:+e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Deadline</label><input className="input-field" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="textarea-field" rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPaid} onChange={e=>setForm({...form,isPaid:e.target.checked})} className="accent-[#7c6ef8]" /><span className="text-[13px]">Marked as Paid</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.contractSigned} onChange={e=>setForm({...form,contractSigned:e.target.checked})} className="accent-[#4ade80]" /><span className="text-[13px]">Contract Signed</span></label>
            </div>
            {edit && <button className="text-[12px] text-[#f87171] hover:underline" onClick={async()=>{await dealsApi.delete(edit._id);toast.success('Deleted');setShow(false);load()}}>Delete Deal</button>}
          </div>
        </Modal>
      )}
    </div>
  )
}
