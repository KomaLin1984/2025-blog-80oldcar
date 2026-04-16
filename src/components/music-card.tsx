'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause, Play, Shuffle, Repeat, ListMusic, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

type PlayMode = 'order' | 'loop' | 'shuffle'

interface MusicFile {
  name: string
  path: string
}

const PlayModeIcon = ({ mode }: { mode: PlayMode }) => {
  switch (mode) {
    case 'loop':
      return <Repeat className="h-4 w-4 text-brand" strokeWidth={2.5} />
    case 'shuffle':
      return <Shuffle className="h-4 w-4 text-brand" strokeWidth={2.5} />
    default:
      return <Repeat className="h-4 w-4 text-secondary" strokeWidth={2.5} />
  }
}

export default function MusicCard() {
  const pathname = usePathname()
  const center = useCenterStore()
  const { cardStyles } = useConfigStore()
  const styles = cardStyles.musicCard
  const hiCardStyles = cardStyles.hiCard
  const clockCardStyles = cardStyles.clockCard
  const calendarCardStyles = cardStyles.calendarCard

  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playMode, setPlayMode] = useState<PlayMode>('order')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIndexRef = useRef(0)
  const shuffledRef = useRef<number[]>([])

  const isHomePage = pathname === '/'

  useEffect(() => {
    fetch('/api/music')
      .then(res => res.json())
      .then(data => {
        const files = data.map((item: { name: string; path: string }) => ({
          name: item.name.replace(/\.[^.]+$/, ''),
          path: item.path,
        }))
        setMusicFiles(files)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getShuffledIndices = useCallback(() => {
    const indices = musicFiles.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [musicFiles])

  const position = useMemo(() => {
    if (!isHomePage) {
      return {
        x: center.width - styles.width - 16,
        y: center.height - styles.height - 16
      }
    }
    return {
      x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
      y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
    }
  }, [isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

  const { x, y } = position

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      if (playMode === 'loop' && musicFiles.length > 0) {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else if (musicFiles.length > 1) {
        let nextIndex: number
        if (playMode === 'shuffle') {
          const shuffled = shuffledRef.current
          const currentInShuffle = shuffled.indexOf(currentIndexRef.current)
          const nextInShuffle = (currentInShuffle + 1) % shuffled.length
          nextIndex = shuffled[nextInShuffle]
        } else {
          nextIndex = (currentIndexRef.current + 1) % musicFiles.length
        }
        currentIndexRef.current = nextIndex
        setCurrentIndex(nextIndex)
        setProgress(0)
        audio.play().catch(console.error)
      } else {
        setIsPlaying(false)
        setProgress(0)
      }
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playMode, musicFiles.length])

  useEffect(() => {
    if (musicFiles.length === 0) return
    currentIndexRef.current = currentIndex
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused
      audioRef.current.pause()
      audioRef.current.src = musicFiles[currentIndex].path
      audioRef.current.load()
      setProgress(0)
      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentIndex, musicFiles])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying && musicFiles.length > 0) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, musicFiles.length])

  useEffect(() => {
    if (playMode === 'shuffle' && shuffledRef.current.length === 0 && musicFiles.length > 0) {
      shuffledRef.current = getShuffledIndices()
    }
  }, [playMode, getShuffledIndices, musicFiles.length])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const cyclePlayMode = () => {
    const modes: PlayMode[] = ['order', 'loop', 'shuffle']
    const currentIdx = modes.indexOf(playMode)
    const nextIdx = (currentIdx + 1) % modes.length
    const nextMode = modes[nextIdx]
    setPlayMode(nextMode)
    if (nextMode === 'shuffle' && shuffledRef.current.length === 0 && musicFiles.length > 0) {
      shuffledRef.current = getShuffledIndices()
    }
  }

  const playTrack = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(true)
  }

  if (!isHomePage && !isPlaying) {
    return null
  }

  const currentName = musicFiles.length > 0 ? musicFiles[currentIndex].name : '暂无音乐'

  return (
    <HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={showPlaylist ? 300 : styles.height}>
      <Card order={styles.order} width={styles.width} height={showPlaylist ? 300 : styles.height} x={x} y={y} className={clsx('flex flex-col', !isHomePage && 'fixed')}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <MusicSVG className="w-full h-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-primary text-sm font-medium truncate">{currentName}</div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/40 overflow-hidden">
              <div className="bg-brand h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={togglePlayPause} disabled={loading || musicFiles.length === 0} className="w-8 h-8 rounded-full bg-white/80 hover:bg-white transition-opacity flex items-center justify-center disabled:opacity-50">
              {isPlaying ? (
                <Pause className="h-4 w-4 text-brand" strokeWidth={2.5} />
              ) : (
                <Play className="h-4 w-4 text-brand ml-0.5" strokeWidth={2.5} />
              )}
            </button>

            <button onClick={cyclePlayMode} disabled={musicFiles.length === 0} className="w-8 h-8 rounded-full hover:bg-white/50 transition-opacity flex items-center justify-center disabled:opacity-50" title={playMode}>
              <PlayModeIcon mode={playMode} />
            </button>

            <button onClick={() => setShowPlaylist(!showPlaylist)} className={clsx("w-8 h-8 rounded-full transition-opacity flex items-center justify-center", showPlaylist ? 'bg-brand/20' : 'hover:bg-white/50')}>
              {showPlaylist ? (
                <X className="h-4 w-4 text-brand" strokeWidth={2.5} />
              ) : (
                <ListMusic className="h-4 w-4 text-secondary" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {showPlaylist && (
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {loading ? (
              <div className="text-center text-secondary text-sm py-4">加载中...</div>
            ) : musicFiles.length === 0 ? (
              <div className="text-center text-secondary text-sm py-4">暂无音乐文件</div>
            ) : (
              musicFiles.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => playTrack(idx)}
                  className={clsx(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                    currentIndex === idx ? 'bg-brand/20 text-brand' : 'hover:bg-white/50 text-secondary'
                  )}
                >
                  <span className="w-5 text-xs font-medium">{currentIndex === idx ? (isPlaying ? '▶' : '♪') : `${idx + 1}.`}</span>
                  <span className="truncate">{file.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </Card>
    </HomeDraggableLayer>
  )
}
