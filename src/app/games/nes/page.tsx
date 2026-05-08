'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Browser } from 'jsnes'

// NES 游戏列表（文件名需与 public/nes/roms/ 目录下的实际ROM文件匹配）
const nesGames = [
	{
		id: 'super-mario-bros',
		name: '超级玛丽',
		filename: '(W) Super Mario Bros. [!].nes',
		controls: '方向键移动，A 跳，B 加速'
	},
	{
		id: 'contra',
		name: '魂斗罗',
		filename: 'Contra1(U)30.nes',
		controls: '方向键移动，A 射击，B 跳跃'
	}
]

export default function NESGamePage() {
	const containerRef = useRef<HTMLDivElement>(null)
	const browserRef = useRef<Browser | null>(null)
	const [selectedGame, setSelectedGame] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [showGameList, setShowGameList] = useState(true)

	// 加载 ROM
	const loadROM = async (filename: string) => {
		if (!containerRef.current) return

		setIsLoading(true)
		setError('')

		try {
			// 清理旧实例
			if (browserRef.current) {
				browserRef.current.destroy()
				browserRef.current = null
			}

			const response = await fetch(`/nes/roms/${filename}`)
			if (!response.ok) {
				throw new Error('ROM 文件不存在，请先添加 ROM 文件')
			}
			const buffer = await response.arrayBuffer()
			const array = new Uint8Array(buffer)

			// 使用 jsnes Browser API (直接传 Uint8Array，不要转成普通数组)
			browserRef.current = new Browser({
				container: containerRef.current,
				romData: array,
				onError: (e: Error) => {
					setError(`游戏运行错误: ${e.message}`)
					setIsLoading(false)
				}
			})

			setSelectedGame(filename)
			setShowGameList(false)
			setIsLoading(false)
		} catch (err: any) {
			setError(`加载失败: ${err.message}`)
			setIsLoading(false)
		}
	}

	// 清理
	useEffect(() => {
		return () => {
			if (browserRef.current) {
				browserRef.current.destroy()
			}
		}
	}, [])

	// 返回游戏列表
	const backToList = () => {
		if (browserRef.current) {
			browserRef.current.destroy()
			browserRef.current = null
		}
		setShowGameList(true)
		setSelectedGame('')
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
				{isLoading || !showGameList ? (
					<button
						onClick={backToList}
						className='text-sm text-yellow-400 hover:text-yellow-300'>
						切换游戏
					</button>
				) : (
					<div className='w-24'></div>
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
								<span className='text-xs text-white/60'>{game.controls}</span>
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
							<p>目录即可开始游戏</p>
						</div>
					</div>
				) : (
					/* 游戏画面 */
					<div className='flex flex-col items-center'>
						<div
							ref={containerRef}
							style={{ width: '512px', height: '480px' }}
							className='rounded-lg shadow-2xl'
						/>
					</div>
				)}
			</div>
		</div>
	)
}
