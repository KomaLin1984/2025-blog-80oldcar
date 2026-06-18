'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import schoolsData from '@/data/zhongkao-schools.json'

// ============ 配置区（小林在这里修改）============
const PAYMENT_CONFIG = {
  price: 5, // 定价（元）
  // Worker 后端地址（部署后填这里）
  workerUrl: 'https://zhongkao-payment.your-subdomain.workers.dev', // TODO: 部署 Worker 后填这里
}
const USE_SIMULATION = true // true=模拟模式（无真实商户号），false=真实支付
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
  const [showPayment, setShowPayment] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [aiReport, setAiReport] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // 支付相关状态
  const [currentOrderId, setCurrentOrderId] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'paid'>('idle')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')

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
        // 冲：考生位次比学校录取位次靠后较多，但还在合理范围
        result.chong.push(school)
      } else if (diff >= -200 && diff <= 500) {
        // 稳：考生位次接近学校录取位次
        result.wen.push(school)
      } else {
        // 保：考生位次比学校录取位次靠前较多
        result.bao.push(school)
      }
    })

    // 按位次排序
    const sortByRank = (a: School, b: School) => a.avg_pickup_rank - b.avg_pickup_rank
    result.chong.sort(sortByRank)
    result.wen.sort(sortByRank)
    result.bao.sort(sortByRank)

    return result
  }

  const handleSubmit = () => {
    const s = parseInt(score)
    if (!s || s < 400 || s > 700) {
      alert('请输入有效的中考分数（400-700分）')
      return
    }

    const rank = estimateRank(s)
    setRankEstimate(rank)
    setMatchedSchools(calculateMatches(rank))
  }

  const handleViewReport = (school: School) => {
    setSelectedSchool(school)
    setShowPayment(true)
  }

  // 创建订单并获取支付二维码
  const handleViewReport = async (school: School) => {
    setSelectedSchool(school)
    setPaymentStatus('idle')
    setQrCodeUrl('')
    setShowPayment(true)
    
    if (USE_SIMULATION) {
      // 模拟模式：直接显示模拟二维码
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mock-payment-${Date.now()}`)
      setPaymentStatus('pending')
      return
    }
    
    try {
      const response = await fetch(`${PAYMENT_CONFIG.workerUrl}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: school.id,
          schoolName: school.name,
          paymentMethod: selectedPaymentMethod
        })
      })
      const data = await response.json()
      
      if (data.codeUrl) {
        setCurrentOrderId(data.orderId)
        setQrCodeUrl(data.codeUrl)
        setPaymentStatus('pending')
        
        // 启动 SSE 监听支付结果
        startPaymentListener(data.orderId)
      } else {
        alert('创建订单失败: ' + (data.error || '未知错误'))
      }
    } catch (e) {
      alert('网络错误，请重试')
    }
  }
  
  // SSE 监听支付结果
  const startPaymentListener = (orderId: string) => {
    const eventSource = new EventSource(`${PAYMENT_CONFIG.workerUrl}/api/listen-order?orderId=${orderId}`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'paid') {
        setPaymentStatus('paid')
        eventSource.close()
        // 延迟一下，让用户看到"支付成功"提示
        setTimeout(() => {
          handleRealPaymentSuccess()
        }, 1500)
      }
    }
    
    eventSource.onerror = () => {
      // SSE 断开时不处理（可能是超时）
    }
  }
  
  // 真实支付成功后处理
  const handleRealPaymentSuccess = () => {
    setShowPayment(false)
    setIsPaid(true)
    setIsGenerating(true)
    
    setTimeout(() => {
      const report = `【${selectedSchool?.name}】综合分析报告

🏫 学校概况
所属区县：${selectedSchool?.district}
历史录取基准位次：约第 ${selectedSchool?.avg_pickup_rank} 名
定向生名额：${selectedSchool?.quota_3years}

👨‍🏫 师资力量
${selectedSchool?.teachers_highlight}

👍 家长正面评价
${selectedSchool?.positive_reviews}

⚠️ 注意事项
${selectedSchool?.negative_reviews}

🍔 餐饮住宿
${selectedSchool?.catering_detail}

---
本报告由 AI 辅助生成，仅供参考。具体录取情况请以官方发布为准。`

      setAiReport(report)
      setIsGenerating(false)
      setShowReport(true)
    }, 1500)
  }
  
  // 模拟支付成功（开发测试用）
  const handleSimulatePayment = () => {
    setPaymentStatus('paid')
    setTimeout(() => {
      handleRealPaymentSuccess()
    }, 1000)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12'>
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

          <button
            onClick={handleSubmit}
            className='w-full rounded-lg bg-slate-800 py-4 text-lg font-medium text-white transition hover:bg-slate-700'
          >
            开始智能匹配学校
          </button>
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
                <p className='text-sm opacity-90'>根据计分新政预估</p>
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

      {/* 支付弹窗 */}
      <AnimatePresence>
        {showPayment && selectedSchool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='w-full max-w-sm rounded-2xl bg-white p-6'
              onClick={e => e.stopPropagation()}
            >
              <h3 className='mb-2 text-xl font-bold text-slate-800'>
                🔓 解锁AI深度图文报告
              </h3>
              <p className='mb-4 text-slate-600'>
                支付 <span className='text-xl font-bold text-red-500'>{PAYMENT_CONFIG.price} 元</span> 立即获取【{selectedSchool.name}】师资深度剖析、家长正负面真实评价及食宿详情
              </p>

              {/* 支付方式切换 */}
              {!USE_SIMULATION && (
                <div className='mb-4 flex rounded-lg bg-slate-100 p-1'>
                  <button
                    onClick={() => setSelectedPaymentMethod('wechat')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                      selectedPaymentMethod === 'wechat' ? 'bg-white shadow text-green-600' : 'text-slate-500'
                    }`}
                  >
                    👑 微信支付
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('alipay')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                      selectedPaymentMethod === 'alipay' ? 'bg-white shadow text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    💙 支付宝
                  </button>
                </div>
              )}

              {/* 二维码区域 */}
              <div className='mb-4'>
                {paymentStatus === 'paid' ? (
                  <div className='flex flex-col items-center justify-center py-6'>
                    <div className='mb-3 text-5xl'>✅</div>
                    <p className='text-lg font-medium text-green-600'>支付成功！</p>
                    <p className='text-sm text-slate-500'>正在打开报告...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <div className='flex flex-col items-center'>
                    <div className='mb-3 rounded-xl bg-white p-3 shadow-md'>
                      {/* 扫码提示 */}
                      <p className='mb-2 text-center text-sm text-slate-600'>
                        {selectedPaymentMethod === 'wechat' ? '👑 微信' : '💙 支付宝'} 扫描下方二维码支付 {PAYMENT_CONFIG.price} 元
                      </p>
                      {/* 二维码 */}
                      <img 
                        src={qrCodeUrl} 
                        alt='支付二维码' 
                        className='mx-auto h-48 w-48'
                      />
                    </div>
                    <p className='text-sm text-slate-500'>支付成功后页面将自动更新</p>
                  </div>
                ) : (
                  <div className='flex h-48 items-center justify-center'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800' />
                  </div>
                )}
              </div>

              {/* 模拟模式下的测试按钮 */}
              {USE_SIMULATION && paymentStatus !== 'paid' && (
                <button
                  onClick={handleSimulatePayment}
                  className='mb-4 w-full rounded-lg bg-slate-100 py-3 text-sm text-slate-600 transition hover:bg-slate-200'
                >
                  🎮 模拟支付成功（测试用）
                </button>
              )}

              <button
                onClick={() => setShowPayment(false)}
                className='w-full rounded-lg border border-slate-200 py-3 text-slate-600 transition hover:bg-slate-50'
              >
                取消
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
                  setIsPaid(false)
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