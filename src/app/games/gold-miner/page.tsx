'use client'

import Link from 'next/link'

export default function GoldMinerPage() {
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
				<h1 className='text-lg font-medium text-white'>黄金矿工</h1>
				<div className='w-32'></div>
			</div>

			{/* 游戏说明 */}
			<div className='bg-[#16213e] px-6 py-3 text-center text-sm text-white/80'>
				<span className='text-yellow-400'>🎮 操作说明：</span>
				按空格键或点击屏幕发射/收回吊钩 | 双击重玩 | 目标：60秒内赚到 $500
			</div>

			{/* 游戏容器 - 全屏居中，不裁剪 */}
			<div className='flex flex-1 items-center justify-center'>
				<iframe
					src='/games/gold-miner/index.html'
					width='480'
					height='400'
					className='max-w-full bg-black'
					sandbox='allow-scripts allow-same-origin'
					title='黄金矿工'
				/>
			</div>
		</div>
	)
}
