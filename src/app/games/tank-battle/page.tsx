'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function TankBattlePage() {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// 动态加载游戏脚本
		const loadScript = (src: string) => {
			return new Promise<void>((resolve, reject) => {
				const script = document.createElement('script')
				script.src = src
				script.onload = () => resolve()
				script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
				document.head.appendChild(script)
			})
		}

		const loadCss = (href: string) => {
			return new Promise<void>((resolve) => {
				const link = document.createElement('link')
				link.rel = 'stylesheet'
				link.href = href
				link.onload = () => resolve()
				link.onerror = () => resolve() // 即使失败也继续
				document.head.appendChild(link)
			})
		}

		async function initGame() {
			try {
				// 加载 CSS
				await loadCss('/games/tank-battle/css/default.css')

				// 加载 JS 依赖（按顺序）
				const jsFiles = [
					'/games/tank-battle/js/jquery.min.js',
					'/games/tank-battle/js/Helper.js',
					'/games/tank-battle/js/keyboard.js',
					'/games/tank-battle/js/const.js',
					'/games/tank-battle/js/level.js',
					'/games/tank-battle/js/crackAnimation.js',
					'/games/tank-battle/js/prop.js',
					'/games/tank-battle/js/bullet.js',
					'/games/tank-battle/js/tank.js',
					'/games/tank-battle/js/num.js',
					'/games/tank-battle/js/menu.js',
					'/games/tank-battle/js/map.js',
					'/games/tank-battle/js/Collision.js',
					'/games/tank-battle/js/stage.js',
					'/games/tank-battle/js/main.js'
				]

				for (const file of jsFiles) {
					await loadScript(file)
				}
			} catch (error) {
				console.error('Failed to load game:', error)
			}
		}

		initGame()
	}, [])

	return (
		<div className='min-h-screen bg-[#1a1a2e]'>
			{/* 顶部导航栏 */}
			<div className='bg-[#16213e] px-4 py-3'>
				<div className='mx-auto flex max-w-6xl items-center justify-between'>
					<Link href='/games' className='flex items-center gap-2 text-white/80 transition-colors hover:text-white'>
						<svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
							<path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
						</svg>
						<span className='text-sm'>返回游戏列表</span>
					</Link>
					<h1 className='text-lg font-medium text-white'>坦克大战</h1>
					<div className='w-20'></div>
				</div>
			</div>

			{/* 游戏容器 */}
			<div ref={containerRef} className='container mx-auto px-4 py-6'>
				<div className='mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black'>
					{/* 游戏说明 */}
					<div className='bg-[#16213e] px-6 py-3 text-center text-sm text-white/80'>
						<span className='text-yellow-400'>🎮 操作说明：</span>
						玩家1：WASD移动 + 空格射击 | 玩家2：方向键移动 + Enter射击 | N：下一关 | P：上一关
					</div>

					{/* 游戏画布区域 */}
					<div id='canvasDiv' className='relative'>
						<canvas id='wallCanvas'></canvas>
						<canvas id='tankCanvas'></canvas>
						<canvas id='grassCanvas'></canvas>
						<canvas id='overCanvas'></canvas>
						<canvas id='stageCanvas'></canvas>
					</div>
				</div>
			</div>

			<style jsx>{`
				#canvasDiv {
					position: relative;
					width: 100%;
					max-width: 900px;
					margin: 0 auto;
					aspect-ratio: 900 / 600;
				}
				#canvasDiv canvas {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
				}
			`}</style>
		</div>
	)
}
