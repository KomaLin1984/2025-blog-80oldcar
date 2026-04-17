'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

// 辉光管颜色
const GLOW_COLOR = '#ff8c00'

// 单个辉光数字 - 紧凑版适配卡片
function NixieDigit({ value }: { value: number }) {
	return (
		<span
			className='relative z-10 font-mono text-2xl font-bold'
			style={{
				color: GLOW_COLOR,
				textShadow: '0 0 5px #ff8c00, 0 0 10px #ff6600, 0 0 20px #ff4500',
				lineHeight: 1
			}}>
			{value}
		</span>
	)
}

// Ghost数字
function GhostDigits() {
	return (
		<div className='absolute inset-0 flex items-center justify-center'>
			{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
				<span
					key={n}
					className='absolute font-mono text-2xl font-bold'
					style={{
						color: 'rgba(255,140,0,0.04)',
						lineHeight: 1
					}}>
					{n}
				</span>
			))}
		</div>
	)
}

// 辉光管单元 - 紧凑版
function NixieTube({ children }: { children: React.ReactNode }) {
	return (
		<div
			className='relative flex h-[70px] w-[46px] items-center justify-center overflow-hidden rounded-xl'
			style={{
				background: 'linear-gradient(180deg, rgba(20,15,10,0.95) 0%, rgba(10,8,5,0.98) 100%)',
				border: '1.5px solid rgba(255,140,0,0.3)',
				boxShadow: 'inset 0 0 20px rgba(255,100,0,0.15), 0 0 10px rgba(255,140,0,0.1), 0 4px 10px rgba(0,0,0,0.5)'
			}}>
			{/* 玻璃反射 */}
			<div
				className='pointer-events-none absolute inset-0 z-[5]'
				style={{
					background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)'
				}}
			/>
			{children}
		</div>
	)
}

// 冒号分隔符
function NixieColon() {
	return (
		<div className='flex flex-col items-center justify-center gap-2 px-0.5'>
			<div
				className='h-1.5 w-1.5 rounded-full'
				style={{
					background: GLOW_COLOR,
					boxShadow: '0 0 4px #ff8c00, 0 0 8px #ff6600'
				}}
			/>
			<div
				className='h-1.5 w-1.5 rounded-full'
				style={{
					background: GLOW_COLOR,
					boxShadow: '0 0 4px #ff8c00, 0 0 8px #ff6600'
				}}
			/>
		</div>
	)
}

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

	// 24小时制
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
					className='card-rounded relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden'
					style={{
						background: 'radial-gradient(ellipse at center, #2a2018 0%, #0d0d0d 70%)'
					}}>
					{/* 时间显示 - 紧凑排列 */}
					<div className='relative z-10 flex items-center'>
						{/* 时 */}
						<NixieTube>
							<GhostDigits />
							<NixieDigit value={parseInt(hours[0])} />
						</NixieTube>
						<NixieTube>
							<GhostDigits />
							<NixieDigit value={parseInt(hours[1])} />
						</NixieTube>

						<NixieColon />

						{/* 分 */}
						<NixieTube>
							<GhostDigits />
							<NixieDigit value={parseInt(minutes[0])} />
						</NixieTube>
						<NixieTube>
							<GhostDigits />
							<NixieDigit value={parseInt(minutes[1])} />
						</NixieTube>

						{showSeconds && (
							<>
								<NixieColon />
								{/* 秒 */}
								<NixieTube>
									<GhostDigits />
									<NixieDigit value={parseInt(seconds[0])} />
								</NixieTube>
								<NixieTube>
									<GhostDigits />
									<NixieDigit value={parseInt(seconds[1])} />
								</NixieTube>
							</>
						)}
					</div>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}