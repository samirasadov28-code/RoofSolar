import Link from 'next/link';
import { APP_VERSION } from '@/lib/version';

function SolarHouseIllustration() {
  return (
    <svg viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="panelSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect width="520" height="400" fill="url(#sky)" rx="20" />

      {/* Stars / sparkles */}
      {[[60,40],[140,25],[320,30],[430,50],[480,20],[200,15]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.6" />
      ))}

      {/* Sun with glow */}
      <circle cx="420" cy="75" r="55" fill="#fde68a" opacity="0.15" />
      <circle cx="420" cy="75" r="40" fill="#fde68a" opacity="0.25" />
      <circle cx="420" cy="75" r="28" fill="url(#sun)" filter="url(#glow)" />
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const r = Math.PI * angle / 180;
        return (
          <line key={i}
            x1={420 + Math.cos(r) * 34} y1={75 + Math.sin(r) * 34}
            x2={420 + Math.cos(r) * 48} y2={75 + Math.sin(r) * 48}
            stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
          />
        );
      })}

      {/* Cloud */}
      <g opacity="0.85">
        <ellipse cx="100" cy="90" rx="42" ry="18" fill="white" />
        <ellipse cx="128" cy="84" rx="28" ry="20" fill="white" />
        <ellipse cx="72" cy="88" rx="22" ry="15" fill="white" />
      </g>
      <g opacity="0.6">
        <ellipse cx="310" cy="60" rx="30" ry="13" fill="white" />
        <ellipse cx="333" cy="55" rx="20" ry="15" fill="white" />
        <ellipse cx="288" cy="58" rx="16" ry="11" fill="white" />
      </g>

      {/* Ground */}
      <rect y="310" width="520" height="90" fill="url(#ground)" rx="0" />
      <rect y="308" width="520" height="8" fill="#22c55e" />

      {/* House shadow */}
      <ellipse cx="260" cy="318" rx="160" ry="12" fill="#15803d" opacity="0.4" />

      {/* House walls */}
      <rect x="110" y="220" width="300" height="110" fill="url(#wall)" />
      {/* Wall side accent */}
      <rect x="390" y="225" width="20" height="105" fill="#cbd5e1" />

      {/* Chimney */}
      <rect x="330" y="130" width="28" height="75" fill="#64748b" />
      <rect x="326" y="126" width="36" height="10" fill="#475569" rx="2" />
      {/* Smoke */}
      <ellipse cx="344" cy="112" rx="8" ry="5" fill="#94a3b8" opacity="0.5" />
      <ellipse cx="347" cy="100" rx="6" ry="4" fill="#94a3b8" opacity="0.3" />

      {/* Roof */}
      <polygon points="90,222 260,95 430,222" fill="#1e293b" />
      {/* Roof edge */}
      <polygon points="88,222 260,93 432,222 430,222 260,97 90,222" fill="#0f172a" />

      {/* ── Solar panels on roof ── */}
      {/* Each panel: 44px wide, 26px tall, with grid lines */}
      {[
        // row 1 (top) — 2 panels
        { x: 218, y: 130 }, { x: 266, y: 130 },
        // row 2 — 3 panels
        { x: 191, y: 159 }, { x: 239, y: 159 }, { x: 287, y: 159 },
        // row 3 — 4 panels
        { x: 162, y: 188 }, { x: 210, y: 188 }, { x: 258, y: 188 }, { x: 306, y: 188 },
      ].map((p, i) => (
        <g key={i}>
          {/* Panel base */}
          <rect x={p.x} y={p.y} width="44" height="26" fill="url(#panel)" rx="1.5" />
          {/* Cell grid — 4 columns, 2 rows */}
          <line x1={p.x+11} y1={p.y} x2={p.x+11} y2={p.y+26} stroke="#3b82f6" strokeWidth="0.6" opacity="0.6" />
          <line x1={p.x+22} y1={p.y} x2={p.x+22} y2={p.y+26} stroke="#3b82f6" strokeWidth="0.6" opacity="0.6" />
          <line x1={p.x+33} y1={p.y} x2={p.x+33} y2={p.y+26} stroke="#3b82f6" strokeWidth="0.6" opacity="0.6" />
          <line x1={p.x} y1={p.y+13} x2={p.x+44} y2={p.y+13} stroke="#3b82f6" strokeWidth="0.6" opacity="0.6" />
          {/* Panel border */}
          <rect x={p.x} y={p.y} width="44" height="26" fill="none" stroke="#60a5fa" strokeWidth="0.8" rx="1.5" opacity="0.7" />
          {/* Sheen */}
          <rect x={p.x} y={p.y} width="44" height="26" fill="url(#panelSheen)" rx="1.5" />
        </g>
      ))}

      {/* Energy arrows from panels */}
      <g opacity="0.7">
        <path d="M 260 215 L 260 240" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arrow)" />
      </g>

      {/* Windows */}
      <rect x="135" y="242" width="55" height="55" fill="#bfdbfe" rx="4" />
      <rect x="330" y="242" width="55" height="55" fill="#bfdbfe" rx="4" />
      {/* Window panes */}
      <line x1="162" y1="242" x2="162" y2="297" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="135" y1="270" x2="190" y2="270" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="357" y1="242" x2="357" y2="297" stroke="#93c5fd" strokeWidth="1.5" />
      <line x1="330" y1="270" x2="385" y2="270" stroke="#93c5fd" strokeWidth="1.5" />
      {/* Window glow */}
      <rect x="135" y="242" width="55" height="55" fill="#fde68a" opacity="0.12" rx="4" />
      <rect x="330" y="242" width="55" height="55" fill="#fde68a" opacity="0.12" rx="4" />

      {/* Door */}
      <rect x="222" y="262" width="56" height="68" fill="#b45309" rx="4" />
      <rect x="225" y="265" width="50" height="62" fill="#d97706" rx="3" />
      {/* Door handle */}
      <circle cx="267" cy="298" r="3.5" fill="#92400e" />
      {/* Door arch */}
      <path d="M 225 265 Q 250 250 275 265" fill="#f59e0b" opacity="0.5" />

      {/* Path to door */}
      <rect x="237" y="316" width="26" height="20" fill="#e2e8f0" opacity="0.7" rx="2" />

      {/* Small tree left */}
      <rect x="68" y="272" width="8" height="40" fill="#78350f" />
      <circle cx="72" cy="260" r="22" fill="#16a34a" />
      <circle cx="58" cy="270" r="15" fill="#15803d" />
      <circle cx="86" cy="268" r="16" fill="#15803d" />

      {/* Small tree right */}
      <rect x="446" y="278" width="8" height="34" fill="#78350f" />
      <circle cx="450" cy="267" r="18" fill="#16a34a" />
      <circle cx="437" cy="274" r="13" fill="#15803d" />
      <circle cx="463" cy="272" r="13" fill="#15803d" />

      {/* Energy bolt badge */}
      <circle cx="440" cy="175" r="22" fill="#fbbf24" opacity="0.95" />
      <text x="440" y="182" textAnchor="middle" fontSize="22" fill="#1e3a8a" fontWeight="bold">⚡</text>

      {/* CO2 leaf badge */}
      <circle cx="80" cy="175" r="22" fill="#4ade80" opacity="0.95" />
      <text x="80" y="182" textAnchor="middle" fontSize="18" fill="#14532d">🌿</text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img src="/logo-192.png" alt="RoofSolar" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-yellow-400/50" />
          <span className="font-bold text-xl text-white">RoofSolar</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/installers" className="text-sm text-slate-400 hover:text-white transition-colors">
            For Installers
          </Link>
          <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/calculator"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Get my analysis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-sm text-yellow-300 font-medium mb-6">
              ☀️ Financial-grade solar analysis — free in 3 minutes
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Turn your roof into a
              <span className="text-yellow-400"> power station.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
              Enter your address and get a 10-year cashflow model, payback analysis,
              export tariff earnings, battery economics, and EV savings — tailored to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/calculator"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-yellow-400/20"
              >
                Start my free analysis
              </Link>
              <a
                href="#how-it-works"
                className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                How it works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
              {[
                { icon: '🔒', text: 'No account required' },
                { icon: '⚡', text: 'Live PVGIS data' },
                { icon: '🇮🇪', text: 'Ireland & UK grants' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2 text-sm text-slate-400">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — illustration */}
          <div className="flex-1 w-full">
            <SolarHouseIllustration />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '3 min', label: 'Average analysis time' },
            { value: '10yr', label: 'Cashflow projection' },
            { value: '€3.99', label: 'Full pro report' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-3xl font-extrabold text-yellow-400">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solar panel visual divider */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-8 md:grid-cols-16 gap-1.5 opacity-20">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-blue-700 rounded border border-blue-500/40 relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px p-px">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="bg-blue-800 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-4">How RoofSolar works</h2>
        <p className="text-center text-slate-400 mb-14">Four steps to your financial-grade solar report</p>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', icon: '📍', title: 'Your address', desc: 'We fetch live solar irradiance data for your exact location from PVGIS.' },
            { step: '2', icon: '🏠', title: 'Roof details', desc: 'Orientation, pitch and shading loss — we calculate optimal panel placement.' },
            { step: '3', icon: '💶', title: 'Your numbers', desc: 'Irish tariffs, SEAI grants, consumption and financing — all pre-filled.' },
            { step: '4', icon: '📊', title: 'Your report', desc: '10-year cashflow, IRR, payback period, battery and EV economics.' },
          ].map((item) => (
            <div key={item.step} className="text-center group">
              <div className="w-14 h-14 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:bg-yellow-400/20 transition-colors">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-yellow-400 mb-1">STEP {item.step}</div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-yellow-400 rounded-3xl p-12 text-center relative overflow-hidden">
          {/* Background panel pattern */}
          <div className="absolute inset-0 grid grid-cols-12 gap-2 p-4 opacity-10 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-900 rounded border border-gray-700" />
            ))}
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to see your solar potential?</h2>
            <p className="text-gray-800 mb-8 max-w-xl mx-auto">
              Free analysis in 3 minutes. Upgrade to Pro for €3.99 to download your full PDF report and get installer quotes.
            </p>
            <Link
              href="/calculator"
              className="inline-block bg-gray-900 hover:bg-gray-800 text-yellow-400 font-bold px-10 py-4 rounded-xl text-lg transition-colors"
            >
              Start free analysis
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 RoofSolar. All rights reserved. · v{APP_VERSION}</p>
          <div className="flex gap-6">
            <Link href="/installers" className="hover:text-slate-300 transition-colors">For Installers</Link>
            <a href="mailto:contact@roofsolar.netlify.app" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
