// src/components/admin/Dashboard.tsx
// Safe client component — no server-only imports
'use client';
import { useState } from 'react';

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', color: '#888' }}>
      <p style={{ fontSize: '.875rem' }}>Dashboard — managed via the dedicated admin page.</p>
    </div>
  );
}
