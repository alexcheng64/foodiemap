import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error_param = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Log for debugging
  console.log('Auth callback received:', {
    hasCode: !!code,
    error: error_param,
    error_description,
    origin
  });

  // Handle OAuth error from provider
  if (error_param) {
    console.error('OAuth error:', error_param, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error_param)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            console.log('Setting cookies:', cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('Exchange result:', {
      success: !!data.session,
      error: error?.message,
      userId: data.session?.user?.id
    });

    if (!error && data.session) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      let redirectUrl: string;
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      } else {
        redirectUrl = `${origin}${next}`;
      }

      console.log('Redirecting to:', redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }

    console.error('Session exchange failed:', error?.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
