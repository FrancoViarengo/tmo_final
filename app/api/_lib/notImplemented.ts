import { NextResponse } from 'next/server';

export const notImplemented = (endpoint: string) =>
  NextResponse.json({ error: `${endpoint} not implemented` }, { status: 501 });
