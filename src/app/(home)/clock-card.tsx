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
const GLOW_INTENSE = '0 0 7px #ff8c00, 0 0 15px #ff6600, 0 0 30px #ff4500, 0 0 50px rgba(255,69,0,0.5), 0 0 80px rgba(255,69,0,0.3)'
const SEPARATOR_GLOW = '0 0 6px #ff8c00, 0 0 15px #ff6600, 0 0 30px rgba(255,100,0,0.4)'

// 单个辉光数字
function NixieDigit({ value, small = false }: { value: number; small?: boolean }) {
	const fontSize = small ? 'text-4xl' : 'text-6xl'
	const shadow = small
		? '0 0 5px #ff8c00, 0 0 10px #ff6600, 0 0 20px #ff4500'
		: GLOW_INTENSE

	return (
		<span
			className={`relative z-10 font-mono font-bold tracking-wider ${fontSize}`}
			style={{
				color: GLOW_COLOR,
				textShadow: shadow,
				lineHeight: 1
			}}>
			{value}
		</span>
	)
}

// Ghost数字（所有数字叠加作为背景）
function GhostDigits({ small = false }: { small?: boolean }) {
	const fontSize = small ? 'text-4xl' : 'text-6xl'
	return (
		<div className='absolute inset-0 flex items-center justify-center'>
			{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
				<span
					key={n}
					className={`absolute font-mono font-bold ${fontSize}`}
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

// 辉光管单元
function NixieTube({
	children,
	small = false,
	lit = true
}: {
	children: React.ReactNode
	small?: boolean
	lit?: boolean
}) {
	const width = small ? 'w-[52px]' : 'w-[70px]'
	const height = small ? 'h-[80px]' : 'h-[110px]'
	const borderRadius = small ? 'rounded-xl' : 'rounded-2xl'

	return (
		<div
			className={`relative ${width} ${height} ${borderRadius} overflow-hidden ${lit ? 'animate-[subtleGlow_3s_ease-in-out_infinite]' : ''}`}
			style={{
				background: 'linear-gradient(180deg, rgba(20,15,10,0.95) 0%, rgba(10,8,5,0.98) 100%)',
				border: lit ? '1.5px solid rgba(255,140,0,0.3)' : '1.5px solid rgba(100,100,100,0.1)',
				boxShadow: lit
					? 'inset 0 0 30px rgba(255,100,0,0.15), inset 0 0 60px rgba(255,80,0,0.08), 0 0 15px rgba(255,140,0,0.2), 0 0 40px rgba(255,100,0,0.1), 0 4px 15px rgba(0,0,0,0.5)'
					: 'inset 0 0 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)',
				transition: 'all 0.8s ease'
			}}>
			{/* 蜂窝网格背景 */}
			<div
				className='absolute inset-0 opacity-60'
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ff8c00' fill-opacity='0.08'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					transition: 'opacity 0.8s ease'
				}}
			/>

			{/* 玻璃反射效果 */}
			<div
				className='pointer-events-none absolute inset-0 z-[5]'
				style={{
					background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
					borderRadius: small ? '12px 12px 0 0' : '16px 16px 0 0'
				}}
			/>

			{/* 四角引脚装饰 */}
			<div className='absolute left-1.5 top-1.5 z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />
			<div className='absolute right-1.5 top-1.5 z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />
			<div className='absolute bottom-1.5 left-1.5 z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />
			<div className='absolute bottom-1.5 right-1.5 z-[6] h-1 w-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-600' />

			{/* 内容 */}
			{children}
		</div>
	)
}

// 冒号分隔符
function NixieSeparator({ pulse = true }: { pulse?: boolean }) {
	return (
		<div className='flex flex-col items-center justify-center gap-3 px-1'>
			<div
				className={`h-2 w-2 rounded-full ${pulse ? 'animate-[dotPulse_1s_ease-in-out_infinite]' : ''}`}
				style={{
					background: GLOW_COLOR,
					boxShadow: SEPARATOR_GLOW
				}}
			/>
			<div
				className={`h-2 w-2 rounded-full ${pulse ? 'animate-[dotPulse_1s_ease-in-out_infinite]' : ''}`}
				style={{
					background: GLOW_COLOR,
					boxShadow: SEPARATOR_GLOW
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
	const [prevSeconds, setPrevSeconds] = useState(-1)
	const [changingDigits, setChangingDigits] = useState<Set<string>>(new Set())
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

	// 检测数字变化，添加闪烁动画
	useEffect(() => {
		const seconds = time.getSeconds()
		if (prevSeconds !== -1 && seconds !== prevSeconds) {
			setChangingDigits(new Set(['s1', 's2']))
			setTimeout(() => setChangingDigits(new Set()), 150)
		}
		setPrevSeconds(seconds)
	}, [time, prevSeconds])

	// 24小时制
	const hours = time.getHours().toString().padStart(2, '0')
	const minutes = time.getMinutes().toString().padStart(2, '0')
	const seconds = time.getSeconds().toString().padStart(2, '0')

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - styles.offset - styles.height

	const digitChanging = (key: string) => changingDigits.has(key)

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
					{/* 背景装饰线 */}
					<div
						className='pointer-events-none absolute inset-0'
						style={{
							background: `
								repeating-linear-gradient(
									0deg,
									transparent,
									transparent 2px,
									rgba(255,140,0,0.01) 2px,
									rgba(255,140,0,0.01) 4px
								)
							`
						}}
					/>

					{/* 底部装饰线 */}
					<div
						className='absolute bottom-2 left-1/2 h-px -translate-x-1/2'
						style={{
							width: '80%',
							background: 'linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.3) 50%, transparent 100%)'
						}}
					/>

					{/* 时间显示 */}
					<div className='relative z-10 flex items-center'>
						{/* 时 */}
						<NixieTube lit>
							<GhostDigits />
							<div className={`relative z-10 flex h-full items-center justify-center ${digitChanging('h1') ? 'animate-[digitFlicker_0.15s_ease-in-out]' : ''}`}>
								<NixieDigit value={parseInt(hours[0])} />
							</div>
						</NixieTube>

						<NixieTube lit>
							<GhostDigits />
							<div className={`relative z-10 flex h-full items-center justify-center ${digitChanging('h2') ? 'animate-[digitFlicker_0.15s_ease-in-out]' : ''}`}>
								<NixieDigit value={parseInt(hours[1])} />
							</div>
						</NixieTube>

						{/* 冒号 */}
						<NixieSeparator />

						{/* 分 */}
						<NixieTube lit>
							<GhostDigits />
							<div className={`relative z-10 flex h-full items-center justify-center ${digitChanging('m1') ? 'animate-[digitFlicker_0.15s_ease-in-out]' : ''}`}>
								<NixieDigit value={parseInt(minutes[0])} />
							</div>
						</NixieTube>

						<NixieTube lit>
							<GhostDigits />
							<div className={`relative z-10 flex h-full items-center justify-center ${digitChanging('m2') ? 'animate-[digitFlicker_0.15s_ease-in-out]' : ''}`}>
								<NixieDigit value={parseInt(minutes[1])} />
							</div>
						</NixieTube>

						{showSeconds && (
							<>
								{/* 秒冒号 */}
								<NixieSeparator />

								{/* 秒 */}
								<NixieTube lit>
									<GhostDigits />
									<div className={`relative z-10 flex h-full items-center justify-center ${digitChanging('s1') ? 'animate-[digitFlicker_0.15s_ease-in-out]' : ''}`}>
										<NixieDigit value={parseInt(seconds[0])} />
									</div>
								</NixieTube>

								<NixieTube lit>
									<GhostDigits />
									<div className={`relative z-10 flex h-full items-center justify-center ${digitChanging('s2') ? 'animate-[digitFlicker_0.15s_ease-in-out]' : ''}`}>
										<NixieDigit value={parseInt(seconds[1])} />
									</div>
								</NixieTube>
							</>
						)}
					</div>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}