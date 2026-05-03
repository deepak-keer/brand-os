import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  BarChart2, Calendar, Lightbulb, Handshake, DollarSign,
  Sparkles, FileText, ArrowRight, Check, Star, Menu, X,
  TrendingUp, Shield, Globe, Users, ChevronDown
} from 'lucide-react'

const FEATURES = [
  { icon: BarChart2, color: '#7c6ef8', title: 'Analytics Dashboard', desc: 'Track followers, views, and engagement across YouTube, Instagram, LinkedIn, TikTok, and Twitter in one view.' },
  { icon: Calendar, color: '#4ade80', title: 'Content Calendar', desc: 'Schedule and visualize your content pipeline. Click any date to instantly schedule a post.' },
  { icon: FileText, color: '#60a5fa', title: 'Post Tracker', desc: '5-stage Kanban pipeline — Idea → Draft → Review → Scheduled → Published. Drag and drop to move posts.' },
  { icon: Lightbulb, color: '#fbbf24', title: 'Idea Board', desc: 'Capture content ideas on a visual Kanban board. Move ideas from backlog to in-progress to ready.' },
  { icon: Handshake, color: '#f472b6', title: 'Brand Deal CRM', desc: 'Manage sponsorships, affiliate deals, and partnerships. Track status from outreach to payment.' },
  { icon: DollarSign, color: '#4ade80', title: 'Income Tracker', desc: 'Set monthly income goals, track earned vs pending payments, and see income breakdown by deal type.' },
  { icon: Sparkles, color: '#a78bfa', title: 'AI Studio (Groq)', desc: 'Generate platform-perfect captions, viral content ideas, trending hashtags, and professional bios with AI.' },
  { icon: TrendingUp, color: '#60a5fa', title: 'Goal Tracking', desc: 'Set and track monthly goals for posts published and income earned. Visualize your progress every day.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect to get started',
    features: ['5 posts per month', 'Idea board (10 ideas)', '1 platform analytics', 'Basic AI (5 gen/day)', 'Brand OS Dashboard'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For serious creators',
    features: ['Unlimited posts', 'Unlimited ideas', 'All platform analytics', 'AI Studio (100 gen/day)', 'Brand Deal CRM', 'Income tracker', 'Priority support'],
    cta: 'Start Pro — $19/mo',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    desc: 'For creator teams',
    features: ['Everything in Pro', 'Up to 5 team members', 'Shared content calendar', 'Team analytics', 'Client reporting', 'Custom branding', 'Dedicated support'],
    cta: 'Start Team Plan',
    highlight: false,
  },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', handle: '@sarahcreates', avatar: 'SK', niche: 'Finance Creator', text: 'Brand OS replaced 4 different tools I was using. The deal CRM alone saves me hours every week negotiating brand partnerships.', stars: 5 },
  { name: 'Marcus T.', handle: '@marcusmakes', avatar: 'MT', niche: 'Tech YouTuber', text: 'The AI caption generator is scary good. I went from spending 30 min per post on captions to under 2 minutes. Total game changer.', stars: 5 },
  { name: 'Priya N.', handle: '@priyabuilds', avatar: 'PN', niche: 'LinkedIn Creator', text: 'Finally a tool built for creators, not just marketers. The analytics dashboard gives me exactly the insights I need to grow.', stars: 5 },
  { name: 'Jake L.', handle: '@jakecontent', avatar: 'JL', niche: 'Instagram Creator', text: 'I tracked my first $10K month using the income tracker. Seeing all my brand deals in one pipeline is incredibly motivating.', stars: 5 },
]

const FAQS = [
  { q: 'Is Brand OS really free to start?', a: 'Yes! Our Free plan gives you full access to the core features. No credit card required.' },
  { q: 'Which AI model powers the AI Studio?', a: 'Brand OS uses Groq for fast content generation.' },
  { q: 'Can I track multiple platforms?', a: 'Absolutely. Brand OS supports YouTube, Instagram, Twitter/X, LinkedIn, and TikTok simultaneously.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit and at rest. We never share or sell your data. You own your content.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime, no questions asked. Your data is exportable at any time.' },
]

function StatBadge({ value, label }) {
  return (
    <div className="flex flex-col items-center px-8 py-4">
      <div className="font-display text-4xl font-bold text-[#e8e8f0] mb-1">{value}</div>
      <div className="text-[13px] text-[#9898a8]">{label}</div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#070709' }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}
        style={{ background: scrolled ? 'rgba(7,7,9,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid #1e1e2a' : '1px solid transparent' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#111119', border: '1px solid #2a2a35' }}>
              <img src="/logo.png" alt="Brand OS" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-display font-bold text-[16px] text-[#e8e8f0]">Brand OS</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {['Features','Pricing','FAQ'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="text-[13px] text-[#9898a8] hover:text-[#e8e8f0] transition-colors font-medium">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-[13px] text-[#9898a8] hover:text-[#e8e8f0] font-medium transition-colors">Sign in</Link>
            <button className="btn-primary text-[13px]" onClick={() => navigate('/register')}>
              Get Started Free <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden btn-icon" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 pt-2 flex flex-col gap-2" style={{ background: '#0c0c13', borderBottom: '1px solid #1e1e2a' }}>
            {['Features','Pricing','FAQ'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[14px] text-[#9898a8] py-2" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="flex gap-2 mt-2">
              <Link to="/login" className="btn-ghost flex-1 justify-center">Sign in</Link>
              <button className="btn-primary flex-1 justify-center" onClick={() => navigate('/register')}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #7c6ef8 0%, transparent 70%)' }} />
        <div className="absolute top-32 left-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #f472b6 0%, transparent 70%)' }} />
        <div className="absolute top-32 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium mb-6 animate-fade-in"
            style={{ background: 'rgba(124,110,248,0.12)', border: '1px solid rgba(124,110,248,0.25)', color: '#a78bfa' }}>
            <Sparkles size={13} /> Powered by Groq AI
          </div>

          <h1 className="font-display font-bold text-[clamp(40px,7vw,72px)] leading-[1.08] tracking-tight mb-6 animate-slide-up">
            The Creator's
            <br />
            <span className="gradient-text">Command Center</span>
          </h1>

          <p className="text-[clamp(16px,2vw,20px)] text-[#9898a8] leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Manage your posts, brand deals, analytics, and AI content generation — all in one beautifully designed dashboard built for serious creators.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up delay-200">
            <button className="btn-primary text-[15px] px-8 py-3.5" onClick={() => navigate('/register')}>
              Start for Free <ArrowRight size={15} />
            </button>
            <a href="#features" className="btn-ghost text-[15px] px-8 py-3.5 justify-center">
              See Features
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-[12px] text-[#5a5a6a] animate-fade-in delay-300">
            {['No credit card required', 'Free plan forever', 'Setup in 2 minutes'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <Check size={12} className="text-[#4ade80]" /> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto mt-16 animate-slide-up delay-400">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2a2a35', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(124,110,248,0.12)' }}>
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0f0f16', borderBottom: '1px solid #1e1e2a' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
              </div>
              <div className="flex-1 mx-4 bg-[#1a1a24] rounded-md px-3 py-1 text-[11px] text-[#5a5a6a]">app.brandos.io/dashboard</div>
            </div>
            {/* Dashboard preview */}
            <div className="p-4" style={{ background: '#0a0a10' }}>
              {/* Top stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Followers', val: '78.5K', color: '#7c6ef8', change: '+2.3K' },
                  { label: 'Monthly Views', val: '435K', color: '#4ade80', change: '+18K' },
                  { label: 'Income Earned', val: '$4,300', color: '#fbbf24', change: 'this month' },
                  { label: 'Posts Published', val: '12', color: '#60a5fa', change: '3 scheduled' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: '#0f0f16', border: '1px solid #1e1e2a' }}>
                    <div className="text-[11px] text-[#5a5a6a] mb-1.5">{s.label}</div>
                    <div className="font-display font-bold text-[20px] mb-1" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[10px] text-[#4ade80]">{s.change}</div>
                  </div>
                ))}
              </div>
              {/* Chart + notifications */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 rounded-xl p-3" style={{ background: '#0f0f16', border: '1px solid #1e1e2a' }}>
                  <div className="text-[11px] text-[#5a5a6a] mb-3">Views — Last 12 Months</div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[32,45,28,67,54,81,72,90,65,43,78,95].map((v,i) => (
                      <div key={i} className="flex-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                        style={{ height: `${v}%`, background: `hsl(${250 + i*3}, 70%, 65%)` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {['J','F','M','A','M','J','J','A','S','O','N','D'].map(m => (
                      <span key={m} className="text-[9px] text-[#3a3a4a] flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#0f0f16', border: '1px solid #1e1e2a' }}>
                  <div className="text-[11px] text-[#5a5a6a] mb-3">Recent Activity</div>
                  {[
                    { icon: '🎉', text: 'Post published', color: '#4ade80' },
                    { icon: '🤝', text: 'Deal confirmed', color: '#7c6ef8' },
                    { icon: '💰', text: 'Payment received', color: '#fbbf24' },
                    { icon: '✦', text: 'AI generated', color: '#f472b6' },
                  ].map((n,i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      <span className="text-sm">{n.icon}</span>
                      <span className="text-[11px]" style={{ color: n.color }}>{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 px-6" style={{ borderTop: '1px solid #1e1e2a', borderBottom: '1px solid #1e1e2a' }}>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center divide-x" style={{ borderColor: '#1e1e2a' }}>
          <StatBadge value="12,000+" label="Creators using Brand OS" />
          <StatBadge value="$8.4M+" label="Brand deals tracked" />
          <StatBadge value="450K+" label="Posts scheduled" />
          <StatBadge value="4.9★" label="Average rating" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Everything you need</div>
            <h2 className="font-display font-bold text-[clamp(28px,4vw,44px)] text-[#e8e8f0] mb-4">
              Built for creators, by creators
            </h2>
            <p className="text-[16px] text-[#9898a8] max-w-xl mx-auto">
              Replace 6+ tools with one dashboard. Every feature is designed around how creators actually work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-5 rounded-2xl transition-all hover:-translate-y-1 cursor-default"
                style={{ background: '#0f0f16', border: '1px solid #1e1e2a' }}
                onMouseEnter={e => e.currentTarget.style.border = `1px solid ${f.color}30`}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid #1e1e2a'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}15` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="font-display font-semibold text-[14px] text-[#e8e8f0] mb-2">{f.title}</h3>
                <p className="text-[12px] text-[#9898a8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6" style={{ background: '#0a0a10' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="section-label mb-3">How it works</div>
          <h2 className="font-display font-bold text-[clamp(28px,4vw,44px)] text-[#e8e8f0] mb-16">
            Up and running in minutes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '⚡', title: 'Create your account', desc: 'Sign up free in 30 seconds. No credit card, no setup fees.' },
              { step: '02', icon: '📊', title: 'Connect your platforms', desc: 'Add your social profiles and enter your current follower counts to start tracking.' },
              { step: '03', icon: '🚀', title: 'Start creating & growing', desc: 'Schedule posts, track deals, generate AI content, and watch your brand grow.' },
            ].map(s => (
              <div key={s.step} className="relative">
                <div className="text-[11px] font-mono font-bold text-[#5a5a6a] mb-3">{s.step}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-display font-semibold text-[16px] text-[#e8e8f0] mb-2">{s.title}</h3>
                <p className="text-[13px] text-[#9898a8] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Creator Stories</div>
            <h2 className="font-display font-bold text-[clamp(28px,4vw,44px)] text-[#e8e8f0]">
              Loved by creators worldwide
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: '#0f0f16', border: '1px solid #1e1e2a' }}>
                <div className="flex gap-1 mb-3">
                  {Array(t.stars).fill(0).map((_,si) => <Star key={si} size={13} className="text-[#fbbf24] fill-[#fbbf24]" />)}
                </div>
                <p className="text-[13px] text-[#c8c8d8] leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] text-white"
                    style={{ background: 'linear-gradient(135deg, #7c6ef8, #f472b6)' }}>{t.avatar}</div>
                  <div>
                    <div className="text-[13px] font-medium text-[#e8e8f0]">{t.name}</div>
                    <div className="text-[11px] text-[#5a5a6a]">{t.niche}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6" style={{ background: '#0a0a10' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-3">Pricing</div>
            <h2 className="font-display font-bold text-[clamp(28px,4vw,44px)] text-[#e8e8f0] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-[16px] text-[#9898a8]">Start free. Upgrade when you're ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <div key={i} className={`relative p-6 rounded-2xl flex flex-col ${plan.highlight ? 'glow-purple' : ''}`}
                style={{ background: plan.highlight ? '#12101e' : '#0f0f16', border: plan.highlight ? '1px solid rgba(124,110,248,0.4)' : '1px solid #1e1e2a' }}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold text-white"
                    style={{ background: '#7c6ef8' }}>{plan.badge}</div>
                )}
                <div className="mb-5">
                  <div className="text-[13px] font-semibold text-[#9898a8] mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display font-bold text-[36px] text-[#e8e8f0]">{plan.price}</span>
                    <span className="text-[13px] text-[#5a5a6a]">{plan.period}</span>
                  </div>
                  <div className="text-[12px] text-[#5a5a6a]">{plan.desc}</div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-[13px] text-[#c8c8d8]">
                      <Check size={13} className="text-[#4ade80] flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.highlight ? 'btn-primary w-full justify-center py-3' : 'btn-ghost w-full justify-center py-3'}
                  onClick={() => navigate('/register')}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-3">FAQ</div>
            <h2 className="font-display font-bold text-[clamp(28px,4vw,40px)] text-[#e8e8f0]">
              Common questions
            </h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e1e2a' }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                  style={{ background: openFaq === i ? '#13131c' : '#0f0f16' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-[14px] text-[#e8e8f0]">{faq.q}</span>
                  <ChevronDown size={16} className={`text-[#9898a8] transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[13px] text-[#9898a8] leading-relaxed" style={{ background: '#13131c' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-12 px-6" style={{ borderTop: '1px solid #1e1e2a', borderBottom: '1px solid #1e1e2a' }}>
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8">
          {[
            { icon: Shield, label: 'SOC 2 Compliant' },
            { icon: Globe, label: 'GDPR Ready' },
            { icon: Users, label: '12K+ Creators' },
            { icon: TrendingUp, label: '99.9% Uptime' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2.5 text-[13px] text-[#9898a8]">
              <b.icon size={16} className="text-[#4ade80]" />
              {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
            style={{ background: 'radial-gradient(ellipse, #7c6ef8, transparent 70%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: '#111119', border: '1px solid #2a2a35', boxShadow: '0 20px 60px rgba(124,110,248,0.18)' }}>
            <img src="/logo.png" alt="Brand OS" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="font-display font-bold text-[clamp(32px,5vw,52px)] text-[#e8e8f0] mb-4">
            Ready to build your brand?
          </h2>
          <p className="text-[16px] text-[#9898a8] mb-8">
            Join 12,000+ creators who manage their entire personal brand from one dashboard.
          </p>
          <button className="btn-primary text-[16px] px-10 py-4" onClick={() => navigate('/register')}>
            Get Started Free <ArrowRight size={16} />
          </button>
          <div className="mt-4 text-[12px] text-[#5a5a6a]">No credit card · Free forever plan · Setup in 2 min</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ borderTop: '1px solid #1e1e2a' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: '#111119', border: '1px solid #2a2a35' }}>
                  <img src="/logo.png" alt="Brand OS" className="w-5 h-5 object-contain" />
                </div>
                <span className="font-display font-bold text-[15px] text-[#e8e8f0]">Brand OS</span>
              </div>
              <p className="text-[12px] text-[#5a5a6a] leading-relaxed">
                The creator's command center. Built for YouTubers, Instagram creators, LinkedIn builders, and everyone in between.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-12 text-[13px]">
              {[
                { title: 'Product', links: [['Features','#features'],['Pricing','#pricing'],['Changelog','#'],['Roadmap','#']] },
                { title: 'Company', links: [['About','#'],['Blog','#'],['Careers','#'],['Press','#']] },
                { title: 'Legal', links: [['Privacy Policy','#'],['Terms of Service','#'],['Cookie Policy','#']] },
              ].map(col => (
                <div key={col.title}>
                  <div className="font-semibold text-[#e8e8f0] mb-3">{col.title}</div>
                  <div className="space-y-2">
                    {col.links.map(([label, href]) => (
                      <a key={label} href={href} className="block text-[#9898a8] hover:text-[#e8e8f0] transition-colors">{label}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: '1px solid #1e1e2a' }}>
            <div className="text-[12px] text-[#5a5a6a]">© 2025 Brand OS. All rights reserved.</div>
            <div className="flex gap-4">
              {['Twitter','GitHub','LinkedIn'].map(s => (
                <a key={s} href="#" className="text-[12px] text-[#5a5a6a] hover:text-[#e8e8f0] transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
