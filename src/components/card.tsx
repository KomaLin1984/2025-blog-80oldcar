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

	// 手机端或强制静态定位时，不使用绝对定位
	const isStatic = staticPosition || (maxSM && init)

	if (show)
		return (
			<motion.div
				className={cn('card squircle', className, isStatic && 'relative')}
				animate={
					isStatic
						? undefined
						: { opacity: 1, scale: 1, left: x, top: y, width, height: height }
				}
				initial={
					isStatic
						? { opacity: 0 }
						: { opacity: 0, scale: 0.6, left: x, top: y, width, height: height }
				}
				transition={{ type: 'spring', stiffness: 400, damping: 30 }}
				whileHover={isStatic ? undefined : { scale: 1.05 }}
				whileTap={isStatic ? undefined : { scale: 0.95 }}>
				{children}
			</motion.div>
		)

	return null
}
