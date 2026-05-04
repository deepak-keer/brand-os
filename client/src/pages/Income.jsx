import { useEffect, useState } from 'react'
import { dealsApi } from '../api'
import useAuthStore from '../store/authStore'
import { StatCard, Progress, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

export default function Income() {
  const { user, updateMe } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState({ posts:20, income:5000, currentPosts:0, currentIncome:0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dealsApi.getSummary().then(r => { setSummary(r.data); setLoading(false) }).catch(()=>setLoading(false))
    if (user?.monthlyGoals) setGoals(user.monthlyGoals)
  }, [user])

  const saveGoals = async () => {
    setSaving(true)
    try { await updateMe({ monthlyGoals: goals }); toast.success('Goals updated!') }
    catch { toast.error('Failed to save') }
    setSaving(false)
  }

  if (loading) return <Spinner />

  const postsPct = Math.min(100, ((goals.currentPosts||0)/(goals.posts||1))*100)
  const incomePct = Math.min(100, ((goals.currentIncome||0)/(goals.income||1))*100)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-lg md:text-xl text-[#e8e8f0]">Income Tracker</h1>
        <p className="text-[13px] text-[#9898a8] mt-0.5">Track earnings, goals, and deal income</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Earned" value={`$${summary?.totalEarned?.toLocaleString()||0}`} subColor="#4ade80" sub="Paid deals" />
        <StatCard title="Pending" value={`$${summary?.totalPending?.toLocaleString()||0}`} subColor="#fbbf24" sub="Awaiting payment" />
        <StatCard title="Total Pipeline" value={`$${summary?.totalPipeline?.toLocaleString()||0}`} sub="All deals" />
        <StatCard title="Income Goal" value={`${Math.round(incomePct)}%`} sub={`$${(goals.currentIncome||0).toLocaleString()} / $${(goals.income||0).toLocaleString()}`} subColor={incomePct>=100?'#4ade80':'#fbbf24'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <div className="text-[13px] font-medium text-[#9898a8]">Monthly Goals</div>

          <div className="p-4 rounded-xl space-y-3" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">Posts Published</span>
              <span className="text-[#9898a8]">{goals.currentPosts} / {goals.posts}</span>
            </div>
            <Progress value={postsPct} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="form-label">Target Posts</label><input className="input-field" type="number" min="0" value={goals.posts} onChange={e=>setGoals({...goals,posts:+e.target.value})} /></div>
              <div><label className="form-label">Published So Far</label><input className="input-field" type="number" min="0" value={goals.currentPosts} onChange={e=>setGoals({...goals,currentPosts:+e.target.value})} /></div>
            </div>
          </div>

          <div className="p-4 rounded-xl space-y-3" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">Income Goal</span>
              <span className="text-[#9898a8]">${(goals.currentIncome||0).toLocaleString()} / ${(goals.income||0).toLocaleString()}</span>
            </div>
            <Progress value={incomePct} color="#4ade80" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="form-label">Target ($)</label><input className="input-field" type="number" min="0" value={goals.income} onChange={e=>setGoals({...goals,income:+e.target.value})} /></div>
              <div><label className="form-label">Earned ($)</label><input className="input-field" type="number" min="0" value={goals.currentIncome} onChange={e=>setGoals({...goals,currentIncome:+e.target.value})} /></div>
            </div>
          </div>

          <button className="btn-primary" onClick={saveGoals} disabled={saving}>{saving?'Saving...':'Save Goals'}</button>
        </div>

        <div className="card">
          <div className="text-[13px] font-medium text-[#9898a8] mb-4">Income by Deal Type</div>
          {summary?.byType?.length > 0 ? (
            <div className="space-y-4">
              {summary.byType.map(b => {
                const pct = Math.round((b.total/(summary.totalPipeline||1))*100)
                const colors = { sponsored:'#7c6ef8', affiliate:'#60a5fa', ambassador:'#4ade80', product:'#f472b6', consulting:'#fbbf24' }
                return (
                  <div key={b._id}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13px] capitalize font-medium">{b._id}</span>
                      <span className="text-[13px] font-semibold">${b.total.toLocaleString()}</span>
                    </div>
                    <Progress value={pct} color={colors[b._id]||'#7c6ef8'} />
                    <div className="text-[11px] text-[#5a5a6a] mt-1">{b.count} deal{b.count!==1?'s':''} · {pct}%</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#5a5a6a] text-[13px]">No deal income data yet.</div>
          )}

          {summary?.monthlyIncome?.length > 0 && (
            <>
              <div className="h-px my-4" style={{ background:'#1e1e2a' }} />
              <div className="text-[13px] font-medium text-[#9898a8] mb-3">Monthly Breakdown</div>
              <div className="space-y-2">
                {summary.monthlyIncome.map(m => (
                  <div key={`${m._id.year}-${m._id.month}`} className="flex justify-between text-[13px]">
                    <span className="text-[#9898a8]">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m._id.month-1]} {m._id.year}</span>
                    <span className="font-semibold">${m.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
