'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause, Play, Shuffle, Repeat, RepeatOnce, ListMusic, X, ChevronUp } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

type PlayMode = 'order' | 'loop' | 'shuffle'

const MUSIC_FILES = [
  '/music/Axel F-maromaro1337.mp3',
  '/music/Feel Good Inc-maromaro1337.mp3',
  '/music/christmas.m4a',
]

const MUSIC_NAMES = [
  'Axel F',
  'Feel Good Inc',
  'Christmas',
]

export default function MusicCard() {
  const pathname = usePathname()
  const center = useCenterStore()
  const { cardStyles } = useConfigStore()
  const styles = cardStyles.musicCard
  const hiCardStyles = cardStyles.hiCard
  const clockCardStyles = cardStyles.clockCard
  const calendarCardStyles = cardStyles.calendarCard

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playMode, setPlayMode] = useState<PlayMode>('order')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIndexRef = useRef(0)
  const shuffledRef = useRef<number[]>([])

  const isHomePage = pathname === '/'

  // Generate shuffled order once
  const getShuffledIndices = useCallback(() => {
    const indices = MUSIC_FILES.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [])

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

  // Initialize audio
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
      if (playMode === 'loop') {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        let nextIndex: number
        if (playMode === 'shuffle') {
          const shuffled = shuffledRef.current
          const currentInShuffle = shuffled.indexOf(currentIndexRef.current)
          const nextInShuffle = (currentInShuffle + 1) % shuffled.length
          nextIndex = shuffled[nextInShuffle]
        } else {
          nextIndex = (currentIndexRef.current + 1) % MUSIC_FILES.length
        }
        currentIndexRef.current = nextIndex
        setCurrentIndex(nextIndex)
        setProgress(0)
      }
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [playMode])

  // Handle currentIndex change
  useEffect(() => {
    currentIndexRef.current = currentIndex
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused
      audioRef.current.pause()
      audioRef.current.src = MUSIC_FILES[currentIndex]
      audioRef.current.load()
      setProgress(0)
      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentIndex])

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Initialize shuffle when switching to shuffle mode
  useEffect(() => {
    if (playMode === 'shuffle' && shuffledRef.current.length === 0) {
      shuffledRef.current = getShuffledIndices()
    }
  }, [playMode, getShuffledIndices])

  // Cleanup
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
    if (nextMode === 'shuffle' && shuffledRef.current.length === 0) {
      shuffledRef.current = getShuffledIndices()
    }
  }

  const playTrack = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(true)
  }

  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'loop':
        return <Repeat className="h-3.5 w-3.5 text-brand" />
      case 'shuffle':
        return <Shuffle className="h-3.5 w-3.5 text-brand" />
      default:
        return <Repeat className="h-3.5 w-3.5 text-secondary" />
    }
  }

  // Hide if not on home page and not playing
  if (!isHomePage && !isPlaying) {
    return null
  }

  return (
    <HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={showPlaylist ? 320 : styles.height}>
      <Card order={styles.order} width={styles.width} height={showPlaylist ? 320 : styles.height} x={x} y={y} className={clsx('flex flex-col', !isHomePage && 'fixed')}>
        {/* Main player bar */}
        <div className="flex items-center gap-2 p-3">
          <MusicSVG className="h-6 w-6 text-brand flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="text-primary text-sm font-medium truncate">{MUSIC_NAMES[currentIndex]}</div>
            <div className="mt-1 h-1.5 rounded-full bg-white/40">
              <div className="bg-brand h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button onClick={togglePlayPause} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 hover:bg-white transition-opacity flex-shrink-0">
            {isPlaying ? <Pause className="text-brand h-3.5 w-3.5" /> : <Play className="text-brand h-3.5 w-3.5 ml-0.5" />}
          </button>

          <button onClick={cyclePlayMode} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/50 transition-opacity flex-shrink-0" title={playMode}>
            {getPlayModeIcon()}
          </button>

          <button onClick={() => setShowPlaylist(!showPlaylist)} className={clsx("flex h-8 w-8 items-center justify-center rounded-full transition-opacity flex-shrink-0", showPlaylist ? 'bg-brand/20' : 'hover:bg-white/50')}>
            {showPlaylist ? <X className="h-3.5 w-3.5 text-brand" /> : <ListMusic className="h-3.5 w-3.5 text-secondary" />}
          </button>
        </div>

        {/* Playlist */}
        {showPlaylist && (
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {MUSIC_FILES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => playTrack(idx)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                  currentIndex === idx ? 'bg-brand/20 text-brand' : 'hover:bg-white/50 text-secondary'
                )}
              >
                <span className="w-5 text-xs">{currentIndex === idx ? (isPlaying ? '▶' : '♪') : `${idx + 1}.`}</span>
                <span className="truncate">{MUSIC_NAMES[idx]}</span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </HomeDraggableLayer>
  )
}
