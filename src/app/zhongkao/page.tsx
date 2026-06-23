'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const PAYMENT_CONFIG = {
  price: 2, 
  backendUrl: 'https://pay.80oldcar.com'
}

interface School {
  id: number; name: string; district: string; avg_pickup_rank: number;
  quota_3years: string; teachers_highlight: string; positive_reviews: string;
  negative_reviews: string; catering_detail: string; image_url: string;
}

interface MatchedSchools { "冲": School[]; "稳": School[]; "保": School[]; }

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

  const [showQR, setShowQR] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string>('')
  const [paymentStatusText, setPaymentStatusText] = useState<string>('正在安全连接支付宝网关...')

  const backend = PAYMENT_CONFIG.backendUrl

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('result')
    const scoreParam = params.get('score')
    const orderIdParam = params.get('order_id')
    if (result === 'paid' && scoreParam && orderIdParam) {
      handlePaymentSuccess(orderIdParam, parseInt(scoreParam))
      window.history.replaceState({}, '', '/zhongkao')
    }
  }, [])

  const handleSubmit = async () => {
    const s = parseInt(score)
    if (!s || s < 400 || s > 700) { alert('请输入有效的中考预估分数'); return }

    setIsCreatingOrder(true)
    setOrderError('')
    setQrCodeData('')
    setPaymentStatusText('正在生成安全支付链接...')

    try {
      const resp = await fetch(`${backend}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: s, address })
      })
      const data = await resp.json()

      if (data.status !== 'success') {
        setOrderError(data.message || '生成订单失败')
        setIsCreatingOrder(false)
        return
      }
      
      // 兼容不同版本后端返回的链接字段，防止获取不到导致跳转至空白页
      const finalPayUrl = data.wapPayUrl || data.payUrl || data.url;

      if (!finalPayUrl) {
        setOrderError('未获取到有效的支付链接，请检查后端配置')
        setIsCreatingOrder(false)
        return
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        setPaymentStatusText('正在为您拉起支付宝 App...')
        window.location.href = finalPayUrl
      } else {
        setQrCodeData(finalPayUrl)
        setShowQR(true)
        setIsCreatingOrder(false)
        setPaymentStatusText('请使用手机支付宝【扫一扫】付款')
        listenAndCheckOrder(data.orderId, s)
      }
    } catch (e: any) {
      setOrderError('连接支付网关失败，请重试')
      setIsCreatingOrder(false)
    }
  }

  function listenAndCheckOrder(orderId: string, scoreValue: number) {
    const eventSource = new EventSource(`${backend}/api/listen-order?orderId=${orderId}`)
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'paid') {
        eventSource.close()
        handlePaymentSuccess(orderId, scoreValue)
      }
    }
    eventSource.onerror = () => { eventSource.close() }
  }

  async function handlePaymentSuccess(orderId: string, scoreValue: number) {
    setShowQR(false)
    setIsPaid(true)
    try {
      const resp = await fetch(`${backend}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: scoreValue, orderId: orderId })
      })
      const data = await resp.json()
      if (data.status === 'success') {
        setRankEstimate(data.rank_estimate)
        setMatchedSchools(data.schools)
        setTimeout(() => { document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }) }, 300)
      }
    } catch (err: any) { alert("获取数据失败") }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-900 via-slate-900 to-black px-4 pt-28 pb-16 text-white'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='text-center text-4xl font-extrabold mb-10'>西安中考 AI 志愿助手</h1>
        <div className='rounded-3xl bg-slate-800/80 p-8 shadow-2xl border border-slate-700/50 backdrop-blur-md'>
          <label className='block mb-2 text-sm font-semibold text-slate-300'>输入预估分数：</label>
          <input type='number' value={score} onChange={e => setScore(e.target.value)} placeholder='400-700'
            className='w-full rounded-xl bg-slate-900/80 border border-slate-700 px-4 py-4 text-xl font-bold mb-5' />
          {!isPaid ? (
            <button onClick={handleSubmit} disabled={isCreatingOrder} className='w-full rounded-xl bg-blue-600 py-4 font-bold'>
              {isCreatingOrder ? '处理中...' : '🚀 支付宝支付 2 元解锁'}
            </button>
          ) : <div className='text-center text-green-400 font-bold'>✓ 志愿解锁成功</div>}
          
          {orderError && <p className='mt-4 text-center text-sm text-red-400'>{orderError}</p>}
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className='bg-slate-800 p-8 rounded-3xl text-center border border-slate-700'>
              <h3 className='text-lg font-bold mb-4'>扫码安全付款</h3>
              {qrCodeData && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeData)}`} className='mx-auto mb-4 bg-white p-2 rounded-xl' alt='二维码加载中...' />}
              <p className='text-sm text-slate-400'>{paymentStatusText}</p>
              <button onClick={() => setShowQR(false)} className='mt-4 w-full py-2 bg-slate-700 rounded-lg'>取消</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}