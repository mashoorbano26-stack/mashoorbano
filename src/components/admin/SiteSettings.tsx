// src/components/admin/SiteSettings.tsx
// Safe client component — no server-only imports
'use client';
import { useState } from 'react';

export default function SiteSettings() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', color: '#888' }}>
      <p style={{ fontSize: '.875rem' }}>SiteSettings — managed via the dedicated admin page.</p>
    </div>
  );
}
