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

  // TEMPORARY DEBUG - show what's happening
  const debugInfo = {
    hasSession: !!data.session,
    userId: data.session?.user?.id,
    error: error?.message,
    cookiesRead: request.cookies.getAll().map(c => c.name),
    cookiesSet,
    responseCookies: response.cookies.getAll().map(c => c.name),
  };

  // Return debug info as JSON (remove this after debugging)
  return NextResponse.json(debugInfo);

  /* UNCOMMENT AFTER DEBUGGING:
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_session_returned`);
  }

  return response;
  */
}
