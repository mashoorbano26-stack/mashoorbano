'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  slug: string;
  thumbnail_url: string;
  is_active: boolean;
  sort_order: number;
}

interface ServicesContent {
  section_label: string;
  headline: string;
  subheadline: string;
  services: ServiceItem[];
}

const SLUG_OPTIONS = ['websites', 'merchandise', 'content-creation', 'meta-ads', 'google-ads'];

const DEFAULT_CONTENT: ServicesContent = {
  section_label: 'What we do',
  headline: 'Services built\nfor real growth.',
  subheadline: 'Every service is a weapon. Pick yours.',
  services: [],
};

export default function PageEditor() {
  const [content, setContent] = useState<ServicesContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('page', 'home')
      .eq('section', 'services')
      .single();
    if (data?.content) setContent({ ...DEFAULT_CONTENT, ...(data.content as Partial<ServicesContent>) });
    setLoading(false);
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from('site_content')
      .upsert({ page: 'home', section: 'services', content: content as unknown as Record<string, unknown> }, { onConflict: 'page,section' });
    setSaving(false);
    if (error) showToast('error', 'Failed to save.');
    else showToast('success', 'Services saved!');
  }

  function updateField(key: keyof ServicesContent, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function updateService(id: string, key: keyof ServiceItem, value: string | boolean | number) {
    setContent((prev) => ({
      ...prev,
      services: prev.services.map((s) => s.id === id ? { ...s, [key]: value } : s),
    }));
  }

  function addService() {
    const newSvc: ServiceItem = {
      id: `svc-${Date.now()}`,
      title: 'New Service',
      tagline: '',
      description: '',
      slug: 'websites',
      thumbnail_url: '',
      is_active: true,
      sort_order: content.services.length + 1,
    };
    setContent((prev) => ({ ...prev, services: [...prev.services, newSvc] }));
  }

  function removeService(id: string) {
    if (!window.confirm('Remove this service?')) return;
    setContent((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== id) }));
  }

  async function uploadThumbnail(serviceId: string, file: File) {
    setUploadingId(serviceId);
    const ext = file.name.split('.').pop();
    const path = `service-${serviceId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true });
    if (error) {
      showToast('error', 'Upload failed.');
    } else {
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      updateService(serviceId, 'thumbnail_url', data.publicUrl);
      showToast('success', 'Thumbnail uploaded!');
    }
    setUploadingId(null);
  }

  const accent = '#FF3B00';

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#FF3B00] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black font-heading text-white">Services Section</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the heading, subheading, and all service image cards shown on the homepage.</p>
      </div>

      {/* Section headings */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-8 space-y-5">
        <h2 className="font-heading font-bold text-lg text-white">Section Headings</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Section Label (pill badge)</label>
          <input
            type="text"
            value={content.section_label}
            onChange={(e) => updateField('section_label', e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
            placeholder="What we do"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Headline <span className="normal-case text-gray-600 ml-1">(use \n for a line break — 2nd line will be in accent color)</span>
          </label>
          <textarea
            value={content.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            rows={2}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none resize-none font-mono"
            placeholder={"Services built\nfor real growth."}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Subheadline</label>
          <input
            type="text"
            value={content.subheadline}
            onChange={(e) => updateField('subheadline', e.target.value)}
            className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
          />
        </div>
      </div>

      {/* Service cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-white">Service Cards</h2>
          <button
            onClick={addService}
            className="px-4 py-2 rounded-xl font-heading font-bold text-sm text-white flex items-center gap-2"
            style={{ background: accent }}
          >
            + Add Service
          </button>
        </div>

        {content.services.length === 0 && (
          <div className="text-center py-10 text-gray-600 bg-[#141414] rounded-3xl border border-[#2A2A2A]">
            No services yet. Click "Add Service" to start.
          </div>
        )}

        {content.services.map((svc, index) => (
          <div
            key={svc.id}
            className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-gray-400">Card #{index + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateService(svc.id, 'is_active', !svc.is_active)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${svc.is_active ? 'bg-green-900 text-green-400' : 'bg-[#2A2A2A] text-gray-500'}`}
                >
                  {svc.is_active ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => removeService(svc.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold text-red-400 hover:bg-red-950 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={svc.title}
                  onChange={(e) => updateService(svc.id, 'title', e.target.value)}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                  placeholder="Website Design & Dev"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tagline (pill badge)</label>
                <input
                  type="text"
                  value={svc.tagline}
                  onChange={(e) => updateService(svc.id, 'tagline', e.target.value)}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                  placeholder="From 0 to online in days"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
              <textarea
                value={svc.description}
                onChange={(e) => updateService(svc.id, 'description', e.target.value)}
                rows={2}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none resize-none"
              />
            </div>

            {/* Thumbnail */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Thumbnail Image</label>
              <div className="flex items-start gap-4">
                {svc.thumbnail_url && (
                  <img src={svc.thumbnail_url} alt="thumbnail" className="w-24 h-16 object-cover rounded-xl" />
                )}
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    type="url"
                    value={svc.thumbnail_url}
                    onChange={(e) => updateService(svc.id, 'thumbnail_url', e.target.value)}
                    className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                    placeholder="https://... or upload below"
                  />
                  <label className="cursor-pointer px-4 py-2 text-xs font-heading font-bold text-white rounded-xl border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors inline-flex items-center gap-2 w-fit">
                    {uploadingId === svc.id ? (
                      <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                    ) : (
                      <>📸 Upload Thumbnail</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadThumbnail(svc.id, f); }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Links to page</label>
                <select
                  value={svc.slug}
                  onChange={(e) => updateService(svc.id, 'slug', e.target.value)}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                >
                  {SLUG_OPTIONS.map((s) => <option key={s} value={s}>/services/{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sort Order</label>
                <input
                  type="number"
                  value={svc.sort_order}
                  onChange={(e) => updateService(svc.id, 'sort_order', parseInt(e.target.value))}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-8 py-3 rounded-2xl font-heading font-bold text-sm text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: accent }}
        >
          {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : 'Save Services'}
        </button>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-heading font-bold text-sm text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
