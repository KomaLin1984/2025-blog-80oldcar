'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

// 基准分辨率（设计时使用的屏幕尺寸）
const REFERENCE_WIDTH = 1920
const REFERENCE_HEIGHT = 1080

type CenterState = {
	x: number
	y: number
	centerX: number
	centerY: number
	width: number
	height: number
	scale: number // 缩放因子，屏幕比基准小时 < 1，大时 > 1
	setCenter: (x: number, y: number) => void
	recalc: () => void
}

const computeCenter = (): Omit<CenterState, 'setCenter' | 'recalc'> => {
	if (typeof window === 'undefined') {
		return { x: 0, y: 0, centerX: 0, centerY: 0, width: 0, height: 0, scale: 1 }
	}
	const width = window.innerWidth
	const height = window.innerHeight

	// 计算缩放因子：以宽度为基准，保持宽高比缩放
	// 限制最大缩放到 1.2，避免在大屏幕上变得太大
	const scale = Math.min(Math.max(width / REFERENCE_WIDTH, 0.5), 1.2)

	// 如果高度也小于基准，需要检查是否会裁剪底部
	const heightScale = height / REFERENCE_HEIGHT
	const effectiveScale = Math.min(scale, heightScale)

	return {
		x: Math.floor(width / 2),
		y: Math.floor(height / 2) - 24,
		centerX: Math.floor(width / 2),
		centerY: Math.floor(height / 2),
		width,
		height,
		scale: effectiveScale
	}
}

export const useCenterStore = create<CenterState>(set => ({
	x: 0,
	y: 0,
	centerX: 0,
	centerY: 0,
	width: 0,
	height: 0,
	scale: 1,
	setCenter: (x, y) => set({ x, y }),
	recalc: () => {
		const c = computeCenter()
		set({ x: c.x, y: c.y, width: c.width, height: c.height, centerX: c.centerX, centerY: c.centerY, scale: c.scale })
	}
}))

export function useCenterInit() {
	useEffect(() => {
		const update = () => useCenterStore.getState().recalc()
		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [])
}
