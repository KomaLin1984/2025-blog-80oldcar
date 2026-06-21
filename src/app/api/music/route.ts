import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'

const MUSIC_DIR = join(process.cwd(), 'public/music')

export async function GET() {
  try {
    const files = await readdir(MUSIC_DIR)
    const musicFiles = files
      .filter(file => /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file))
      .map(file => ({
        name: file,
        path: `/music/${file}`
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(musicFiles)
  } catch {
    return NextResponse.json([])
  }
}