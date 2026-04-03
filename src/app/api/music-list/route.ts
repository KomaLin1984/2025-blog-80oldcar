import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    
    // 如果文件夹不存在，返回空数组
    if (!fs.existsSync(musicDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(musicDir)
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(file => `/music/${file}`);  // 转为 public 可访问路径

    return NextResponse.json(files);
  } catch (error) {
    console.error('读取音乐文件失败:', error);
    return NextResponse.json([], { status: 500 });
  }
}