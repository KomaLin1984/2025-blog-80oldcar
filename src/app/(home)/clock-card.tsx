'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function ClockCard() {
	const router = useRouter()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)
	const [time, setTime] = useState(new Date())
	const styles = cardStyles.clockCard
	const hiCardStyles = cardStyles.hiCard
	const showSeconds = siteContent.clockShowSeconds ?? false

	useEffect(() => {
		const interval = showSeconds ? 1000 : 5000
		const timer = setInterval(() => {
			setTime(new Date())
		}, interval)

		return () => clearInterval(timer)
	}, [showSeconds])

	const hours = time.getHours().toString().padStart(2, '0')
	const minutes = time.getMinutes().toString().padStart(2, '0')
	const seconds = time.getSeconds().toString().padStart(2, '0')

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - styles.offset - styles.height

	return (
		<HomeDraggableLayer cardKey='clockCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='p-0'>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-5.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 60, left: 2, bottom: 2, opacity: 0.6 }}
						/>
						<img
							src='/images/christmas/snow-6.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 80, right: -4, top: -10, opacity: 0.6 }}
						/>
					</>
				)}
				<div
					onClick={() => {
						if (!editing) {
							router.push('/clock')
						}
					}}
					className='card-rounded flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1a2e] via-[#0d2233] to-[#0f2942]'>
					{/* 装饰性背景光晕 */}
					<div className='absolute inset-0 opacity-20'>
						<div className='absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#35bfab]' />
					</div>

					{/* 时间显示 */}
					<div className='relative z-10 flex items-center gap-3'>
						{/* 时分 */}
						<div className='flex items-baseline gap-1'>
							<span className='font-mono text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(53,191,171,0.5)]'>
								{hours}
							</span>
							<span className='font-mono text-5xl font-bold text-[#35bfab] drop-shadow-[0_0_15px_rgba(53,191,171,0.8)]'>
								:
							</span>
							<span className='font-mono text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(53,191,171,0.5)]'>
								{minutes}
							</span>
						</div>

						{/* 秒数 */}
						{showSeconds && (
							<div className='flex items-baseline gap-1'>
								<span className='font-mono text-4xl font-bold text-[#35bfab]/80 drop-shadow-[0_0_10px_rgba(53,191,171,0.4)]'>
									:
								</span>
								<span className='font-mono text-4xl font-bold text-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'>
									{seconds}
								</span>
							</div>
						)}
					</div>

					{/* 底部分隔线装饰 */}
					<div className='absolute bottom-3 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#35bfab]/50 to-transparent' />
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}