import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error_param = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Handle OAuth error from provider
  if (error_param) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error_param)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code_received`);
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if env vars are set
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=missing_supabase_config`);
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    return NextResponse.redirect(`${origin}/login?error=no_session_returned`);
  }

  // Success - redirect to destination
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

  return NextResponse.redirect(redirectUrl);
}
