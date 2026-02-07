import { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 flex min-w-0">{children}</main>
    </div>
  );
}
