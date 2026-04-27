'use client'

import { ANIMATION_DELAY } from '@/consts'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useSize } from '@/hooks/use-size'
import { useCenterStore } from '@/hooks/use-center'

interface Props {
	className?: string
	order: number
	width: number
	height?: number
	x: number
	y: number
	children: React.ReactNode
}

export default function Card({ children, order, width, height, x, y, className }: Props) {
	const { maxSM, init } = useSize()
	const { scale } = useCenterStore()
	let [show, setShow] = useState(false)
	if (maxSM && init) order = 0

	// 响应式缩放：应用 scale 因子到位置和尺寸
	const scaledX = x * scale
	const scaledY = y * scale
	const scaledWidth = width * scale
	const scaledHeight = height ? height * scale : undefined

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

	if (show)
		return (
			<motion.div
				className={cn('card squircle', className)}
				initial={{ opacity: 0, scale: 0.6, left: scaledX, top: scaledY, width: scaledWidth, height: scaledHeight }}
				animate={{ opacity: 1, scale: 1, left: scaledX, top: scaledY, width: scaledWidth, height: scaledHeight }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}>
				{children}
			</motion.div>
		)

	return null
}
