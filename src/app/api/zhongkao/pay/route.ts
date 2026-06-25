import { NextResponse } from 'next/server'
import { createSign } from 'crypto'
import { cookies } from 'next/headers'

const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID || '2021006161662827'
const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY || ''
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY || ''

// 支付宝签名 (RSA2)
function alipaySign(params: Record<string, string>, privateKey: string): string {
  const signStr = Object.keys(params).sort().map(k => `${k}="${params[k]}"`).join('&')
  const sign = createSign('RSA-SHA256')
  sign.update(signStr)
  return sign.sign(privateKey, 'base64')
}

// 生成唯一订单号
function generateOrderId(): string {
  return `ZK${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const score = url.searchParams.get('score') || '0'

  // 如果没有配置私钥，返回模拟链接（开发测试用）
  if (!ALIPAY_PRIVATE_KEY) {
    const mockOrderId = generateOrderId()
    // 模拟支付成功，跳转回前端
    const returnUrl = `${url.origin}/zhongkao?paid=1&order_id=${mockOrderId}&score=${score}`
    return NextResponse.redirect(returnUrl)
  }

  const orderId = generateOrderId()
  
  // 存储订单信息到 Cookie（临时方案）
  const cookieStore = await cookies()
  cookieStore.set('zhongkao_order', JSON.stringify({
    orderId,
    score,
    status: 'pending',
    createdAt: Date.now()
  }), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 30 // 30分钟有效期
  })

  // 支付宝支付参数
  const bizContent = {
    out_trade_no: orderId,
    product_code: 'FAST_INSTANT_TRADE_PAY',
    total_amount: '2', // 2元
    subject: '西安中考AI志愿助手-智能匹配服务',
    body: `中考分数：${score}分`,
  }

  const params: Record<string, string> = {
    app_id: ALIPAY_APP_ID,
    method: 'alipay.trade.wap.pay',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    version: '1.0',
    biz_content: JSON.stringify(bizContent),
    return_url: `${url.origin}/zhongkao?result=paid&order_id=${orderId}&score=${score}`,
    notify_url: `${url.origin}/api/zhongkao/notify`, // 异步通知（可选）
  }

  params.sign = alipaySign(params, ALIPAY_PRIVATE_KEY)

  // 构建支付宝支付 URL
  const alipayUrl = 'https://openapi.alipay.com/gateway.do?' + new URLSearchParams(params).toString()

  return NextResponse.redirect(alipayUrl)
}
