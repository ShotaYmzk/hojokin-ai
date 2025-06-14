// 定期実行用のcronジョブ設定（Vercel Cron Functions）
// app/api/cron/scrape-subsidies/route.ts
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { SubsidyScraper } from '@/lib/scraper/subsidyScraper';

export async function GET(request: NextRequest) {
    try {
      // 環境変数でCronの秘密キーをチェック
      const cronSecret = process.env.CRON_SECRET;
      const providedSecret = request.headers.get('authorization');
      
      if (cronSecret && providedSecret !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      const scraper = new SubsidyScraper();
      await scraper.scrapeAll();
      
      return NextResponse.json({ 
        message: 'Scheduled scraping completed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Scheduled scraping error:', error);
      return NextResponse.json(
        { 
          error: 'Scraping failed', 
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  }