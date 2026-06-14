// src/components/admin/ThemeManager.tsx
// Theme/colour picker UI — reads initial values from props (passed from Astro server side)
// Does NOT import Supabase directly — saves via a simple fetch to an API endpoint
'use client';

import { useState } from 'react';

interface ThemeContent {
  primary_bg?:   string;
  secondary_bg?: string;
  accent?:       string;
  text_primary?: string;
  text_muted?:   string;
  card_bg?:      string;
  [key: string]: string | undefined;
}

interface Props {
  initial?: ThemeContent;
}

const DEFAULTS: ThemeContent = {
  primary_bg:   '#0A0A0A',
  secondary_bg: '#F7F5F2',
  accent:       '#FF3B00',
  text_primary: '#F5F5F0',
  text_muted:   '#888888',
  card_bg:      '#141414',
};

export default function ThemeManager({ initial = {} }: Props) {
  const [theme, setTheme] = useState<ThemeContent>({ ...DEFAULTS, ...initial });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  const set = (k: string, v: string) => setTheme(t => ({ ...t, [k]: v }));

  const save = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'settings', section: 'theme', content: theme }),
      });
      if (res.ok) setSaved(true);
      else setError('Save failed — check API route');
    } catch (e) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof ThemeContent; label: string }[] = [
    { key: 'primary_bg',   label: 'Primary BG (dark sections)' },
    { key: 'secondary_bg', label: 'Secondary BG (light sections)' },
    { key: 'accent',       label: 'Accent / Brand colour' },
    { key: 'text_primary', label: 'Primary text (on dark)' },
    { key: 'text_muted',   label: 'Muted text / subheadings' },
    { key: 'card_bg',      label: 'Card background (dark)' },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 16, padding: '1.75rem' }}>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '.9375rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <span style={{ width: 3, height: '1rem', background: '#FF3B00', borderRadius: 2, display: 'inline-block' }}></span>
        Global Colour Theme
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {fields.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
            <label style={{ fontSize: '.7rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <input
                type="color"
                value={theme[key] ?? DEFAULTS[key] ?? '#000000'}
                onChange={e => set(key, e.target.value)}
                style={{ height: 44, width: 56, padding: '.3rem .4rem', borderRadius: 10, border: '1.5px solid #E5E0D8', cursor: 'pointer', background: '#F7F5F2' }}
              />
              <input
                type="text"
                value={theme[key] ?? ''}
                onChange={e => set(key, e.target.value)}
                style={{ flex: 1, background: '#F7F5F2', border: '1.5px solid #E5E0D8', borderRadius: 10, padding: '.625rem .875rem', fontSize: '.875rem', fontFamily: 'Inter,sans-serif', color: '#1A1A1A', outline: 'none' }}
              />
            </div>
          </div>
        ))}
      </div>

      {saved  && <div style={{ padding: '.75rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', borderRadius: 10, marginBottom: '.75rem', fontSize: '.875rem' }}>✓ Theme saved!</div>}
      {error  && <div style={{ padding: '.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 10, marginBottom: '.75rem', fontSize: '.875rem' }}>⚠ {error}</div>}

      <button
        onClick={save}
        disabled={saving}
        style={{ padding: '.875rem 2.5rem', background: saving ? '#ccc' : '#FF3B00', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '.9375rem', border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saving ? 'Saving…' : 'Save Theme →'}
      </button>
    </div>
  );
}
