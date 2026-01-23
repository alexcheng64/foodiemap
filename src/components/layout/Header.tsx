'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSearchContextOptional } from '@/components/providers/SearchProvider';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const searchContext = useSearchContextOptional();
  const [showMenu, setShowMenu] = useState(false);

  const query = searchContext?.query ?? '';
  const searchParams = searchContext?.searchParams ?? null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900">FoodieMap</span>
          </Link>

          {/* Active Search Indicator */}
          {searchParams && (
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="max-w-[120px] truncate">&ldquo;{query}&rdquo;</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Map
            </Link>
            <Link
              href="/search"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Search
            </Link>
            {user && (
              <>
                <Link
                  href="/bookmarks"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Bookmarks
                </Link>
                <Link
                  href="/tags"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Tags
                </Link>
              </>
            )}
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 text-sm"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-gray-700">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/bookmarks"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                      onClick={() => setShowMenu(false)}
                    >
                      Bookmarks
                    </Link>
                    <Link
                      href="/tags"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                      onClick={() => setShowMenu(false)}
                    >
                      Tags
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
