// src/components/admin/AdminLayout.tsx
// Fixed: removed server-only supabase import — auth is handled by Astro middleware
// This is a pure UI layout component, no Supabase needed here
'use client';

import { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  active?: string;
}

export default function AdminLayout({ children, active = '' }: Props) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: '/admin',              label: 'Dashboard' },
    { href: '/admin/header',       label: 'Header' },
    { href: '/admin/hero',         label: 'Hero' },
    { href: '/admin/stats',        label: 'Ticker & Stats' },
    { href: '/admin/story',        label: 'Story' },
    { href: '/admin/services',     label: 'Services' },
    { href: '/admin/packages',     label: 'Packages' },
    { href: '/admin/portfolio',    label: 'Portfolio' },
    { href: '/admin/testimonials', label: 'Testimonials' },
    { href: '/admin/orders',       label: 'Orders' },
    { href: '/admin/leads',        label: 'Leads' },
    { href: '/admin/blog',         label: 'Blog' },
    { href: '/admin/seo',          label: 'SEO' },
    { href: '/admin/media',        label: 'Media' },
    { href: '/admin/settings',     label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F5F2', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, minHeight: '100vh', background: '#fff',
        borderRight: '1px solid #E5E0D8', display: 'flex',
        flexDirection: 'column', position: 'sticky', top: 0,
        height: '100vh', overflowY: 'auto', flexShrink: 0,
      }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', padding: '1.25rem 1rem', borderBottom: '1px solid #E5E0D8' }}>
          Mash<span style={{ color: '#FF3B00' }}>urban</span>
        </div>
        <nav style={{ flex: 1 }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} style={{
              display: 'block', padding: '.45rem 1rem',
              color: active === l.href ? '#FF3B00' : '#888',
              fontSize: '.8125rem', textDecoration: 'none',
              borderLeft: active === l.href ? '2px solid #FF3B00' : '2px solid transparent',
              background: active === l.href ? '#fff5f3' : 'transparent',
            }}>{l.label}</a>
          ))}
        </nav>
        <div style={{ padding: '.75rem 1rem', borderTop: '1px solid #E5E0D8' }}>
          <a href="/" target="_blank" style={{ fontSize: '.75rem', color: '#888', textDecoration: 'none' }}>← View site</a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: 960 }}>
        {children}
      </main>
    </div>
  );
}
