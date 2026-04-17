'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

// Nixie tube digit component
function NixieDigit({ value, className = '' }: { value: number; className?: string }) {
	const activeColor = '#ff6b35'
	const glowColor = '#ff6b35'
	const inactiveColor = 'rgba(40, 40, 50, 0.6)'

	const segments: { path: string; active: boolean }[] = [
		// Top horizontal (a)
		{
			path: 'M4.5 2.5 L24.5 2.5 L23 4.5 L6 4.5 Z',
			active: [0, 2, 3, 5, 6, 7, 8, 9].includes(value)
		},
		// Top-right vertical (b)
		{
			path: 'M25 3.5 L25 23 L22.5 21 L22.5 5.5 Z',
			active: [0, 1, 2, 3, 4, 7, 8, 9].includes(value)
		},
		// Middle-right vertical (c)
		{
			path: 'M22.5 26 L22.5 44 L20 42 L20 28 Z',
			active: [0, 2, 6, 8].includes(value)
		},
		// Bottom horizontal (d)
		{
			path: 'M4.5 50 L24.5 50 L23 48 L6 48 Z',
			active: [2, 3, 5, 6, 8, 9].includes(value)
		},
		// Bottom-left vertical (e)
		{
			path: 'M4.5 28 L4.5 44 L7 42 L7 30 Z',
			active: [0, 2, 6, 8].includes(value)
		},
		// Middle-left vertical (f)
		{
			path: 'M7 5.5 L7 21 L9.5 23 L9.5 3.5 Z',
			active: [0, 4, 5, 6, 7, 8, 9].includes(value)
		},
		// Middle horizontal (g)
		{
			path: 'M6 26 L23 26 L22 28 L7 28 Z',
			active: [2, 3, 4, 5, 6, 8, 9].includes(value)
		}
	]

	return (
		<div className={`relative ${className}`}>
			<svg
				width='30'
				height='54'
				viewBox='0 0 30 54'
				className='relative z-10 drop-shadow-[0_0_8px_rgba(255,107,53,0.8)]'>
				<defs>
					<filter id={`glow-${value}`} x='-50%' y='-50%' width='200%' height='200%'>
						<feGaussianBlur stdDeviation='2' result='coloredBlur' />
						<feMerge>
							<feMergeNode in='coloredBlur' />
							<feMergeNode in='SourceGraphic' />
						</feMerge>
					</filter>
				</defs>
				{segments.map((seg, i) => (
					<path
						key={i}
						d={seg.path}
						fill={seg.active ? glowColor : inactiveColor}
						filter={seg.active ? `url(#glow-${value})` : undefined}
					/>
				))}
			</svg>
			{/* 数字本身 */}
			<span
				className='absolute inset-0 flex items-center justify-center font-mono text-4xl font-bold tracking-wider'
				style={{
					color: activeColor,
					textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px rgba(255,107,53,0.5)`
				}}>
				{value}
			</span>
		</div>
	)
}

// 冒号分隔符 - 辉光管风格
function NixieColon() {
	return (
		<div className='flex flex-col justify-center gap-3 px-1'>
			<div
				className='h-2 w-2 rounded-full'
				style={{
					background: '#ff6b35',
					boxShadow: '0 0 8px #ff6b35, 0 0 15px rgba(255,107,53,0.6)'
				}}
			/>
			<div
				className='h-2 w-2 rounded-full'
				style={{
					background: '#ff6b35',
					boxShadow: '0 0 8px #ff6b35, 0 0 15px rgba(255,107,53,0.6)'
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
						background: 'linear-gradient(180deg, #0a0a12 0%, #12121f 50%, #0a0a12 100%)'
					}}>
					{/* 背景网格纹理 */}
					<div
						className='absolute inset-0 opacity-20'
						style={{
							backgroundImage: `
								linear-gradient(rgba(255,107,53,0.1) 1px, transparent 1px),
								linear-gradient(90deg, rgba(255,107,53,0.1) 1px, transparent 1px)
							`,
							backgroundSize: '20px 20px'
						}}
					/>

					{/* 辉光光晕效果 */}
					<div className='absolute inset-0 flex items-center justify-center'>
						<div
							className='h-40 w-40 rounded-full'
							style={{
								background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)'
							}}
						/>
					</div>

					{/* 玻璃质感覆盖层 */}
					<div
						className='absolute inset-0'
						style={{
							background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)'
						}}
					/>

					{/* 时间显示 */}
					<div className='relative z-10 flex items-center'>
						{/* 时 */}
						<NixieDigit value={parseInt(hours[0])} />
						<NixieDigit value={parseInt(hours[1])} />

						<NixieColon />

						{/* 分 */}
						<NixieDigit value={parseInt(minutes[0])} />
						<NixieDigit value={parseInt(minutes[1])} />

						{showSeconds && (
							<>
								<NixieColon />
								{/* 秒 */}
								<NixieDigit value={parseInt(seconds[0])} />
								<NixieDigit value={parseInt(seconds[1])} />
							</>
						)}
					</div>

					{/* 底部装饰线 */}
					<div
						className='absolute bottom-0 left-0 right-0 h-1'
						style={{
							background: 'linear-gradient(90deg, transparent 0%, #ff6b35 50%, transparent 100%)',
							boxShadow: '0 0 20px rgba(255,107,53,0.5)'
						}}
					/>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}