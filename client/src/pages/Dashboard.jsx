import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Sparkles, Plus, ArrowRight, TrendingUp, Eye, DollarSign, FileText } from 'lucide-react'
import usePostStore from '../store/postStore'
import useAuthStore from '../store/authStore'
import { dealsApi, analyticsApi } from '../api'
import { StatCard, Badge, Progress } from '../components/ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-[12px]" style={{ background: '#1a1a24', border: '1px solid #2a2a35' }}>
      <div className="text-[#9898a8] mb-1">{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.value.toLocaleString()} views</div>)}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { posts, fetchPosts } = usePostStore()
  const { user } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchPosts()
    dealsApi.getSummary().then(r => setSummary(r.data)).catch(() => {})
    analyticsApi.getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const published = posts.filter(p => p.status === 'published')
  const scheduled = posts.filter(p => p.status === 'scheduled')
  const goals = stats?.monthlyGoals || user?.monthlyGoals || {}
  const chartData = stats?.monthlyViews || []
  const monthlyPostGoal = goals.posts || 0
  const monthlyIncomeGoal = goals.income || 0
  const postGoalProgress = monthlyPostGoal ? ((goals.currentPosts || 0) / monthlyPostGoal) * 100 : 0
  const incomeGoalProgress = monthlyIncomeGoal ? ((goals.currentIncome || 0) / monthlyIncomeGoal) * 100 : 0

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[22px] text-[#e8e8f0]">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'Creator'} 👋
          </h1>
          <p className="text-[#9898a8] text-[13px] mt-0.5">Here's your brand performance at a glance.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => navigate('/posts')}>
            <Plus size={14} /> New Post
          </button>
          <button className="btn-primary" onClick={() => navigate('/ai')}>
            <Sparkles size={14} /> AI Studio
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} iconColor="#7c6ef8" title="Total Followers" value={stats ? `${(stats.totalFollowers/1000).toFixed(1)}K` : '—'} sub="Across all platforms" subColor="#4ade80" onClick={() => navigate('/analytics')} />
        <StatCard icon={Eye} iconColor="#4ade80" title="Total Views" value={stats ? `${(stats.totalViews/1000).toFixed(0)}K` : '—'} sub="All platforms" onClick={() => navigate('/analytics')} />
        <StatCard icon={DollarSign} iconColor="#fbbf24" title="Income Earned" value={summary ? `$${summary.totalEarned?.toLocaleString()}` : '—'} sub={summary ? `$${summary.totalPending?.toLocaleString()} pending` : ''} subColor="#fbbf24" onClick={() => navigate('/income')} />
        <StatCard icon={FileText} iconColor="#60a5fa" title="Posts Published" value={published.length} sub={`${scheduled.length} scheduled`} subColor="#7c6ef8" onClick={() => navigate('/posts')} />
      </div>

      {/* Chart + Goals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-[13px] text-[#9898a8] font-medium mb-4">Views — Last 12 Months</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6ef8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6ef8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#5a5a6a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a35', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="views" stroke="#7c6ef8" strokeWidth={2} fill="url(#vg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card space-y-5">
          <div className="text-[13px] text-[#9898a8] font-medium">Monthly Goals</div>
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="font-medium">Posts Published</span>
              <span className="text-[#9898a8]">{goals.currentPosts || 0} / {monthlyPostGoal || 0}</span>
            </div>
            <Progress value={postGoalProgress} />
          </div>
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="font-medium">Income Goal</span>
              <span className="text-[#9898a8]">${(goals.currentIncome || 0).toLocaleString()} / ${monthlyIncomeGoal.toLocaleString()}</span>
            </div>
            <Progress value={incomeGoalProgress} color="#4ade80" />
          </div>
          <button className="btn-ghost w-full justify-center text-[12px]" onClick={() => navigate('/income')}>
            Update Goals <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Recent Posts + Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-[#9898a8] font-medium">Recent Posts</span>
            <button className="btn-ghost text-[11px]" onClick={() => navigate('/posts')}>View All</button>
          </div>
          <div className="space-y-0">
            {posts.slice(0, 5).map(p => (
              <div key={p._id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #13131c' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#e8e8f0] truncate">{p.title}</div>
                  <div className="text-[11px] text-[#5a5a6a] mt-0.5">{p.platform} · {p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : 'No date'}</div>
                </div>
                <Badge label={p.status} />
              </div>
            ))}
            {posts.length === 0 && (
              <div className="py-8 text-center text-[#5a5a6a] text-[13px]">
                No posts yet. <button className="text-[#a78bfa] underline" onClick={() => navigate('/posts')}>Add your first</button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="text-[13px] text-[#9898a8] font-medium mb-4">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'New Post', icon: FileText, path: '/posts', color: '#7c6ef8', bg: 'rgba(124,110,248,0.1)' },
              { label: 'New Deal', icon: DollarSign, path: '/deals', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
              { label: 'AI Caption', icon: Sparkles, path: '/ai', color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
              { label: 'Analytics', icon: TrendingUp, path: '/analytics', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="flex items-center gap-2 p-3.5 rounded-xl text-[13px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: a.bg, border: `1px solid ${a.color}25`, color: a.color }}>
                <a.icon size={15} /> {a.label}
              </button>
            ))}
          </div>

          {/* Platform pills */}
          {stats?.summary?.length > 0 && (
            <>
              <div className="divider" />
              <div className="text-[12px] text-[#5a5a6a] mb-3">Platform snapshot</div>
              <div className="space-y-2">
                {stats.summary.slice(0,3).map(s => (
                  <div key={s.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge label={s.platform} />
                    </div>
                    <div className="text-[12px] text-[#9898a8]">{(s.followers/1000).toFixed(1)}K followers</div>
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
