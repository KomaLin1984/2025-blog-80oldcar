'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// NES 游戏列表 - 用户添加 ROM 后在这里配置
const nesGames = [
	{
		id: 'super-mario-bros',
		name: '超级玛丽',
		filename: 'super-mario-bros.nes',
		controls: '方向键移动，A 跳，B 加速'
	},
	{
		id: 'contra',
		name: '魂斗罗',
		filename: 'contra.nes',
		controls: '方向键移动，A 射击，B 跳跃'
	}
]

export default function NESGamePage() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const nesRef = useRef<any>(null)
	const animationRef = useRef<number>(0)
	const [selectedGame, setSelectedGame] = useState<string>('')
	const [isLoaded, setIsLoaded] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [showGameList, setShowGameList] = useState(true)

	// 初始化 jsnes
	useEffect(() => {
		if (typeof window === 'undefined') return

		// 动态导入 jsnes
		import('jsnes').then((jsnesModule) => {
			const NES = jsnesModule.NES
			nesRef.current = new NES({
				onFrame: (frameBuffer: Uint8Array) => {
					const canvas = canvasRef.current
					if (!canvas) return
					const ctx = canvas.getContext('2d')
					if (!ctx) return

					const imageData = ctx.createImageData(256, 240)
					for (let i = 0; i < 256 * 240; i++) {
						const pixel = frameBuffer[i]
						imageData.data[i * 4] = (pixel >> 16) & 0xff // R
						imageData.data[i * 4 + 1] = (pixel >> 8) & 0xff // G
						imageData.data[i * 4 + 2] = pixel & 0xff // B
						imageData.data[i * 4 + 3] = 0xff // A
					}
					ctx.putImageData(imageData, 0, 0)
				}
			})
		})
	}, [])

	// 加载 ROM 文件
	const loadROM = async (filename: string) => {
		if (!nesRef.current) {
			setError('模拟器未初始化')
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const response = await fetch(`/nes/roms/${filename}`)
			if (!response.ok) {
				throw new Error('ROM 文件不存在')
			}
			const buffer = await response.arrayBuffer()
			const array = new Uint8Array(buffer)
			nesRef.current.loadROM(array)
			setIsLoaded(true)
			setShowGameList(false)
			startGameLoop()
		} catch (err: any) {
			setError(`加载失败: ${err.message}`)
		} finally {
			setIsLoading(false)
		}
	}

	// 游戏主循环
	const startGameLoop = () => {
		const loop = () => {
			if (nesRef.current) {
				nesRef.current.frame()
			}
			animationRef.current = requestAnimationFrame(loop)
		}
		loop()
	}

	// 键盘控制
	useEffect(() => {
		if (!isLoaded) return

		const keyMap: Record<string, number> = {
			ArrowUp: nesRef.current.BUTTON_UP,
			ArrowDown: nesRef.current.BUTTON_DOWN,
			ArrowLeft: nesRef.current.BUTTON_LEFT,
			ArrowRight: nesRef.current.BUTTON_RIGHT,
			KeyZ: nesRef.current.BUTTON_A,
			KeyX: nesRef.current.BUTTON_B,
			Enter: nesRef.current.BUTTON_START,
			ShiftRight: nesRef.current.BUTTON_SELECT
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			e.preventDefault()
			const button = keyMap[e.code]
			if (button !== undefined && nesRef.current) {
				nesRef.current.buttonDown(1, button)
			}
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			const button = keyMap[e.code]
			if (button !== undefined && nesRef.current) {
				nesRef.current.buttonUp(1, button)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [isLoaded])

	// 返回游戏列表
	const backToList = () => {
		setShowGameList(true)
		setIsLoaded(false)
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current)
		}
	}

	return (
		<div className='flex h-screen flex-col bg-[#1a1a2e]'>
			{/* 顶部导航 */}
			<div className='flex items-center justify-between border-b border-white/10 bg-[#16213e] px-4 py-3'>
				<Link
					href='/games'
					className='flex items-center gap-2 text-white/80 transition-colors hover:text-white'>
					<svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
						<path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
					</svg>
					<span className='text-sm'>返回游戏列表</span>
				</Link>
				<h1 className='text-lg font-medium text-white'>NES 游戏</h1>
				{isLoaded ? (
					<button
						onClick={backToList}
						className='text-sm text-yellow-400 hover:text-yellow-300'>
						切换游戏
					</button>
				) : (
					<div className='w-32'></div>
				)}
			</div>

			{/* 游戏说明 */}
			<div className='bg-[#16213e] px-6 py-3 text-center text-sm text-white/80'>
				<span className='text-yellow-400'>🎮 操作说明：</span>
				方向键移动 | Z = A键 | X = B键 | Enter = 开始 | 右Shift = 选择
			</div>

			{/* 游戏内容区 */}
			<div className='flex flex-1 items-center justify-center'>
				{showGameList ? (
					/* 游戏选择列表 */
					<div className='grid gap-6 p-8'>
						<h2 className='mb-4 text-center text-xl text-white'>选择游戏</h2>
						{nesGames.map((game) => (
							<button
								key={game.id}
								onClick={() => loadROM(game.filename)}
								disabled={isLoading}
								className='flex flex-col items-center gap-2 rounded-xl bg-[#16213e] p-6 text-white transition-all hover:bg-[#1a2a4e] disabled:opacity-50'>
								<span className='text-2xl'>🎮</span>
								<span className='text-lg font-medium'>{game.name}</span>
								<span className='text-xs text-white/60'>{game.filename}</span>
							</button>
						))}

						{error && (
							<div className='mt-4 rounded-lg bg-red-500/20 p-4 text-center text-red-400'>
								{error}
							</div>
						)}

						{isLoading && (
							<div className='mt-4 text-center text-white/60'>加载中...</div>
						)}

						<div className='mt-6 rounded-lg bg-yellow-500/10 p-4 text-center text-sm text-yellow-400'>
							<p>将你的 NES ROM 文件(.nes)放到</p>
							<code className='text-xs'>public/nes/roms/</code>
							<p>目录，然后在 games/nes/page.tsx 中配置游戏列表</p>
						</div>
					</div>
				) : (
					/* 游戏画面 */
					<div className='flex flex-col items-center'>
						<canvas
							ref={canvasRef}
							width={512}
							height={480}
							className='rounded-lg shadow-2xl'
							style={{ imageRendering: 'pixelated' }}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
