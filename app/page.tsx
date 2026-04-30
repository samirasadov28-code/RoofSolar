import Link from 'next/link';
import { APP_VERSION } from '@/lib/version';
import { ForceUpdateButton } from '@/components/ForceUpdateButton';

function EnergyChainIllustration() {
  return (
    <svg viewBox="0 0 600 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-2xl mx-auto drop-shadow-2xl">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="55%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#dbeafe" />
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
        <linearGradient id="inverter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="battery" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="batteryFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="car" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky background */}
      <rect width="600" height="380" fill="url(#sky)" rx="20" />

      {/* Soft cloud */}
      <g opacity="0.7">
        <ellipse cx="430" cy="55" rx="34" ry="11" fill="white" />
        <ellipse cx="450" cy="48" rx="22" ry="14" fill="white" />
        <ellipse cx="408" cy="52" rx="18" ry="10" fill="white" />
      </g>
      <g opacity="0.55">
        <ellipse cx="220" cy="35" rx="26" ry="8" fill="white" />
        <ellipse cx="236" cy="30" rx="16" ry="11" fill="white" />
      </g>

      {/* Sun */}
      <circle cx="80" cy="60" r="44" fill="#fde68a" opacity="0.45" />
      <circle cx="80" cy="60" r="32" fill="#fcd34d" opacity="0.6" />
      <circle cx="80" cy="60" r="22" fill="url(#sun)" filter="url(#glow)" />
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const r = Math.PI * angle / 180;
        return (
          <line key={i}
            x1={80 + Math.cos(r) * 28} y1={60 + Math.sin(r) * 28}
            x2={80 + Math.cos(r) * 42} y2={60 + Math.sin(r) * 42}
            stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.85"
          />
        );
      })}

      {/* Sunlight rays onto the panels */}
      {[0, 1, 2, 3].map(i => (
        <line key={`ray-${i}`}
          x1={95 + i * 8} y1={88 + i * 2}
          x2={55 + i * 22} y2={170}
          stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="3,3" opacity="0.5"
        />
      ))}

      {/* Ground */}
      <rect y="310" width="600" height="70" fill="url(#ground)" />
      <rect y="308" width="600" height="6" fill="#22c55e" />

      {/* ── 1. Solar panel array on a stand ── */}
      <g>
        {/* Stand legs */}
        <rect x="38" y="240" width="6" height="68" fill="#475569" />
        <rect x="128" y="240" width="6" height="68" fill="#475569" />
        {/* Cross brace */}
        <line x1="44" y1="280" x2="128" y2="280" stroke="#475569" strokeWidth="3" />
        {/* Tilted panel array (parallelogram) */}
        <polygon points="20,240 140,170 162,200 42,270" fill="#0f172a" />
        {/* 6 panels in a 3x2 grid on the tilted face */}
        {[0,1,2].map(col => (
          [0,1].map(row => {
            // base: top-left of array at (28, 234) → (152, 174)
            // each panel ~36 wide along the tilt, ~30 tall
            const ax = 28 + col * 38 + row * 6;
            const ay = 234 - col * 22 + row * 14;
            return (
              <g key={`${col}-${row}`}>
                <polygon
                  points={`${ax},${ay} ${ax+34},${ay-20} ${ax+40},${ay-12} ${ax+6},${ay+8}`}
                  fill="url(#panel)"
                />
                <polygon
                  points={`${ax},${ay} ${ax+34},${ay-20} ${ax+40},${ay-12} ${ax+6},${ay+8}`}
                  fill="url(#panelSheen)"
                />
                <polygon
                  points={`${ax},${ay} ${ax+34},${ay-20} ${ax+40},${ay-12} ${ax+6},${ay+8}`}
                  fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.7"
                />
              </g>
            );
          })
        )).flat()}
        {/* Label */}
        <text x="86" y="328" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="bold" letterSpacing="0.5">SOLAR</text>
      </g>

      {/* Flow: panels → inverter */}
      <g>
        <path d="M 168 235 L 210 235" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,4" opacity="0.95" fill="none" />
        <polygon points="208,229 220,235 208,241" fill="#ea580c" />
      </g>

      {/* ── 2. Inverter ── */}
      <g>
        <rect x="225" y="195" width="68" height="88" fill="url(#inverter)" rx="5" stroke="#0f172a" strokeWidth="1" />
        {/* Display */}
        <rect x="234" y="205" width="50" height="22" fill="#0f172a" rx="2" />
        <rect x="237" y="208" width="44" height="16" fill="#16a34a" opacity="0.85" rx="1" />
        <text x="259" y="220" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">DC → AC</text>
        {/* LEDs */}
        <circle cx="240" cy="240" r="3" fill="#22c55e" />
        <circle cx="252" cy="240" r="3" fill="#fbbf24" />
        <circle cx="264" cy="240" r="3" fill="#64748b" />
        {/* Vents */}
        {[0,1,2,3,4].map(i => (
          <line key={i} x1="234" y1={252 + i*5} x2="284" y2={252 + i*5} stroke="#0f172a" strokeWidth="1" />
        ))}
        {/* Label */}
        <text x="259" y="328" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="bold" letterSpacing="0.5">INVERTER</text>
      </g>

      {/* Flow: inverter → battery */}
      <g>
        <path d="M 298 240 L 340 240" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,4" opacity="0.95" fill="none" />
        <polygon points="338,234 350,240 338,246" fill="#ea580c" />
      </g>

      {/* ── 3. Battery ── */}
      <g>
        {/* Top terminal */}
        <rect x="372" y="178" width="22" height="6" fill="#475569" rx="1" />
        {/* Body */}
        <rect x="355" y="184" width="56" height="100" fill="url(#battery)" rx="5" stroke="#475569" strokeWidth="1.5" />
        {/* Branding strip */}
        <rect x="361" y="190" width="44" height="12" fill="#1e293b" rx="1" />
        <text x="383" y="199" textAnchor="middle" fontSize="7.5" fill="#fbbf24" fontWeight="bold">10 kWh</text>
        {/* Charge bars */}
        <rect x="361" y="208" width="44" height="14" fill="url(#batteryFill)" rx="1.5" />
        <rect x="361" y="226" width="44" height="14" fill="url(#batteryFill)" rx="1.5" />
        <rect x="361" y="244" width="44" height="14" fill="url(#batteryFill)" rx="1.5" />
        <rect x="361" y="262" width="44" height="14" fill="#94a3b8" opacity="0.4" rx="1.5" />
        {/* Bolt */}
        <text x="383" y="245" textAnchor="middle" fontSize="22" fill="white" opacity="0.55">⚡</text>
        {/* Label */}
        <text x="383" y="328" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="bold" letterSpacing="0.5">BATTERY</text>
      </g>

      {/* Flow: battery → house (up) */}
      <g>
        <path d="M 415 215 Q 445 175 475 165" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,4" opacity="0.95" fill="none" />
        <polygon points="471,160 482,164 475,173" fill="#ea580c" />
      </g>

      {/* Flow: battery → car (down) */}
      <g>
        <path d="M 415 265 Q 445 290 475 295" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,4" opacity="0.95" fill="none" />
        <polygon points="471,290 482,295 472,302" fill="#ea580c" />
      </g>

      {/* ── 4. House ── */}
      <g>
        {/* Shadow */}
        <ellipse cx="528" cy="248" rx="60" ry="5" fill="#15803d" opacity="0.4" />
        {/* Walls */}
        <rect x="478" y="184" width="100" height="64" fill="url(#wall)" />
        {/* Roof */}
        <polygon points="468,186 528,138 588,186" fill="#1e293b" />
        <polygon points="466,186 528,136 590,186 588,186 528,140 468,186" fill="#0f172a" />
        {/* Windows (lit) */}
        <rect x="488" y="196" width="22" height="22" fill="#fde68a" rx="2" />
        <rect x="546" y="196" width="22" height="22" fill="#fde68a" rx="2" />
        <line x1="499" y1="196" x2="499" y2="218" stroke="#f59e0b" strokeWidth="1" />
        <line x1="488" y1="207" x2="510" y2="207" stroke="#f59e0b" strokeWidth="1" />
        <line x1="557" y1="196" x2="557" y2="218" stroke="#f59e0b" strokeWidth="1" />
        <line x1="546" y1="207" x2="568" y2="207" stroke="#f59e0b" strokeWidth="1" />
        {/* Window glow */}
        <rect x="488" y="196" width="22" height="22" fill="#fde68a" opacity="0.2" rx="2" />
        <rect x="546" y="196" width="22" height="22" fill="#fde68a" opacity="0.2" rx="2" />
        {/* Door */}
        <rect x="518" y="222" width="20" height="26" fill="#b45309" rx="2" />
        <rect x="520" y="224" width="16" height="22" fill="#d97706" rx="1.5" />
        <circle cx="533" cy="237" r="1.5" fill="#fde68a" />
        {/* Power indicator */}
        <circle cx="528" cy="170" r="9" fill="#fbbf24" opacity="0.95" />
        <text x="528" y="174" textAnchor="middle" fontSize="11" fill="#1e3a8a" fontWeight="bold">⚡</text>
      </g>

      {/* ── 5. EV / Car ── */}
      <g>
        {/* Shadow */}
        <ellipse cx="528" cy="320" rx="55" ry="3.5" fill="#000" opacity="0.35" />
        {/* Body lower */}
        <path d="M 478 312 L 484 296 L 500 290 L 514 282 L 542 282 L 562 290 L 575 300 L 578 312 L 578 318 L 478 318 Z" fill="url(#car)" stroke="#7f1d1d" strokeWidth="1" />
        {/* Cabin / windows */}
        <path d="M 502 290 L 514 284 L 542 284 L 558 290 L 502 290 Z" fill="#1e293b" opacity="0.85" />
        <line x1="528" y1="284" x2="528" y2="290" stroke="#475569" strokeWidth="1" />
        {/* Wheels */}
        <circle cx="496" cy="318" r="9" fill="#1e293b" />
        <circle cx="496" cy="318" r="4" fill="#475569" />
        <circle cx="560" cy="318" r="9" fill="#1e293b" />
        <circle cx="560" cy="318" r="4" fill="#475569" />
        {/* Headlight */}
        <circle cx="576" cy="306" r="2.5" fill="#fde68a" opacity="0.9" />
        {/* Charge port + cable on left side */}
        <rect x="473" y="298" width="6" height="9" fill="#fbbf24" rx="1" />
        <path d="M 462 286 Q 458 295 471 302" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Charge bolt on roof */}
        <circle cx="528" cy="287" r="3.5" fill="#fbbf24" opacity="0.9" />
        <text x="528" y="290" textAnchor="middle" fontSize="6" fill="#1e3a8a" fontWeight="bold">⚡</text>
        {/* Label */}
        <text x="528" y="345" textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="bold" letterSpacing="0.5">EV</text>
      </g>
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50">

      {/* Nav */}
      <nav className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <img src="/logo-192.png" alt="RoofSolar" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-amber-400/60 flex-shrink-0" />
          <span className="font-bold text-base sm:text-xl text-gray-900">RoofSolar</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/installers" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 transition-colors">
            For Installers
          </Link>
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/calculator"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap shadow-sm"
          >
            Get my analysis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-full px-4 py-1.5 text-sm text-amber-700 font-medium mb-6">
              ☀️ Financial-grade solar analysis — free in 3 minutes
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Turn your roof into a
              <span className="text-amber-500"> power station.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
              Enter your address and get a 10-year cashflow model, payback analysis,
              export tariff earnings, battery economics, and EV savings — tailored to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/calculator"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-amber-400/30"
              >
                Start my free analysis
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-gray-300 hover:border-gray-500 bg-white text-gray-700 hover:text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                How it works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-10 justify-center lg:justify-start">
              {[
                { icon: '🔒', text: 'No account required' },
                { icon: '⚡', text: 'Live PVGIS data' },
                { icon: '🇮🇪', text: 'Ireland & UK grants' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — illustration */}
          <div className="flex-1 w-full">
            <EnergyChainIllustration />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
          {[
            { value: '3 min', label: 'Average analysis time' },
            { value: '10yr', label: 'Cashflow projection' },
            { value: '€3.99', label: 'Full pro report' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 sm:p-6">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-500">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solar panel visual divider */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-8 md:grid-cols-16 gap-1.5 opacity-25">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-sky-300 rounded border border-sky-200 relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px p-px">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="bg-sky-400 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">How RoofSolar works</h2>
        <p className="text-center text-gray-600 mb-14">Four steps to your financial-grade solar report</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { step: '1', icon: '📍', title: 'Your address', desc: 'We fetch live solar irradiance data for your exact location from PVGIS.' },
            { step: '2', icon: '🏠', title: 'Roof details', desc: 'Orientation, pitch and shading loss — we calculate optimal panel placement.' },
            { step: '3', icon: '💶', title: 'Your numbers', desc: 'Irish tariffs, SEAI grants, consumption and financing — all pre-filled.' },
            { step: '4', icon: '📊', title: 'Your report', desc: '10-year cashflow, IRR, payback period, battery and EV economics.' },
          ].map((item) => (
            <div key={item.step} className="text-center group">
              <div className="w-14 h-14 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-amber-600 mb-1">STEP {item.step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-yellow-400 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Background panel pattern */}
          <div className="absolute inset-0 grid grid-cols-12 gap-2 p-4 opacity-10 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-900 rounded border border-gray-700" />
            ))}
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Ready to see your solar potential?</h2>
            <p className="text-gray-800 mb-8 max-w-xl mx-auto">
              Free analysis in 3 minutes. Upgrade to Pro for €3.99 to download your full PDF report and get installer quotes.
            </p>
            <Link
              href="/calculator"
              className="inline-block bg-gray-900 hover:bg-gray-800 text-yellow-400 font-bold px-8 sm:px-10 py-4 rounded-xl text-lg transition-colors"
            >
              Start free analysis
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 RoofSolar. All rights reserved. · v{APP_VERSION}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href="/installers" className="hover:text-gray-700 transition-colors">For Installers</Link>
            <a href="mailto:contact@roofsolar.netlify.app" className="hover:text-gray-700 transition-colors">Contact</a>
            <ForceUpdateButton />
          </div>
        </div>
      </footer>
    </main>
  );
}
