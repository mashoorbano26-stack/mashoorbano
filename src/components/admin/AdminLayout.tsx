'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Props {
  page: string;
  children?: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/admin',              icon: '📊' },
  { label: 'Hero',         href: '/admin/hero',         icon: '⚡' },
  { label: 'Story',        href: '/admin/story',        icon: '📖' },
  { label: 'Services',     href: '/admin/services',     icon: '🧩' },
  { label: 'Packages',     href: '/admin/packages',     icon: '📦' },
  { label: 'Portfolio',    href: '/admin/portfolio',    icon: '🖼️' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: '⭐' },
  { label: 'Orders',       href: '/admin/orders',       icon: '🛒' },
  { label: 'Leads',        href: '/admin/leads',        icon: '👥' },
  { label: 'Blog',         href: '/admin/blog',         icon: '📝' },
  { label: 'SEO',          href: '/admin/seo',          icon: '🔍' },
  { label: 'Media',        href: '/admin/media',        icon: '📁' },
  { label: 'Theme',        href: '/admin/theme',        icon: '🎨' },
  { label: 'Settings',     href: '/admin/settings',     icon: '⚙️' },
];

export default function AdminLayout({ page, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex font-body">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0D0D0D] border-r border-[#1E1E1E] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#1E1E1E]">
          <a href="/" className="font-heading font-black text-xl text-white" style={{ letterSpacing: '-0.03em' }}>
            Mash<span style={{ color: '#FF3B00' }}>urban</span>
          </a>
          <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = page === item.label.toLowerCase() || (page === 'index' && item.href === '/admin');
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF3B00] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-[#1E1E1E]">
          {user && (
            <p className="text-[11px] text-gray-600 mb-3 truncate">{user.email}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-heading font-bold text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors text-left flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#1E1E1E] flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-heading font-bold text-sm text-gray-400 capitalize">
            {page === 'index' ? 'Dashboard' : page}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="text-xs text-gray-600 hover:text-gray-300 transition-colors font-body flex items-center gap-1"
            >
              View site ↗
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
