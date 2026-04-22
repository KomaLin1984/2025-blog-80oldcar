'use client'

import Link from 'next/link'

export default function TankBattlePage() {
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
			<div className='container mx-auto px-4 py-6'>
				<div className='mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black'>
					{/* 游戏说明 */}
					<div className='bg-[#16213e] px-6 py-3 text-center text-sm text-white/80'>
						<span className='text-yellow-400'>🎮 操作说明：</span>
						玩家1：WASD移动 + 空格射击 | 玩家2：方向键移动 + Enter射击 | N：下一关 | P：上一关
					</div>

					{/* 使用 iframe 加载游戏 */}
					<iframe
						src='/games/tank-battle/index.html'
						className='w-full'
						style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
						sandbox='allow-scripts allow-same-origin'
						title='坦克大战'
					/>
				</div>
			</div>
		</div>
	)
}
