'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import schoolsData from '@/data/zhongkao-schools.json'

// ============ 配置区（小林在这里修改）============
const PAYMENT_CONFIG = {
  price: 2, // 定价（元）
  // 支付后端地址（留空则使用相对路径，生产环境填完整域名）
  backendUrl: '',
  // 例如: backendUrl: 'https://pay.80oldcar.com'
}
// ================================================

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
  chong: School[]
  wen: School[]
  bao: School[]
}

export default function ZhongkaoPage() {
  const [score, setScore] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [matchedSchools, setMatchedSchools] = useState<MatchedSchools | null>(null)
  const [rankEstimate, setRankEstimate] = useState<number>(0)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [aiReport, setAiReport] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 二维码弹窗状态
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [currentOrderId, setCurrentOrderId] = useState<string>('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string>('')

  const backend = PAYMENT_CONFIG.backendUrl || ''

  // 页面加载时检查支付结果（从支付宝跳转回来）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('result')
    const scoreParam = params.get('score')
    const orderIdParam = params.get('order_id')

    if (result === 'paid' && scoreParam) {
      setIsPaid(true)
      setScore(scoreParam)

      const s = parseInt(scoreParam)
      const rank = estimateRank(s)
      setRankEstimate(rank)
      setMatchedSchools(calculateMatches(rank))

      window.history.replaceState({}, '', '/zhongkao')
    } else if (orderIdParam) {
      // 有 orderId 但无 paid 状态，说明用户在支付宝页面取消了
      // 此时先查一下订单状态
      checkOrderStatus(orderIdParam)
    }
  }, [])

  // 检查订单状态（兜底）
  async function checkOrderStatus(orderId: string) {
    try {
      const resp = await fetch(`${backend}/api/query-order?orderId=${orderId}`)
      const data = await resp.json()
      if (data.status === 'paid') {
        const scoreParam = new URLSearchParams(window.location.search).get('score')
        if (scoreParam) {
          setIsPaid(true)
          setScore(scoreParam)
          const s = parseInt(scoreParam)
          setRankEstimate(estimateRank(s))
          setMatchedSchools(calculateMatches(estimateRank(s)))
          window.history.replaceState({}, '', '/zhongkao')
        }
      }
    } catch {}
  }

  // 根据分数估算位次（模拟公式）
  const estimateRank = (s: number): number => {
    if (s >= 690) return Math.floor((700 - s) * 10) + 50
    if (s >= 650) return Math.floor((700 - s) * 30) + 200
    if (s >= 600) return Math.floor((700 - s) * 60) + 500
    if (s >= 550) return Math.floor((700 - s) * 100) + 1500
    return Math.floor((700 - s) * 150) + 3000
  }

  // 核心算法：冲稳保
  const calculateMatches = (userRank: number): MatchedSchools => {
    const schools = schoolsData as School[]
    const result: MatchedSchools = { chong: [], wen: [], bao: [] }

    schools.forEach(school => {
      const lineRank = school.avg_pickup_rank
      const diff = userRank - lineRank

      if (diff > 500) {
        result.chong.push(school)
      } else if (diff >= -200 && diff <= 500) {
        result.wen.push(school)
      } else {
        result.bao.push(school)
      }
    })

    const sortByRank = (a: School, b: School) => a.avg_pickup_rank - b.avg_pickup_rank
    result.chong.sort(sortByRank)
    result.wen.sort(sortByRank)
    result.bao.sort(sortByRank)

    return result
  }

  // 点击"开始智能匹配学校" - 创建订单 + 显示二维码
  const handleSubmit = async () => {
    const s = parseInt(score)
    if (!s || s < 400 || s > 700) {
      alert('请输入有效的中考分数（400-700分）')
      return
    }

    setIsCreatingOrder(true)
    setOrderError('')
    setQrCode('')

    try {
      // 1. 创建订单
      const resp = await fetch(`${backend}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: s }),
      })
      const data = await resp.json()

      if (!data.success) {
        setOrderError(data.error || '创建订单失败')
        setIsCreatingOrder(false)
        return
      }

      setCurrentOrderId(data.orderId)
      setQrCode(data.qrCode || '')
      setShowQR(true)

      // 2. 连接 SSE，监听支付状态
      listenOrder(data.orderId, s)
    } catch (e: any) {
      setOrderError('网络错误，请重试: ' + e.message)
      setIsCreatingOrder(false)
    }
  }

  // SSE 监听订单状态
  function listenOrder(orderId: string, scoreValue: number) {
    const eventSource = new EventSource(`${backend}/api/listen-order?orderId=${orderId}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'paid') {
        eventSource.close()
        setShowQR(false)
        setIsCreatingOrder(false)
        setIsPaid(true)
        setScore(scoreValue.toString())

        const rank = estimateRank(scoreValue)
        setRankEstimate(rank)
        setMatchedSchools(calculateMatches(rank))
      }

      if (data.type === 'timeout') {
        eventSource.close()
        setOrderError('支付超时，请重新发起')
        setIsCreatingOrder(false)
      }

      if (data.type === 'error') {
        eventSource.close()
        setOrderError(data.message || '订单异常')
        setIsCreatingOrder(false)
      }
    }

    eventSource.onerror = () => {
      // SSE 断开时尝试 HTTP 轮询兜底
      eventSource.close()
      pollOrderStatus(orderId, scoreValue)
    }
  }

  // HTTP 轮询兜底（SSE 不可用时）
  async function pollOrderStatus(orderId: string, scoreValue: number, attempts = 0) {
    if (attempts > 30) {
      setOrderError('支付查询超时，请稍后刷新重试')
      return
    }
    try {
      const resp = await fetch(`${backend}/api/query-order?orderId=${orderId}`)
      const data = await resp.json()
      if (data.status === 'paid') {
        setShowQR(false)
        setIsPaid(true)
        setScore(scoreValue.toString())
        const rank = estimateRank(scoreValue)
        setRankEstimate(rank)
        setMatchedSchools(calculateMatches(rank))
        return
      }
    } catch {}
    await new Promise(r => setTimeout(r, 2000))
    pollOrderStatus(orderId, scoreValue, attempts + 1)
  }

  // 查看学校深度AI报告
  const handleViewReport = (school: School) => {
    setSelectedSchool(school)
    setIsGenerating(true)
    setShowReport(true)

    setTimeout(() => {
      const report = `【${school.name}】综合分析报告

🏫 学校概况
所属区县：${school.district}
历史录取基准位次：约第 ${school.avg_pickup_rank} 名
定向生名额：${school.quota_3years}

👨‍🏫 师资力量
${school.teachers_highlight}

👍 家长正面评价
${school.positive_reviews}

⚠️ 注意事项
${school.negative_reviews}

🍔 餐饮住宿
${school.catering_detail}

---
本报告由 AI 辅助生成，仅供参考。具体录取情况请以官方发布为准。`

      setAiReport(report)
      setIsGenerating(false)
    }, 1000)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pt-24 pb-12 sm:pt-12'>
      <div className='mx-auto max-w-3xl'>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 text-center'
        >
          <h1 className='mb-2 text-3xl font-bold text-slate-800'>
            西安城六区中考AI志愿助手
          </h1>
          <p className='text-slate-500'>
            基于位次智能匹配，冲稳保三重策略
          </p>
        </motion.div>

        {/* 输入卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='rounded-2xl bg-white p-6 shadow-lg'
        >
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              预估/真实中考分数
            </label>
            <input
              type='number'
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder='请输入分数（如 635）'
              min='400'
              max='700'
              className='w-full rounded-lg border border-slate-200 px-4 py-3 text-lg transition focus:border-slate-400 focus:outline-none'
            />
          </div>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              家住地址（用于参考）
            </label>
            <input
              type='text'
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder='例如：雁塔区曲江大唐不夜城'
              className='w-full rounded-lg border border-slate-200 px-4 py-3 transition focus:border-slate-400 focus:outline-none'
            />
          </div>

          {!isPaid ? (
            <button
              onClick={handleSubmit}
              disabled={isCreatingOrder}
              className='w-full rounded-lg bg-teal-500 py-4 text-lg font-medium text-white transition hover:bg-teal-600 disabled:opacity-60'
            >
              {isCreatingOrder ? '正在创建订单...' : `开始智能匹配学校（需支付 ${PAYMENT_CONFIG.price} 元）`}
            </button>
          ) : (
            <div className='rounded-lg bg-green-50 py-4 text-center text-green-600'>
              ✅ 已支付成功，正在显示匹配结果...
            </div>
          )}

          {orderError && (
            <p className='mt-3 text-center text-sm text-red-500'>{orderError}</p>
          )}
        </motion.div>

        {/* 结果展示 */}
        <AnimatePresence>
          {matchedSchools && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='mt-8'
            >
              {/* 位次估算 */}
              <div className='mb-6 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-center text-white'>
                <p className='text-2xl font-bold'>
                  您今年的全统位次大约在第 <span className='text-3xl'>{rankEstimate}</span> 名左右
                </p>
              </div>

              {/* 冲 */}
              {matchedSchools.chong.length > 0 && (
                <div className='mb-6'>
                  <div className='mb-3 flex items-center gap-2 border-l-4 border-orange-400 pl-3'>
                    <h2 className='text-lg font-bold text-orange-600'>🏃 冲一冲</h2>
                    <span className='text-sm text-slate-500'>录退风险适中，可尝试冲刺</span>
                  </div>
                  <div className='space-y-3'>
                    {matchedSchools.chong.map(school => (
                      <SchoolCard key={school.id} school={school} onViewReport={handleViewReport} />
                    ))}
                  </div>
                </div>
              )}

              {/* 稳 */}
              {matchedSchools.wen.length > 0 && (
                <div className='mb-6'>
                  <div className='mb-3 flex items-center gap-2 border-l-4 border-green-500 pl-3'>
                    <h2 className='text-lg font-bold text-green-600'>✅ 稳一稳</h2>
                    <span className='text-sm text-slate-500'>录取概率较高，建议优先考虑</span>
                  </div>
                  <div className='space-y-3'>
                    {matchedSchools.wen.map(school => (
                      <SchoolCard key={school.id} school={school} onViewReport={handleViewReport} />
                    ))}
                  </div>
                </div>
              )}

              {/* 保 */}
              {matchedSchools.bao.length > 0 && (
                <div className='mb-6'>
                  <div className='mb-3 flex items-center gap-2 border-l-4 border-blue-500 pl-3'>
                    <h2 className='text-lg font-bold text-blue-600'>🛡 保一保</h2>
                    <span className='text-sm text-slate-500'>稳妥选择，建议作为保底</span>
                  </div>
                  <div className='space-y-3'>
                    {matchedSchools.bao.map(school => (
                      <SchoolCard key={school.id} school={school} onViewReport={handleViewReport} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部提示 */}
        <p className='mt-8 text-center text-xs text-slate-400'>
          本系统仅供参考，实际录取情况请以官方发布为准
        </p>
      </div>

      {/* 支付二维码弹窗 */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='w-full max-w-sm rounded-2xl bg-white p-6 text-center'
            >
              <h3 className='mb-2 text-lg font-bold text-slate-800'>📱 支付宝扫码支付</h3>
              <p className='mb-4 text-sm text-slate-500'>支付 {PAYMENT_CONFIG.price} 元后自动显示结果</p>

              {/* 二维码 */}
              <div className='mx-auto mb-4 flex items-center justify-center rounded-xl bg-white p-4'>
                {qrCode ? (
                  <img
                    src={qrCode.startsWith('http') ? qrCode : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt='支付二维码'
                    className='h-52 w-52'
                  />
                ) : (
                  <div className='h-52 w-52 animate-pulse rounded-xl bg-slate-100' />
                )}
              </div>

              <p className='text-xs text-slate-400'>
                支付成功后页面将自动跳转<br />请勿关闭此页面
              </p>

              <button
                onClick={() => {
                  setShowQR(false)
                  setOrderError('您取消了支付，如需继续请重新发起')
                  setIsCreatingOrder(false)
                }}
                className='mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-500 transition hover:bg-slate-50'
              >
                取消支付
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI报告弹窗 */}
      <AnimatePresence>
        {showReport && selectedSchool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6'
            >
              <h3 className='mb-4 text-xl font-bold text-slate-800'>
                📊 {selectedSchool.name} - AI 深度报告
              </h3>

              {isGenerating ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800' />
                  <span className='ml-3 text-slate-500'>AI 正在生成报告...</span>
                </div>
              ) : (
                <pre className='whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700'>
                  {aiReport}
                </pre>
              )}

              <button
                onClick={() => {
                  setShowReport(false)
                  setSelectedSchool(null)
                }}
                className='mt-4 w-full rounded-lg border border-slate-200 py-3 text-slate-600 transition hover:bg-slate-50'
              >
                关闭报告
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 学校卡片组件
function SchoolCard({ school, onViewReport }: { school: School; onViewReport: (s: School) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className='flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition'
    >
      <div>
        <h3 className='font-bold text-slate-800'>{school.name}</h3>
        <p className='text-sm text-slate-500'>{school.district}</p>
        <p className='mt-1 text-xs text-slate-400'>
          往年录取基准位次：约第 {school.avg_pickup_rank} 名
        </p>
      </div>
      <button
        onClick={() => onViewReport(school)}
        className='rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-600'
      >
        深度AI评测
      </button>
    </motion.div>
  )
}
