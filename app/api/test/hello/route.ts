import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API が正常に動作しています',
    timestamp: new Date().toISOString()
  });
}