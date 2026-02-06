import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error_param = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Determine redirect base URL
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const origin = request.nextUrl.origin;

  let baseUrl: string;
  if (isLocalEnv) {
    baseUrl = origin;
  } else if (forwardedHost) {
    baseUrl = `https://${forwardedHost}`;
  } else {
    baseUrl = origin;
  }

  // Handle OAuth error from provider
  if (error_param) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error_description || error_param)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code_received`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${baseUrl}/login?error=missing_supabase_config`);
  }

  // Create response first, then set cookies on it
  const response = NextResponse.redirect(`${baseUrl}${next}`);

  // Track cookies being set
  const cookiesSet: string[] = [];

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log('Auth callback - Reading cookies:', cookies.map(c => c.name));
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('Auth callback - Setting cookies:', cookiesToSet.map(c => c.name));
          cookiesToSet.forEach(({ name, value, options }) => {
            cookiesSet.push(name);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_session_returned`);
  }

  // Manually set the auth cookie since exchangeCodeForSession doesn't trigger setAll
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef && data.session) {
    const cookieName = `sb-${projectRef}-auth-token`;
    const cookieValue = JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.session.expires_in,
      expires_in: data.session.expires_in,
      token_type: 'bearer',
      type: 'access',
      user: data.session.user,
    });

    // Set the auth cookie
    response.cookies.set(cookieName, cookieValue, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.session.expires_in,
    });

    // Remove the code verifier cookie
    response.cookies.delete(`sb-${projectRef}-auth-token-code-verifier`);
  }

  return response;
}
