import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
  if (process.env.VERCEL === '1' && commitRef === 'main') {
    return new NextResponse(
      'Deployment on the main branch is disabled. Only the Ingenium-edition-2026 branch is active.',
      {
        status: 403,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
        },
      }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
