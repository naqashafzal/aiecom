import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, pathname, referrer } = body;

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('zsd_visitor_session')?.value;
    
    let isNewSession = false;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      isNewSession = true;
    }

    const reqHeaders = await headers();
    const userAgent = reqHeaders.get('user-agent') || '';
    
    // Attempt to get country from Cloudflare or Vercel headers
    const country = reqHeaders.get('cf-ipcountry') || reqHeaders.get('x-vercel-ip-country') || 'Unknown';
    
    // Parse user agent roughly
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'Tablet';
    }

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';

    // Upsert Visitor
    const visitor = await db.visitor.upsert({
      where: { sessionId },
      update: {
        updatedAt: new Date(),
        country: country !== 'Unknown' ? country : undefined // don't overwrite if unknown
      },
      create: {
        sessionId,
        country,
        city: 'Unknown',
        browser,
        os,
        device
      }
    });

    // Create PageView
    await db.pageView.create({
      data: {
        visitorId: visitor.id,
        url,
        pathname,
        referrer: referrer && referrer.length > 0 && !referrer.includes(reqHeaders.get('host') || '') ? referrer : null
      }
    });

    const response = NextResponse.json({ success: true });
    
    if (isNewSession) {
      // Set cookie for 1 year
      response.cookies.set('zsd_visitor_session', sessionId, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;

  } catch (error) {
    console.error('[Analytics Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
