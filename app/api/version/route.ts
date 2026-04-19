import { NextResponse } from 'next/server';

const version = process.env.NEXT_PUBLIC_VERSION || 'dev';
const commit = process.env.NEXT_PUBLIC_COMMIT || 'unknown';
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown';

export async function GET() {
  return NextResponse.json({
    version,
    commit,
    buildTime,
  });
}
