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
	},
	{
		id: 'gold-miner',
		name: '黄金矿工',
		description: '挖掘黄金，达成目标金额',
		cover: '/images/games/gold-miner-cover.png',
		href: '/games/gold-miner'
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
								<div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]'>
									{/* 如果没有封面图，显示默认坦克图标 */}
									<div className='text-[var(--color-brand)]'>
										<svg viewBox='0 0 80 80' fill='currentColor' className='h-20 w-20 opacity-80'>
											<rect x='10' y='40' width='60' height='30' rx='4' />
											<rect x='25' y='28' width='30' height='18' rx='3' />
											<rect x='38' y='10' width='4' height='22' />
											<rect x='36' y='8' width='8' height='4' />
											<rect x='12' y='66' width='12' height='8' rx='2' />
											<rect x='32' y='66' width='12' height='8' rx='2' />
											<rect x='52' y='66' width='12' height='8' rx='2' />
											<rect x='12' y='6' width='12' height='8' rx='2' />
											<rect x='32' y='6' width='12' height='8' rx='2' />
											<rect x='52' y='6' width='12' height='8' rx='2' />
										</svg>
									</div>
								</div>

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
