'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useConfigStore } from '@/app/(home)/stores/config-store'

// 游戏列表数据
const games = [
	{
		id: 'tank-battle',
		name: '坦克大战',
		description: '经典坦克大战，支持双人对战',
		cover: '/images/games/tank-battle-cover.png',
		href: '/games/tank-battle'
	}
]

export default function GamesPage() {
	const { siteContent } = useConfigStore()

	return (
		<div className='min-h-screen px-4 py-12'>
			{/* 页面标题 */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className='mb-12 text-center'>
				<h1 className='text-4xl font-medium' style={{ fontFamily: 'var(--font-averia)' }}>
					在线游戏
				</h1>
				<p className='text-secondary mt-3 text-sm'>
					工作累了？来玩一把放松一下吧 🎮
				</p>
			</motion.div>

			{/* 游戏卡片网格 */}
			<div className='mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{games.map((game, index) => (
					<motion.div
						key={game.id}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: index * 0.1 }}
						className='group cursor-pointer'>
						<Link href={game.href}>
							<div className='relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] transition-transform hover:scale-[1.02] hover:shadow-lg'>
								{/* 游戏封面 */}
								<img
									src={game.cover}
									alt={game.name}
									className='absolute inset-0 h-full w-full object-cover'
								/>
								{/* 游戏信息 */}
								<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
									<h3 className='text-lg font-medium text-white'>{game.name}</h3>
									<p className='mt-1 text-sm text-white/70'>{game.description}</p>
								</div>

								{/* 播放按钮 */}
								<div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
									<div className='flex h-14 w-14 items-center justify-center rounded-full bg-white/90'>
										<svg viewBox='0 0 24 24' fill='currentColor' className='ml-1 h-6 w-6 text-[#1a1a2e]'>
											<path d='M8 5v14l11-7z' />
										</svg>
									</div>
								</div>
							</div>
						</Link>
					</motion.div>
				))}
			</div>

			{/* 提示信息 */}
			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3 }}
				className='text-secondary mt-12 text-center text-sm'>
				更多游戏持续添加中... 敬请期待 🚀
			</motion.p>
		</div>
	)
}
