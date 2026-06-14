'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface ThemeContent {
  accent: string;
  hero_bg: string;
  hero_text: string;
  hero_accent: string;
  services_bg: string;
  services_card_bg: string;
  services_card_border: string;
  services_heading: string;
  services_text: string;
  story_bg: string;
  story_card_bg: string;
  story_heading: string;
  story_text: string;
  packages_bg: string;
  packages_card_bg: string;
  packages_card_border: string;
  packages_heading: string;
  packages_text: string;
  pkg_hover_1: string;
  pkg_hover_2: string;
  pkg_hover_3: string;
  pkg_hover_4: string;
  pkg_hover_5: string;
  pkg_hover_6: string;
  testimonials_bg: string;
  testimonials_card_bg: string;
  testimonials_card_border: string;
  testimonials_heading: string;
  testimonials_text: string;
}

const DEFAULT_THEME: ThemeContent = {
  accent: '#FF3B00',
  hero_bg: '#0A0A0A',
  hero_text: '#F5F5F0',
  hero_accent: '#FF3B00',
  services_bg: '#0A0A0A',
  services_card_bg: '#141414',
  services_card_border: '#2A2A2A',
  services_heading: '#F5F5F0',
  services_text: '#AAAAAA',
  story_bg: '#111111',
  story_card_bg: '#1A1A1A',
  story_heading: '#F5F5F0',
  story_text: '#AAAAAA',
  packages_bg: '#0A0A0A',
  packages_card_bg: '#141414',
  packages_card_border: '#2A2A2A',
  packages_heading: '#F5F5F0',
  packages_text: '#AAAAAA',
  pkg_hover_1: '#FF3B00',
  pkg_hover_2: '#7C3AED',
  pkg_hover_3: '#059669',
  pkg_hover_4: '#0EA5E9',
  pkg_hover_5: '#D97706',
  pkg_hover_6: '#EC4899',
  testimonials_bg: '#0D0D0D',
  testimonials_card_bg: '#161616',
  testimonials_card_border: '#2A2A2A',
  testimonials_heading: '#F5F5F0',
  testimonials_text: '#AAAAAA',
};

type TabKey = 'global' | 'hero' | 'services' | 'story' | 'packages' | 'testimonials';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'global', label: 'Global Accent' },
  { key: 'hero', label: 'Hero' },
  { key: 'services', label: 'Services' },
  { key: 'story', label: 'Our Story' },
  { key: 'packages', label: 'Packages' },
  { key: 'testimonials', label: 'Testimonials' },
];

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

function ColorField({ label, value, onChange, hint }: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[11px] text-gray-600">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-[#2A2A2A] cursor-pointer bg-transparent"
          style={{ padding: '2px' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#FF3B00] focus:outline-none transition-colors"
          placeholder="#000000"
          maxLength={7}
        />
        <div
          className="w-10 h-10 rounded-xl border border-[#2A2A2A] flex-shrink-0"
          style={{ background: value }}
        />
      </div>
    </div>
  );
}

export default function ThemeManager() {
  const [theme, setTheme] = useState<ThemeContent>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('global');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('page', 'settings')
        .eq('section', 'theme')
        .single();
      if (data?.content) setTheme({ ...DEFAULT_THEME, ...(data.content as Partial<ThemeContent>) });
      setLoading(false);
    }
    load();
  }, []);

  function update(key: keyof ThemeContent, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from('site_content')
      .upsert({ page: 'settings', section: 'theme', content: theme as unknown as Record<string, unknown> }, { onConflict: 'page,section' });
    setSaving(false);
    if (error) {
      setToast({ type: 'error', msg: 'Failed to save. Please try again.' });
    } else {
      setToast({ type: 'success', msg: 'Theme saved! Changes will appear on next page load.' });
    }
    setTimeout(() => setToast(null), 4000);
  }

  function resetSection() {
    if (!window.confirm('Reset this section to default colors?')) return;
    setTheme((prev) => ({ ...prev, ...DEFAULT_THEME }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF3B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-heading text-white">Theme & Colors</h1>
        <p className="text-sm text-gray-500 mt-1">Control background, card, and text colors for every public section.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-heading font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[#FF3B00] text-white'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-8 space-y-6">

        {activeTab === 'global' && (
          <>
            <h2 className="font-heading font-bold text-lg text-white mb-6">Global Accent Color</h2>
            <ColorField
              label="Brand Accent"
              value={theme.accent}
              onChange={(v) => update('accent', v)}
              hint="Used for buttons, highlights, active states — applied across all sections."
            />
            {/* Live preview */}
            <div className="mt-6 p-5 rounded-2xl" style={{ background: '#0A0A0A', border: '1px solid #2A2A2A' }}>
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Preview</p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: theme.accent }}>Primary Button</span>
                <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ color: theme.accent, border: `1px solid ${theme.accent}44` }}>Badge</span>
                <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ color: theme.accent }}>Link color</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'hero' && (
          <>
            <h2 className="font-heading font-bold text-lg text-white mb-6">Hero Section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorField label="Background" value={theme.hero_bg} onChange={(v) => update('hero_bg', v)} />
              <ColorField label="Text / Heading Color" value={theme.hero_text} onChange={(v) => update('hero_text', v)} />
              <ColorField label="Accent (CTAs, highlights)" value={theme.hero_accent} onChange={(v) => update('hero_accent', v)} />
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <h2 className="font-heading font-bold text-lg text-white mb-6">Services Section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorField label="Section Background" value={theme.services_bg} onChange={(v) => update('services_bg', v)} />
              <ColorField label="Card Background" value={theme.services_card_bg} onChange={(v) => update('services_card_bg', v)} />
              <ColorField label="Card Border" value={theme.services_card_border} onChange={(v) => update('services_card_border', v)} />
              <ColorField label="Heading Color" value={theme.services_heading} onChange={(v) => update('services_heading', v)} />
              <ColorField label="Body Text Color" value={theme.services_text} onChange={(v) => update('services_text', v)} />
            </div>
          </>
        )}

        {activeTab === 'story' && (
          <>
            <h2 className="font-heading font-bold text-lg text-white mb-6">Our Story Section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorField label="Section Background" value={theme.story_bg} onChange={(v) => update('story_bg', v)} />
              <ColorField label="Card / Quote Background" value={theme.story_card_bg} onChange={(v) => update('story_card_bg', v)} />
              <ColorField label="Heading Color" value={theme.story_heading} onChange={(v) => update('story_heading', v)} />
              <ColorField label="Body Text Color" value={theme.story_text} onChange={(v) => update('story_text', v)} />
            </div>
          </>
        )}

        {activeTab === 'packages' && (
          <>
            <h2 className="font-heading font-bold text-lg text-white mb-2">Packages Section</h2>
            <p className="text-xs text-gray-500 mb-6">Hover colors are applied per-card when user mouses over each package card.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <ColorField label="Section Background" value={theme.packages_bg} onChange={(v) => update('packages_bg', v)} />
              <ColorField label="Card Background" value={theme.packages_card_bg} onChange={(v) => update('packages_card_bg', v)} />
              <ColorField label="Card Border" value={theme.packages_card_border} onChange={(v) => update('packages_card_border', v)} />
              <ColorField label="Heading Color" value={theme.packages_heading} onChange={(v) => update('packages_heading', v)} />
              <ColorField label="Body Text Color" value={theme.packages_text} onChange={(v) => update('packages_text', v)} />
            </div>
            <div className="border-t border-[#2A2A2A] pt-6">
              <h3 className="font-heading font-bold text-sm text-white mb-4">Per-Card Hover Colors (slot 1–6)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(['pkg_hover_1','pkg_hover_2','pkg_hover_3','pkg_hover_4','pkg_hover_5','pkg_hover_6'] as const).map((k, i) => (
                  <ColorField key={k} label={`Card ${i + 1} Hover`} value={theme[k]} onChange={(v) => update(k, v)} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'testimonials' && (
          <>
            <h2 className="font-heading font-bold text-lg text-white mb-6">Testimonials Section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorField label="Section Background" value={theme.testimonials_bg} onChange={(v) => update('testimonials_bg', v)} />
              <ColorField label="Card Background" value={theme.testimonials_card_bg} onChange={(v) => update('testimonials_card_bg', v)} />
              <ColorField label="Card Border" value={theme.testimonials_card_border} onChange={(v) => update('testimonials_card_border', v)} />
              <ColorField label="Heading Color" value={theme.testimonials_heading} onChange={(v) => update('testimonials_heading', v)} />
              <ColorField label="Body Text Color" value={theme.testimonials_text} onChange={(v) => update('testimonials_text', v)} />
            </div>
          </>
        )}
      </div>

      {/* Save row */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={resetSection}
          className="px-5 py-3 rounded-2xl text-sm font-heading font-bold text-gray-400 border border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="px-8 py-3 rounded-2xl text-sm font-heading font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          style={{ background: '#FF3B00' }}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : 'Save Theme'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-heading font-bold text-sm text-white transition-all ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
