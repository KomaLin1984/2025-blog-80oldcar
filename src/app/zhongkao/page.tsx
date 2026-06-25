'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ============ 配置区 ============
const CONFIG = {
  backendUrl: 'https://pay.80oldcar.com' 
}
// ================================

interface School {
  id: number
  name: string
  district: string
  avg_pickup_rank: number
  quota_3years: string
  teachers_highlight: string
  positive_reviews: string
  negative_reviews: string
  catering_detail: string
  image_url: string
}

interface MatchedSchools {
  "冲": School[]
  "稳": School[]
  "保": School[]
}

export default function ZhongkaoPage() {
  const [score, setScore] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [matchedSchools, setMatchedSchools] = useState<MatchedSchools | null>(null)
  const [rankEstimate, setRankEstimate] = useState<number>(0)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [hasMatched, setHasMatched] = useState(false)
  const [aiReport, setAiReport] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const backend = CONFIG.backendUrl

  // 核心逻辑：直接向后端发起匹配请求，毫秒级出结果！
  const handleSubmit = async () => {
    const s = parseInt(score)
    if (!s || s < 400 || s > 700) {
      alert('请输入有效的中考预估分数（400-700分之间）')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const resp = await fetch(`${backend}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: s, address })
      })
      const data = await resp.json()

      if (data.status === 'success') {
        setRankEstimate(data.rank_estimate)
        setMatchedSchools(data.schools)
        setHasMatched(true)
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      } else {
        setError(data.message || '匹配失败，请重试')
      }
    } catch (e: any) {
      setError('网络连接失败，请刷新重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 完全保留您原始的优质排版 AI 诊断报告
  const handleViewReport = (school: School) => {
    setSelectedSchool(school)
    setIsGenerating(true)
    setShowReport(true)

    setTimeout(() => {
      const report = `🏫 【${school.name}】综合分析报告\n` +
        `----------------------------------------\n` +
        `📍 所属区县：${school.district}\n` +
        `📉 近五年录取位次：约前 ${school.avg_pickup_rank} 名左右\n` +
        `🏛️ 三年定向生名额：${school.quota_3years || '暂无公开统计'}\n\n` +
        `🎓 【师资力量深度剖析】\n${school.teachers_highlight || '暂无详细描述'}\n\n` +
        `👍 【真实家长正面口碑评价】\n${school.positive_reviews || '暂无详细描述'}\n\n` +
        `⚠️ 【真实家长负面吐槽与盲区】\n${school.negative_reviews || '暂无详细描述'}\n\n` +
        `🍔 【餐食与寄宿环境】\n${school.catering_detail || '暂无详细描述'}\n\n` +
        `----------------------------------------\n` +
        `* 提示：本评测由AI对城六区公开数据整理生成，仅供志愿填报公益参考。`
      setAiReport(report)
      setIsGenerating(false)
    }, 800)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-900 via-slate-900 to-black px-4 pt-28 pb-16 text-white'>
      <div className='mx-auto max-w-3xl'>

        {/* 头部精美标语 */}
        <div className='mb-10 text-center transition-all duration-500'>
          <span className='rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold tracking-widest text-blue-400 uppercase border border-blue-500/30'>
            西安城六区专属公益版
          </span>
          <h1 className='mt-4 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-white sm:text-4xl'>
            西安中考 AI 志愿助手
          </h1>
          <p className='mt-3 text-slate-400 text-sm max-w-md mx-auto leading-relaxed'>
            结合近五年录取线、一分一段表及三年定向名额，算法智能呈现“冲、稳、保”梯度学校及深度生活软性标签。
          </p>
        </div>

        {/* 输入面板 */}
        <div className='rounded-3xl bg-slate-800/80 p-6 md:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-md transition-all duration-500'>
          <div className='mb-5'>
            <label className='mb-2 block text-sm font-semibold text-slate-300 tracking-wider'>
              输入您或孩子的预估分数：
            </label>
            <input
              type='number'
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder='请输入分数（例如：642）'
              min='400'
              max='700'
              className='w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-4 text-xl font-bold text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            />
          </div>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-semibold text-slate-300 tracking-wider'>
              家庭居住地址（用于智能研判距离，可不填）：
            </label>
            <input
              type='text'
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder='例如：雁塔区小寨西路'
              className='w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-4 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm'
            />
          </div>

          {!hasMatched ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className='w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-4 text-lg font-extrabold text-white transition hover:opacity-95 shadow-lg active:scale-[0.99] disabled:opacity-60'
            >
              {isLoading ? '正在调用AI算法...' : `🚀 免费一键智能匹配志愿`}
            </button>
          ) : (
            <div className='rounded-xl bg-green-500/20 border border-green-500/30 py-4 text-center text-green-400 font-bold flex items-center justify-center gap-2'>
              <span>✓ 智能匹配成功，推荐高中已呈现在下方</span>
            </div>
          )}

          {error && (
            <p className='mt-4 text-center text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 py-2.5 rounded-lg'>{error}</p>
          )}
        </div>

        {/* 结果显示区 (完美呈现 冲、稳、保) */}
        {matchedSchools && (
          <div id='results-section' className='mt-10 space-y-8 transition-opacity duration-700 ease-in-out'>
            <div className='rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 p-5 shadow-lg border border-blue-400/20 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div>
                <h4 className="font-bold text-lg text-white">估算全统位次成功</h4>
                <p className='text-xs text-blue-100 mt-1'>
                  计分科目调整后，您的预估位次在城六区排在：
                </p>
              </div>
              <div className='text-center sm:text-right'>
                <span className='text-3xl font-black text-white tracking-tight sm:text-4xl'>第 {rankEstimate} 名</span>
                <span className='text-xs block text-teal-100 font-medium'>左右</span>
              </div>
            </div>

            {/* 冲 */}
            {matchedSchools["冲"].length > 0 && (
              <div>
                <div className='mb-4 flex items-center gap-2 border-l-4 border-red-500 pl-3'>
                  <h2 className='text-lg font-extrabold text-red-400'>🔥 冲一冲学校</h2>
                  <span className='text-xs text-slate-400'>(往年录取线稍高于您当前预估，拼一把有概率)</span>
                </div>
                <div className='space-y-3'>
                  {matchedSchools["冲"].map(school => (
                    <SchoolCard key={school.id} school={school} onViewReport={handleViewReport} />
                  ))}
                </div>
              </div>
            )}

            {/* 稳 */}
            {matchedSchools["稳"].length > 0 && (
              <div>
                <div className='mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3'>
                  <h2 className='text-lg font-extrabold text-blue-400'>✅ 稳一稳学校</h2>
                  <span className='text-xs text-slate-400'>(位次高度吻合，录取概率极大，建议作为首选)</span>
                </div>
                <div className='space-y-3'>
                  {matchedSchools["稳"].map(school => (
                    <SchoolCard key={school.id} school={school} onViewReport={handleViewReport} />
                  ))}
                </div>
              </div>
            )}

            {/* 保 */}
            {matchedSchools["保"].length > 0 && (
              <div>
                <div className='mb-4 flex items-center gap-2 border-l-4 border-green-500 pl-3'>
                  <h2 className='text-lg font-extrabold text-green-400'>🛡️ 保一保学校</h2>
                  <span className='text-xs text-slate-400'>(分数线安全垫充足，可作为绝佳的保底选项)</span>
                </div>
                <div className='space-y-3'>
                  {matchedSchools["保"].map(school => (
                    <SchoolCard key={school.id} school={school} onViewReport={handleViewReport} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className='mt-10 text-center text-xs text-slate-500 leading-relaxed max-w-sm mx-auto'>
          免责声明：本AI分析系统仅作为数据公益辅助参考，中考投档录取充满变数，最终填报志愿请务必多方求证。
        </p>
      </div>

      {/* AI评测报告全屏弹窗 */}
      <AnimatePresence>
        {showReport && selectedSchool && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className='max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-2xl text-white'
            >
              <h3 className='mb-4 text-lg font-extrabold text-blue-400 border-b border-slate-700 pb-3 flex items-center gap-2'>
                📊 {selectedSchool.name} - 智能报告诊断
              </h3>

              {isGenerating ? (
                <div className='flex flex-col items-center justify-center py-20 gap-4'>
                  <div className='h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500' />
                  <span className='text-sm text-slate-400 animate-pulse'>正在为您组装海量家长口碑与师资数据...</span>
                </div>
              ) : (
                <div className='space-y-4'>
                  <pre className='whitespace-pre-wrap rounded-xl bg-slate-900 p-5 text-sm leading-relaxed text-slate-300 border border-slate-800 font-sans max-h-[50vh] overflow-y-auto'>
                    {aiReport}
                  </pre>
                </div>
              )}

              <button
                onClick={() => {
                  setShowReport(false)
                  setSelectedSchool(null)
                }}
                className='mt-5 w-full rounded-xl bg-slate-700 py-3 text-sm font-bold text-white transition hover:bg-slate-600'
              >
                关闭评测报告
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 提取的卡片组件 (100% 保持您原本极具质感的设计)
function SchoolCard({ school, onViewReport }: { school: School; onViewReport: (s: School) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className='flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-md transition-all duration-300 gap-4'
    >
      <div>
        <h3 className='font-extrabold text-lg text-slate-100'>{school.name}</h3>
        <p className='text-xs text-blue-400 mt-1 font-semibold'>{school.district}</p>
        <p className='mt-2 text-xs text-slate-400'>
          近5年平均录取最低位次：约第 <strong className="text-slate-200">前 {school.avg_pickup_rank} 名</strong> 左右
        </p>
      </div>
      <button
        onClick={() => onViewReport(school)}
        className='rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95 text-white px-5 py-3 text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 transition-all duration-350'
      >
        <span>深度 AI 评测</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </motion.div>
  )
}