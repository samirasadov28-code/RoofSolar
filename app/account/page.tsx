'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { isEarlyAccess } from '@/lib/earlyAccess';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      setUser(session.user);

      const { data } = await supabase
        .from('calculations')
        .select('id, created_at, address, system_kwp, results')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setCalculations(data ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-192.png" alt="RoofSolar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold">RoofSolar</span>
          </Link>
          <button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My account</h1>
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {isEarlyAccess(user?.email) && (
            <span className="inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold rounded-full px-2.5 py-0.5">
              ✨ Early access — Pro unlocked
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved analyses</h2>

        {calculations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-4">No saved analyses yet.</p>
            <Link href="/calculator" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Start my first analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {calculations.map((calc) => (
              <Link
                key={calc.id}
                href={`/results/${calc.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{calc.address || 'Unknown address'}</p>
                    <p className="text-sm text-gray-500">
                      {calc.system_kwp?.toFixed(1)} kWp · {new Date(calc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
