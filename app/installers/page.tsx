'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function InstallersPage() {
  const t = useT();
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    coverage_regions: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/installers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          coverage_regions: form.coverage_regions.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit');
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message || t.common.errorGeneric);
    }
    setLoading(false);
  }

  const benefits = [
    { title: t.installers.benefit1Title, desc: t.installers.benefit1Desc },
    { title: t.installers.benefit2Title, desc: t.installers.benefit2Desc },
    { title: t.installers.benefit3Title, desc: t.installers.benefit3Desc },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-192.png" alt="RoofSolar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold">RoofSolar</span>
          </Link>
          <Link href="/calculator" className="text-sm text-gray-600 hover:text-gray-900">{t.installers.forHomeowners}</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-sm text-yellow-800 font-medium mb-6">
            {t.installers.networkBadge}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {t.installers.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            {t.installers.heroSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.installers.successTitle}</h2>
            <p className="text-gray-500">{t.installers.successDesc}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.installers.joinWaitlistTitle}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.installers.companyName}</label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.installers.contactName}</label>
                  <input
                    type="text"
                    required
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.installers.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.installers.phoneLabel}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.installers.coverageRegions}</label>
                <input
                  type="text"
                  value={form.coverage_regions}
                  onChange={(e) => setForm({ ...form, coverage_regions: e.target.value })}
                  placeholder="Dublin, Cork, Galway"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.installers.notesLabel}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-xl transition-colors"
              >
                {loading ? t.installers.submitting : t.installers.submitBtn}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
