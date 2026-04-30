'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

type SizeState = {
	init: boolean
	maxXL: boolean
	maxLG: boolean
	maxMD: boolean
	maxSM: boolean
	maxXS: boolean
	recalc: () => void
}

const initState = {
	init: false,
	maxXL: false,
	maxLG: false,
	maxMD: false,
	maxSM: false,
	maxXS: false
}

const computeSize = (): Omit<SizeState, 'recalc'> => {
	if (typeof window !== 'undefined') {
		const width = window.innerWidth
		// 检测横屏模式，强制保持竖屏断点（仅对手机尺寸生效）
		const isLandscape = window.matchMedia('(orientation: landscape)').matches
		// 只有当屏幕宽度本身就小于768px（手机范围）时才启用横屏限制
		const isMobileWidth = width < 768
		const effectiveWidth = isLandscape && isMobileWidth ? Math.min(width, 430) : width

		return {
			init: true,
			maxXL: effectiveWidth < 1280,
			maxLG: effectiveWidth < 1024,
			maxMD: effectiveWidth < 768,
			maxSM: effectiveWidth < 640,
			maxXS: effectiveWidth < 360
		}
	}

	return initState
}

export const useSizeStore = create<SizeState>(set => ({
	...initState,
	recalc: () => {
		set(computeSize())
	}
}))

export function useSizeInit() {
	useEffect(() => {
		const update = () => useSizeStore.getState().recalc()
		update()

		// 监听 resize 和屏幕方向变化
		window.addEventListener('resize', update)
		window.matchMedia('(orientation: landscape)').addEventListener('change', update)

		return () => {
			window.removeEventListener('resize', update)
			window.matchMedia('(orientation: landscape)').removeEventListener('change', update)
		}
	}, [])
}

export const useSize = useSizeStore
