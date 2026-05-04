import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../api'
import { Badge, StatCard, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-[12px]" style={{ background: '#1a1a24', border: '1px solid #2a2a35' }}>
      <div className="text-[#9898a8] mb-1">{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</div>)}
    </div>
  )
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState([])
  const [topPosts, setTopPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editPlatform, setEditPlatform] = useState(null)
  const [form, setForm] = useState({ platform:'YouTube', followers:0, totalViews:0, totalLikes:0, totalComments:0, engagementRate:0 })
  const [saving, setSaving] = useState(false)
  const [chartH, setChartH] = useState(180)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => setChartH(mq.matches ? 200 : 180)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await analyticsApi.getAll()
      setAnalytics(data.analytics); setTopPosts(data.topPosts || [])
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const latestByPlatform = PLATFORMS.map(p => {
    const entries = analytics.filter(a => a.platform === p).sort((a,b) => new Date(b.date)-new Date(a.date))
    return entries[0] || null
  }).filter(Boolean)

  const totalFollowers = latestByPlatform.reduce((a,b) => a+b.followers, 0)
  const totalViews = latestByPlatform.reduce((a,b) => a+b.totalViews, 0)
  const avgER = latestByPlatform.length ? (latestByPlatform.reduce((a,b) => a+b.engagementRate,0)/latestByPlatform.length).toFixed(1) : 0

  const chartData = latestByPlatform.map(a => ({ platform: a.platform, followers: a.followers, views: a.totalViews }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await analyticsApi.create(editPlatform ? { ...form, platform: editPlatform } : form)
      toast.success('Analytics updated!'); setEditPlatform(null); load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-lg md:text-xl text-[#e8e8f0]">Analytics</h1>
        <p className="text-[13px] text-[#9898a8] mt-0.5">Track growth across all your platforms</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Total Followers" value={totalFollowers > 0 ? `${(totalFollowers/1000).toFixed(1)}K` : '—'} sub="Across all platforms" />
        <StatCard title="Total Views" value={totalViews > 0 ? `${(totalViews/1000).toFixed(0)}K` : '—'} sub="All time" />
        <StatCard title="Avg Engagement" value={avgER > 0 ? `${avgER}%` : '—'} subColor={avgER > 5 ? '#4ade80' : '#fbbf24'} sub={avgER > 5 ? 'Excellent!' : 'Keep growing'} />
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card w-full min-w-0">
            <div className="text-[13px] font-medium text-[#9898a8] mb-4">Followers by Platform</div>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="platform" tick={{ fill:'#5a5a6a', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(124,110,248,0.06)' }} />
                <Bar dataKey="followers" fill="#7c6ef8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card w-full min-w-0">
            <div className="text-[13px] font-medium text-[#9898a8] mb-4">Views by Platform</div>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="platform" tick={{ fill:'#5a5a6a', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(74,222,128,0.06)' }} />
                <Bar dataKey="views" fill="#4ade80" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderBottom:'1px solid #1e1e2a' }}>
          <span className="text-[13px] font-medium text-[#9898a8]">Platform Breakdown</span>
          <button type="button" className="btn-primary text-[12px] w-full sm:w-auto justify-center" onClick={() => { setEditPlatform(null); setForm({ platform:'YouTube',followers:0,totalViews:0,totalLikes:0,totalComments:0,engagementRate:0 }) }}>
            + Add Platform
          </button>
        </div>

        <div className="md:hidden p-3 space-y-3">
          {latestByPlatform.map(a => (
            <div key={a._id} className="rounded-xl p-4 space-y-2" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
              <div className="flex items-center justify-between gap-2">
                <Badge label={a.platform} />
                <button type="button" className="btn-ghost text-[11px]" onClick={() => { setEditPlatform(a.platform); setForm({ platform:a.platform, followers:a.followers, totalViews:a.totalViews, totalLikes:a.totalLikes, totalComments:a.totalComments||0, engagementRate:a.engagementRate }) }}>Update</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div><span className="text-[#5a5a6a]">Followers</span><div className="font-medium">{a.followers.toLocaleString()}</div></div>
                <div><span className="text-[#5a5a6a]">Views</span><div className="text-[#9898a8]">{a.totalViews.toLocaleString()}</div></div>
                <div><span className="text-[#5a5a6a]">Likes</span><div className="text-[#9898a8]">{a.totalLikes.toLocaleString()}</div></div>
                <div><span className="text-[#5a5a6a]">Eng.</span><span className={`badge ${a.engagementRate>=5?'badge-green':a.engagementRate>=2?'badge-amber':'badge-red'}`}>{a.engagementRate}%</span></div>
              </div>
            </div>
          ))}
          {!latestByPlatform.length && <div className="text-center py-10 text-[#5a5a6a] text-[13px]">No analytics yet. Add your first platform below.</div>}
        </div>

        <div className="hidden md:block overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="data-table w-full min-w-[640px]">
            <thead><tr>{['Platform','Followers','Views','Likes','Eng. Rate',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {latestByPlatform.map(a => (
                <tr key={a._id}>
                  <td><Badge label={a.platform} /></td>
                  <td className="font-medium">{a.followers.toLocaleString()}</td>
                  <td className="text-[#9898a8]">{a.totalViews.toLocaleString()}</td>
                  <td className="text-[#9898a8]">{a.totalLikes.toLocaleString()}</td>
                  <td><span className={`badge ${a.engagementRate>=5?'badge-green':a.engagementRate>=2?'badge-amber':'badge-red'}`}>{a.engagementRate}%</span></td>
                  <td><button type="button" className="btn-ghost text-[11px]" onClick={() => { setEditPlatform(a.platform); setForm({ platform:a.platform, followers:a.followers, totalViews:a.totalViews, totalLikes:a.totalLikes, totalComments:a.totalComments||0, engagementRate:a.engagementRate }) }}>Update</button></td>
                </tr>
              ))}
              {!latestByPlatform.length && <tr><td colSpan={6} className="text-center py-10 text-[#5a5a6a]">No analytics yet. Add your first platform below.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="text-[13px] font-medium text-[#9898a8] mb-4">{editPlatform ? `Update ${editPlatform}` : 'Add Platform Analytics'}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {!editPlatform && (
            <div className="form-group sm:col-span-2">
              <label className="form-label">Platform</label>
              <select className="select-field" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>
                {PLATFORMS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          )}
          {[['followers','Followers'],['totalViews','Total Views'],['totalLikes','Total Likes'],['engagementRate','Engagement Rate (%)']].map(([k,l]) => (
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input className="input-field" type="number" min="0" step={k==='engagementRate'?'0.1':'1'} value={form[k]||0} onChange={e=>setForm({...form,[k]:+e.target.value})} />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':editPlatform?`Update ${editPlatform}`:'Save Analytics'}</button>
          {editPlatform && <button className="btn-ghost" onClick={()=>setEditPlatform(null)}>Cancel</button>}
        </div>
      </div>

      {topPosts.length > 0 && (
        <div className="card">
          <div className="text-[13px] font-medium text-[#9898a8] mb-4">Top Performing Posts</div>
          <div className="space-y-0">
            {topPosts.map((p,i) => (
              <div key={p._id} className="flex items-center gap-3 py-2.5" style={{ borderBottom:'1px solid #13131c' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[#7c6ef8] flex-shrink-0" style={{ background:'rgba(124,110,248,0.15)' }}>{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{p.title}</div>
                  <div className="flex gap-3 text-[11px] text-[#5a5a6a] mt-0.5">
                    <span>👁 {(p.metrics?.views||0).toLocaleString()}</span>
                    <span>❤ {(p.metrics?.likes||0).toLocaleString()}</span>
                    <span>💬 {(p.metrics?.comments||0).toLocaleString()}</span>
                  </div>
                </div>
                <Badge label={p.platform} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
