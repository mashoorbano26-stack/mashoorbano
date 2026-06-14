'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Testimonial {
  id: string;
  client_name: string;
  brand_name: string;
  designation: string;
  quote: string;
  video_url: string;
  photo_url: string;
  rating: number;
  service_type: string;
  city: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_T: Omit<Testimonial, 'id'> = {
  client_name: '',
  brand_name: '',
  designation: '',
  quote: '',
  video_url: '',
  photo_url: '',
  rating: 5,
  service_type: 'websites',
  city: '',
  is_active: true,
  sort_order: 0,
};

const SERVICE_TYPES = ['websites', 'merchandise', 'content', 'meta-ads', 'google-ads', 'branding'];

export default function TestimonialManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order')
      .order('created_at');
    setItems((data ?? []) as Testimonial[]);
    setLoading(false);
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function openNew() {
    setEditing({ ...EMPTY_T });
    setIsNew(true);
  }

  function openEdit(t: Testimonial) {
    setEditing({ ...t });
    setIsNew(false);
  }

  function cancelEdit() {
    setEditing(null);
    setIsNew(false);
  }

  async function save() {
    if (!editing) return;
    if (!editing.client_name?.trim()) return showToast('error', 'Customer name is required.');
    if (!editing.quote?.trim()) return showToast('error', 'A remark / quote is required.');

    setSaving(true);
    let error;
    if (isNew) {
      const { error: e } = await supabase.from('testimonials').insert({
        client_name: editing.client_name,
        brand_name: editing.brand_name ?? '',
        designation: editing.designation ?? '',
        quote: editing.quote,
        video_url: editing.video_url ?? '',
        photo_url: editing.photo_url ?? '',
        rating: editing.rating ?? 5,
        service_type: editing.service_type ?? 'websites',
        city: editing.city ?? '',
        is_active: editing.is_active ?? true,
        sort_order: editing.sort_order ?? 0,
      });
      error = e;
    } else {
      const { error: e } = await supabase.from('testimonials').update({
        client_name: editing.client_name,
        brand_name: editing.brand_name ?? '',
        designation: editing.designation ?? '',
        quote: editing.quote,
        video_url: editing.video_url ?? '',
        photo_url: editing.photo_url ?? '',
        rating: editing.rating ?? 5,
        service_type: editing.service_type ?? 'websites',
        city: editing.city ?? '',
        is_active: editing.is_active ?? true,
        sort_order: editing.sort_order ?? 0,
      }).eq('id', editing.id as string);
      error = e;
    }
    setSaving(false);
    if (error) {
      showToast('error', 'Failed to save. Please try again.');
    } else {
      showToast('success', isNew ? 'Testimonial added!' : 'Testimonial updated!');
      cancelEdit();
      loadData();
    }
  }

  async function toggleActive(t: Testimonial) {
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    loadData();
  }

  async function deleteItem(id: string) {
    if (!window.confirm('Delete this testimonial? This cannot be undone.')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    loadData();
    showToast('success', 'Testimonial deleted.');
  }

  async function uploadVideo(file: File) {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `testimonial-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('testimonials').upload(path, file, { upsert: true });
    if (error) {
      showToast('error', 'Video upload failed.');
    } else {
      const { data: urlData } = supabase.storage.from('testimonials').getPublicUrl(path);
      setEditing((prev) => ({ ...prev, video_url: urlData.publicUrl }));
      showToast('success', 'Video uploaded!');
    }
    setUploading(false);
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `photo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('testimonials').upload(path, file, { upsert: true });
    if (error) {
      showToast('error', 'Photo upload failed.');
    } else {
      const { data: urlData } = supabase.storage.from('testimonials').getPublicUrl(path);
      setEditing((prev) => ({ ...prev, photo_url: urlData.publicUrl }));
      showToast('success', 'Photo uploaded!');
    }
    setUploading(false);
  }

  const accent = '#FF3B00';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-heading text-white">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1">Manage video testimonial cards shown in the carousel on the homepage.</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 rounded-xl font-heading font-bold text-sm text-white flex items-center gap-2"
          style={{ background: accent }}
        >
          <span>+</span> Add Testimonial
        </button>
      </div>

      {/* Carousel speed note */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 text-sm text-gray-400">
        <strong className="text-white">Carousel:</strong> Cards scroll right-to-left in an infinite loop. Hover pauses the scroll.
        Video cards open a lightbox on click. You can control carousel speed from <strong className="text-white">Admin → Theme → Testimonials</strong> (coming soon) or directly in the CSS.
      </div>

      {/* Edit / Create form */}
      {editing && (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-8 space-y-6">
          <h2 className="font-heading font-bold text-lg text-white">
            {isNew ? 'Add New Testimonial' : 'Edit Testimonial'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Customer Name *</label>
              <input
                type="text"
                value={editing.client_name ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p, client_name: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                placeholder="Rahul Mehta"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Firm / Brand Name</label>
              <input
                type="text"
                value={editing.brand_name ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p, brand_name: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                placeholder="UrbanWear"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Designation</label>
              <input
                type="text"
                value={editing.designation ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p, designation: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                placeholder="Founder / CEO"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">City</label>
              <input
                type="text"
                value={editing.city ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p, city: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
                placeholder="Mumbai"
              />
            </div>
          </div>

          {/* Remark */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Remark / Quote *</label>
            <textarea
              value={editing.quote ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, quote: e.target.value }))}
              rows={3}
              className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none resize-none"
              placeholder="What did this client say about working with Mashurban?"
            />
          </div>

          {/* Video */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Video URL or Upload</label>
            <p className="text-[11px] text-gray-600">YouTube URL, Vimeo URL, or upload a direct video file from Supabase storage.</p>
            <input
              type="url"
              value={editing.video_url ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, video_url: e.target.value }))}
              className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
              placeholder="https://youtube.com/watch?v=... or Supabase URL"
            />
            <div className="flex items-center gap-3 mt-1">
              <label className="cursor-pointer px-4 py-2 text-xs font-heading font-bold text-white rounded-xl border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors flex items-center gap-2">
                {uploading ? (
                  <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                ) : (
                  <>📹 Upload Video File</>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(f); }}
                />
              </label>
              {editing.video_url && (
                <span className="text-[11px] text-green-400 truncate max-w-xs">✓ Video set</span>
              )}
            </div>
          </div>

          {/* Photo */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Client Photo (optional)</label>
            <input
              type="url"
              value={editing.photo_url ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, photo_url: e.target.value }))}
              className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
              placeholder="https://... or leave blank"
            />
            <label className="cursor-pointer px-4 py-2 text-xs font-heading font-bold text-white rounded-xl border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors inline-flex items-center gap-2 w-fit">
              📷 Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
              />
            </label>
          </div>

          {/* Rating + service + meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</label>
              <select
                value={editing.rating ?? 5}
                onChange={(e) => setEditing((p) => ({ ...p, rating: parseInt(e.target.value) }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
              >
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Service Type</label>
              <select
                value={editing.service_type ?? 'websites'}
                onChange={(e) => setEditing((p) => ({ ...p, service_type: e.target.value }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
              >
                {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing((p) => ({ ...p, sort_order: parseInt(e.target.value) }))}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#FF3B00] focus:outline-none"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing((p) => ({ ...p, is_active: !p?.is_active }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${editing.is_active ? 'bg-green-500' : 'bg-[#2A2A2A]'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editing.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-gray-400">{editing.is_active ? 'Visible on site' : 'Hidden from site'}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving || uploading}
              className="px-6 py-3 rounded-xl font-heading font-bold text-sm text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: accent }}
            >
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : 'Save Testimonial'}
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 py-3 rounded-xl font-heading font-bold text-sm text-gray-400 border border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF3B00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          No testimonials yet. Click "Add Testimonial" to create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 hover:border-[#3A3A3A] transition-colors"
            >
              {/* Preview thumb */}
              <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#0A0A0A] flex items-center justify-center">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.client_name} className="w-full h-full object-cover" />
                ) : t.video_url ? (
                  <span className="text-2xl">🎬</span>
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-bold text-sm text-white">{t.client_name}</p>
                  {t.brand_name && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}22`, color: accent }}>{t.brand_name}</span>}
                  {t.city && <span className="text-xs text-gray-500">· {t.city}</span>}
                  {t.video_url && <span className="text-xs text-blue-400">📹 Video</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{t.quote}</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-xs ${i < t.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${t.is_active ? 'bg-green-900 text-green-400' : 'bg-[#2A2A2A] text-gray-500'}`}
                >
                  {t.is_active ? 'Live' : 'Hidden'}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(t.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold text-red-400 hover:bg-red-950 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
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
