'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n';

export function FeedbackWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!rating) return;
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message, page: window.location.pathname }),
      });
      setSent(true);
    } catch {}
    setLoading(false);
  }

  function reset() {
    setOpen(false);
    setTimeout(() => { setSent(false); setRating(null); setMessage(''); }, 300);
  }

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40">
      {open && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] sm:w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-5">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🙏</p>
              <p className="font-semibold text-gray-900">{t.feedback.thankYou}</p>
              <button onClick={reset} className="mt-3 text-sm text-yellow-600 hover:underline">{t.feedback.close}</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900 text-sm">{t.feedback.title}</p>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              </div>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`flex-1 py-2 rounded-lg text-lg transition-colors ${rating === n ? 'bg-yellow-400' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {['😞', '😕', '😐', '😊', '😍'][n - 1]}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder={t.feedback.placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
              />
              <button
                onClick={submit}
                disabled={!rating || loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {loading ? t.feedback.sending : t.feedback.sendBtn}
              </button>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border border-gray-200 shadow-lg text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-colors hover:shadow-xl"
      >
        <span>💬</span> {t.feedback.btnLabel}
      </button>
    </div>
  );
}
