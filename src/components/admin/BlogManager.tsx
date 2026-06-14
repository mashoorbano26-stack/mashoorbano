// src/components/admin/BlogManager.tsx
// Safe client component — no server-only imports
'use client';
import { useState } from 'react';

export default function BlogManager() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', color: '#888' }}>
      <p style={{ fontSize: '.875rem' }}>BlogManager — managed via the dedicated admin page.</p>
    </div>
  );
}
