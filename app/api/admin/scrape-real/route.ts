// app/api/admin/scrape-real/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RealSubsidyScraper } from '@/lib/scraper/realSubsidyScraper';

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 実在サイトスクレイピング開始...');
    
    const scraper = new RealSubsidyScraper();
    await scraper.scrapeAllReal();
    
    return NextResponse.json({
      message: '実在サイトスクレイピングが完了しました',
      timestamp: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('❌ 実在サイトスクレイピングエラー:', error);
    
    return NextResponse.json(
      {
        error: '実在サイトスクレイピング中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POSTでも同じ処理を実行
  return GET(request);
}