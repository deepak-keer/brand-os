import { useState } from 'react'
import { Sparkles, Lightbulb, Hash, User, Copy, Plus, Check } from 'lucide-react'
import { aiApi } from '../api'
import { useIdeaStore } from '../store/stores'
import toast from 'react-hot-toast'

const PLATFORMS = ['YouTube','Instagram','Twitter','LinkedIn','TikTok']
const TONES = ['Engaging & Authentic','Professional','Casual & Fun','Motivational','Educational','Controversial']
const STYLES = ['Educational','Entertainment','Motivational','Behind the Scenes','Tutorial','Case Study','Listicle']

function AICard({ icon: Icon, iconBg, title, sub, children }) {
  return (
    <div className="card space-y-4" style={{ background:'linear-gradient(135deg, rgba(15,15,22,0.8), rgba(12,12,18,0.9))', border:'1px solid #2a2a35' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={18} />
        </div>
        <div>
          <div className="font-semibold text-[15px] text-[#e8e8f0]">{title}</div>
          <div className="text-[12px] text-[#5a5a6a]">{sub}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function LoadingBtn({ loading, label, loadLabel, onClick, color = '#7c6ef8' }) {
  return (
    <button className="w-full flex items-center justify-center gap-2 font-medium text-[13px] py-2.5 rounded-xl transition-all active:scale-[0.98]"
      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
      onClick={onClick} disabled={loading}>
      {loading
        ? <><div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor:`${color}40`, borderTopColor: color }} /> {loadLabel}</>
        : label}
    </button>
  )
}

export default function AIStudio() {
  const { createIdea } = useIdeaStore()
  const [copied, setCopied] = useState(false)

  const [cap, setCap] = useState({ title:'', platform:'YouTube', tone:'Engaging & Authentic' })
  const [caption, setCaption] = useState('')
  const [capLoading, setCapLoading] = useState(false)

  const [ideaForm, setIdeaForm] = useState({ niche:'', platform:'YouTube', style:'Educational' })
  const [ideas, setIdeas] = useState([])
  const [ideaLoading, setIdeaLoading] = useState(false)

  const [hashForm, setHashForm] = useState({ topic:'', platform:'Instagram' })
  const [hashtags, setHashtags] = useState([])
  const [hashLoading, setHashLoading] = useState(false)

  const [bioForm, setBioForm] = useState({ name:'', niche:'', platforms:[], style:'professional' })
  const [bios, setBios] = useState([])
  const [bioLoading, setBioLoading] = useState(false)

  const generateCaption = async () => {
    if (!cap.title.trim()) return toast.error('Enter a post title')
    setCapLoading(true)
    try {
      const { data } = await aiApi.generateCaption(cap)
      setCaption(data.caption); toast.success('Caption generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'AI failed. Check GROQ_API_KEY.') }
    setCapLoading(false)
  }

  const generateIdeas = async () => {
    if (!ideaForm.niche.trim()) return toast.error('Enter your niche')
    setIdeaLoading(true)
    try {
      const { data } = await aiApi.generateIdeas({ ...ideaForm, count: 5 })
      setIdeas(data.ideas); toast.success('5 ideas generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'AI failed.') }
    setIdeaLoading(false)
  }

  const generateHashtags = async () => {
    if (!hashForm.topic.trim()) return toast.error('Enter a topic')
    setHashLoading(true)
    try {
      const { data } = await aiApi.generateHashtags({ ...hashForm, count: 25 })
      setHashtags(data.hashtags); toast.success('Hashtags generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'AI failed.') }
    setHashLoading(false)
  }

  const generateBio = async () => {
    if (!bioForm.name.trim()) return toast.error('Enter your name')
    setBioLoading(true)
    try {
      const { data } = await aiApi.generateBio(bioForm)
      setBios(data.bios); toast.success('Bios generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'AI failed.') }
    setBioLoading(false)
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true); toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const addIdeaToBoard = async (idea) => {
    try {
      await createIdea({ title: idea.title, description: idea.description, platform: ideaForm.platform, column: 'backlog', tags: [ideaForm.niche.toLowerCase()], aiSuggested: true })
      toast.success('Added to Idea Board!')
    } catch { toast.error('Failed to add') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-xl text-[#e8e8f0]">AI Studio</h1>
        <p className="text-[13px] text-[#9898a8] mt-0.5">Powered by Groq — generate content instantly</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Caption Generator */}
        <AICard icon={Sparkles} iconBg="rgba(124,110,248,0.15)" title="Caption Generator" sub="Platform-perfect captions with hashtags">
          <div className="form-group"><label className="form-label">Post Title</label><input className="input-field" placeholder="e.g. 10 Productivity Hacks for Creators" value={cap.title} onChange={e=>setCap({...cap,title:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label className="form-label">Platform</label><select className="select-field" value={cap.platform} onChange={e=>setCap({...cap,platform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Tone</label><select className="select-field" value={cap.tone} onChange={e=>setCap({...cap,tone:e.target.value})}>{TONES.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <LoadingBtn loading={capLoading} label={<><Sparkles size={14}/> Generate Caption</>} loadLabel="Generating..." onClick={generateCaption} color="#7c6ef8" />
          {caption && (
            <div className="rounded-xl p-4 space-y-2" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#9898a8]">Generated Caption</span>
                <button className="flex items-center gap-1 text-[11px] text-[#a78bfa] hover:underline" onClick={() => copyText(caption)}>
                  {copied ? <><Check size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
                </button>
              </div>
              <p className="text-[13px] text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{caption}</p>
            </div>
          )}
        </AICard>

        {/* Idea Generator */}
        <AICard icon={Lightbulb} iconBg="rgba(74,222,128,0.12)" title="Content Idea Generator" sub="5 viral ideas for your niche">
          <div className="form-group"><label className="form-label">Your Niche</label><input className="input-field" placeholder="e.g. Personal Finance, Tech, Fitness" value={ideaForm.niche} onChange={e=>setIdeaForm({...ideaForm,niche:e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label className="form-label">Platform</label><select className="select-field" value={ideaForm.platform} onChange={e=>setIdeaForm({...ideaForm,platform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Style</label><select className="select-field" value={ideaForm.style} onChange={e=>setIdeaForm({...ideaForm,style:e.target.value})}>{STYLES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <LoadingBtn loading={ideaLoading} label={<><Lightbulb size={14}/> Generate 5 Ideas</>} loadLabel="Generating..." onClick={generateIdeas} color="#4ade80" />
          {ideas.length > 0 && (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {ideas.map((idea,i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[#4ade80] flex-shrink-0" style={{ background:'rgba(74,222,128,0.12)' }}>{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#e8e8f0] mb-0.5">{idea.title}</div>
                    <div className="text-[11px] text-[#9898a8] mb-2 leading-relaxed">{idea.description}</div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-blue text-[10px]">{idea.format}</span>
                      <button className="flex items-center gap-1 text-[11px] text-[#a78bfa] hover:underline" onClick={() => addIdeaToBoard(idea)}><Plus size={11}/> Add to Board</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AICard>

        {/* Hashtag Generator */}
        <AICard icon={Hash} iconBg="rgba(96,165,250,0.12)" title="Hashtag Generator" sub="25 trending hashtags for your post">
          <div className="form-group"><label className="form-label">Topic / Post Title</label><input className="input-field" placeholder="e.g. Morning routine for productivity" value={hashForm.topic} onChange={e=>setHashForm({...hashForm,topic:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Platform</label><select className="select-field" value={hashForm.platform} onChange={e=>setHashForm({...hashForm,platform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
          <LoadingBtn loading={hashLoading} label={<><Hash size={14}/> Generate Hashtags</>} loadLabel="Generating..." onClick={generateHashtags} color="#60a5fa" />
          {hashtags.length > 0 && (
            <div className="rounded-xl p-3" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-[#9898a8]">{hashtags.length} hashtags</span>
                <button className="text-[11px] text-[#a78bfa] hover:underline" onClick={() => copyText(hashtags.join(' '))}><Copy size={11}/> Copy All</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((h,i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" style={{ background:'rgba(96,165,250,0.1)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.2)' }} onClick={() => copyText(h)}>{h}</span>
                ))}
              </div>
            </div>
          )}
        </AICard>

        {/* Bio Generator */}
        <AICard icon={User} iconBg="rgba(244,114,182,0.12)" title="Bio Generator" sub="Professional bios for all platforms">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label className="form-label">Your Name</label><input className="input-field" placeholder="Your full name" value={bioForm.name} onChange={e=>setBioForm({...bioForm,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Niche</label><input className="input-field" placeholder="e.g. Tech Creator" value={bioForm.niche} onChange={e=>setBioForm({...bioForm,niche:e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Style</label><select className="select-field" value={bioForm.style} onChange={e=>setBioForm({...bioForm,style:e.target.value})}><option value="professional">Professional</option><option value="casual">Casual & Fun</option><option value="minimal">Minimal</option><option value="bold">Bold & Direct</option></select></div>
          <LoadingBtn loading={bioLoading} label={<><User size={14}/> Generate Bios</>} loadLabel="Generating..." onClick={generateBio} color="#f472b6" />
          {bios.length > 0 && (
            <div className="space-y-2">
              {bios.map((b,i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background:'#18181f', border:'1px solid #2a2a35' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-[#9898a8] capitalize">{b.platform} bio</span>
                    <button className="text-[11px] text-[#a78bfa] hover:underline" onClick={() => copyText(b.bio)}><Copy size={11}/> Copy</button>
                  </div>
                  <p className="text-[12px] text-[#e8e8f0] leading-relaxed">{b.bio}</p>
                </div>
              ))}
            </div>
          )}
        </AICard>
      </div>

      {/* Tips */}
      <div className="card">
        <div className="text-[13px] font-medium text-[#9898a8] mb-3">💡 Pro Tips for Better AI Results</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { c:'#7c6ef8', t:'Be Specific', d:'The more specific your title or niche, the better the output.' },
            { c:'#4ade80', t:'Match the Tone', d:'Pick Casual for Instagram, Professional for LinkedIn.' },
            { c:'#60a5fa', t:'Iterate', d:'Generate multiple times and combine the best parts.' },
            { c:'#f472b6', t:'Customize', d:'Always edit AI output to match your unique voice.' },
          ].map(tip => (
            <div key={tip.t} className="p-3 rounded-xl" style={{ background:'#18181f', border:'1px solid #1e1e2a' }}>
              <div className="text-[13px] font-semibold mb-1" style={{ color: tip.c }}>{tip.t}</div>
              <div className="text-[11px] text-[#9898a8] leading-relaxed">{tip.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
