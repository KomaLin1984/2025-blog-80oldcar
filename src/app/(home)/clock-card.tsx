'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

// 辉光管颜色
const GLOW_COLOR = '#ff8c00'
const GLOW_SHADOW = '0 0 7px #ff8c00, 0 0 15px #ff6600, 0 0 30px #ff4500, 0 0 50px rgba(255,69,0,0.5), 0 0 80px rgba(255,69,0,0.3)'
const COLON_GLOW = '0 0 6px #ff8c00, 0 0 15px #ff6600, 0 0 30px rgba(255,100,0,0.4)'

// 单个辉光数字
function NixieDigit({ value }: { value: number }) {
	return (
		<span
			className='relative z-10 font-mono font-bold'
			style={{
				color: GLOW_COLOR,
				textShadow: GLOW_SHADOW,
				lineHeight: 1,
				fontSize: '52px'
			}}>
			{value}
		</span>
	)
}

// Ghost数字叠层
function GhostDigits() {
	return (
		<div className='absolute inset-0 flex items-center justify-center'>
			{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
				<span
					key={n}
					className='absolute font-mono font-bold'
					style={{
						color: 'rgba(255,140,0,0.04)',
						lineHeight: 1,
						fontSize: '52px'
					}}>
					{n}
				</span>
			))}
		</div>
	)
}

// 辉光管单元（与原HTML保持相同比例）
function NixieTube({ children }: { children: React.ReactNode }) {
	return (
		<div
			className='relative flex items-center justify-center overflow-hidden'
			style={{
				width: '70px',
				height: '110px',
				background: 'linear-gradient(180deg, rgba(20,15,10,0.95) 0%, rgba(10,8,5,0.98) 100%)',
				borderRadius: '16px',
				border: '1.5px solid rgba(255,140,0,0.3)',
				boxShadow: 'inset 0 0 30px rgba(255,100,0,0.15), inset 0 0 60px rgba(255,80,0,0.08), 0 0 15px rgba(255,140,0,0.2), 0 0 40px rgba(255,100,0,0.1), 0 4px 15px rgba(0,0,0,0.5)'
			}}>
			{/* 蜂窝网格 */}
			<div
				className='absolute inset-0 opacity-60'
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ff8c00' fill-opacity='0.08'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
				}}
			/>

			{/* 玻璃反射 */}
			<div
				className='pointer-events-none absolute inset-0 z-[5]'
				style={{
					background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
					borderRadius: '16px 16px 0 0'
				}}
			/>

			{/* 四角引脚 */}
			<div className='absolute left-[6px] top-[6px] z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />
			<div className='absolute right-[6px] top-[6px] z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />
			<div className='absolute bottom-[6px] left-[6px] z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />
			<div className='absolute bottom-[6px] right-[6px] z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />

			{children}
		</div>
	)
}

// 脉冲冒号
function NixieColon() {
	return (
		<div className='flex flex-col items-center justify-center' style={{ padding: '0 4px', gap: '12px' }}>
			<div
				className='animate-[dotPulse_1s_ease-in-out_infinite]'
				style={{
					width: '8px',
					height: '8px',
					borderRadius: '50%',
					background: GLOW_COLOR,
					boxShadow: COLON_GLOW
				}}
			/>
			<div
				className='animate-[dotPulse_1s_ease-in-out_infinite]'
				style={{
					width: '8px',
					height: '8px',
					borderRadius: '50%',
					background: GLOW_COLOR,
					boxShadow: COLON_GLOW
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
					{/* 背景横线装饰 */}
					<div
						className='pointer-events-none absolute inset-0'
						style={{
							background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,140,0,0.01) 2px, rgba(255,140,0,0.01) 4px)'
						}}
					/>

					{/* 辉光管时间显示 - 原尺寸不缩放 */}
					<div className='relative z-10 flex items-center animate-[subtleGlow_3s_ease-in-out_infinite]'>
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

					{/* 底座装饰线 */}
					<div
						className='absolute bottom-0 left-1/2 h-px -translate-x-1/2'
						style={{
							width: '600px',
							maxWidth: '90%',
							background: 'linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.2) 30%, rgba(255,140,0,0.3) 50%, rgba(255,140,0,0.2) 70%, transparent 100%)'
						}}
					/>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}