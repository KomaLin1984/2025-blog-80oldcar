'use client'

import { ANIMATION_DELAY } from '@/consts'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useSize } from '@/hooks/use-size'

interface Props {
	className?: string
	order: number
	width: number
	height?: number
	x: number
	y: number
	children: React.ReactNode
	staticPosition?: boolean // 手机端使用静态定位，不使用绝对定位
}

export default function Card({ children, order, width, height, x, y, className, staticPosition }: Props) {
	const { maxSM, init } = useSize()
	let [show, setShow] = useState(false)
	if (maxSM && init) order = 0

	// 手机端强制静态定位时使用普通 div + CSS 动画，避免 motion 动画问题
	const isStatic = staticPosition && maxSM && init

	useEffect(() => {
		if (show) return
		if (x === 0 && y === 0) return
		setTimeout(
			() => {
				setShow(true)
			},
			order * ANIMATION_DELAY * 1000
		)
	}, [x, y, show])

	// 静态定位时使用普通 div，带淡入动画
	if (isStatic) {
		if (!show) return null
		return (
			<div className={cn('card squircle !absolute', className)} style={{ width, height }}>
				{children}
			</div>
		)
	}

	// 绝对定位时使用 motion 动画
	if (show)
		return (
			<motion.div
				className={cn('card squircle', className)}
				initial={{ opacity: 0, scale: 0.6, left: x, top: y, width, height }}
				animate={{ opacity: 1, scale: 1, left: x, top: y, width, height }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}>
				{children}
			</motion.div>
		)

	return null
}
