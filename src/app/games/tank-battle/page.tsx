'use client'

import Link from 'next/link'

export default function TankBattlePage() {
	return (
		<div className='min-h-screen bg-[#1a1a2e]'>
			{/* 顶部导航栏 */}
			<div className='bg-[#16213e] px-4 py-3'>
				<div className='mx-auto flex max-w-6xl items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Link href='/' className='flex items-center gap-2 text-white/80 transition-colors hover:text-white'>
							{/* 房子图标 */}
							<svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
								<path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' />
							</svg>
							<span className='text-sm'>首页</span>
						</Link>
						<Link href='/games' className='flex items-center gap-2 text-white/80 transition-colors hover:text-white'>
							<svg viewBox='0 0 24 24' fill='currentColor' className='h-5 w-5'>
								<path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
							</svg>
							<span className='text-sm'>返回游戏列表</span>
						</Link>
					</div>
					<h1 className='text-lg font-medium text-white'>坦克大战</h1>
					<div className='w-32'></div>
				</div>
			</div>

			{/* 游戏容器 - 全屏居中，不裁剪 */}
			<div className='flex h-[calc(100vh-120px)] items-center justify-center bg-black'>
				<iframe
					src='/games/tank-battle/index.html'
					width='512'
					height='448'
					className='max-w-full bg-black'
					sandbox='allow-scripts allow-same-origin'
					title='坦克大战'
				/>
			</div>
		</div>
	)
}