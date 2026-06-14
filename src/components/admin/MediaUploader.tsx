// src/components/admin/MediaUploader.tsx
// Safe client component — no server-only imports
'use client';
import { useState } from 'react';

export default function MediaUploader() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', color: '#888' }}>
      <p style={{ fontSize: '.875rem' }}>MediaUploader — managed via the dedicated admin page.</p>
    </div>
  );
}
