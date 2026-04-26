import Link from 'next/link';
import { APP_VERSION } from '@/lib/version';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
            RS
          </div>
          <span className="font-bold text-xl text-gray-900">RoofSolar</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/installers" className="text-sm text-gray-600 hover:text-gray-900">
            For Installers
          </Link>
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/calculator"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Get my analysis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-sm text-yellow-800 font-medium mb-6">
          Financial-grade solar analysis — free in 3 minutes
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Is solar right for your home?
          <span className="text-yellow-400"> Find out now.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Enter your address and roof details. Get a 10-year cashflow model, payback analysis,
          export tariff earnings, battery economics, and EV charging savings — tailored to your home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/calculator"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-yellow-200"
          >
            Start my free analysis
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            How it works
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { value: '3 min', label: 'Average analysis time' },
            { value: '10yr', label: 'Cashflow projection' },
            { value: '£3.99', label: 'Full pro report' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How RoofSolar works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Your address', desc: 'We fetch live solar irradiance data for your exact location.' },
            { step: '2', title: 'Roof details', desc: 'Orientation, pitch and shading — automatically corrected.' },
            { step: '3', title: 'Your numbers', desc: 'Consumption, tariffs, grants, financing — all configurable.' },
            { step: '4', title: 'Your report', desc: '10-year cashflow, IRR, payback period, EV and battery economics.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to see your solar potential?</h2>
          <p className="text-gray-400 mb-8">
            Free analysis in 3 minutes. Upgrade to Pro for £3.99 to download your full report and get installer quotes.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Start free analysis
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 RoofSolar. All rights reserved. · v{APP_VERSION}</p>
          <div className="flex gap-6">
            <Link href="/installers" className="hover:text-gray-400">For Installers</Link>
            <a href="mailto:contact@roofsolar.netlify.app" className="hover:text-gray-400">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
