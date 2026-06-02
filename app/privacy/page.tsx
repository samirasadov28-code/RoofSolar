import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | RoofSolar',
  description: 'How RoofSolar collects, uses, and protects your information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-192.png" alt="RoofSolar" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-gray-900">RoofSolar</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <article className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 prose prose-gray max-w-none">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mt-0 mb-8">Effective date: June 2, 2026</p>

          <p>
            This Privacy Policy explains how RoofSolar (&ldquo;RoofSolar,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and protects your information when you use the RoofSolar application and website at{' '}
            <a href="https://roofsolar.netlify.app" className="text-amber-600 hover:underline">https://roofsolar.netlify.app</a>{' '}
            (the &ldquo;Service&rdquo;). By using the Service, you agree to the practices described here.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Information we collect</h2>
          <p>
            <strong>Usage data.</strong> We automatically collect limited technical information such as device type, browser, general usage activity, and log data to operate, secure, and improve the Service.
          </p>
          <p>
            <strong>Account information.</strong> When you create an account, we collect your email address and any profile details you choose to provide. Authentication is handled via Supabase.
          </p>
          <p>
            <strong>Payment information.</strong> If you subscribe to a paid plan, payments are processed by our third-party payment processor, Stripe. We do not collect or store your full payment card details on our servers; that information is handled directly by Stripe under its own terms and privacy policy.
          </p>
          <p>
            <strong>Location and address data.</strong> To provide solar analysis features, we process the address or location information you enter or permit the device to share. Address lookup uses the OpenStreetMap Nominatim service, and maps are rendered via MapLibre GL using OpenStreetMap tiles.
          </p>
          <p>
            <strong>Analytics data.</strong> We use privacy-respecting analytics tools (Google Analytics and Plausible) to understand aggregate usage and improve the Service.
          </p>
          <p>
            <strong>Communication preferences.</strong> If you request quotes or purchase a Pro report, we use your email address to send transactional messages (quote confirmations, report delivery, feedback acknowledgements). Email delivery is handled by Resend. You can contact us at any time to opt out of non-essential communications.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">How we use your information</h2>
          <p>
            We use the information we collect to provide and maintain the Service, process payments, communicate with you, deliver your solar analysis and AI-generated explanations, and analyze and improve features, performance, and security.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">AI-generated content</h2>
          <p>
            RoofSolar uses Groq (a third-party AI infrastructure provider) to power the AI solar advisor feature. Inputs you provide for these features — such as your solar analysis data and questions — may be transmitted to Groq solely to produce results for you. We do not use your inputs to train AI models.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">How we share information</h2>
          <p>
            We do not sell your personal information. We share information only with service providers who help us operate the Service and who process data on our behalf under their own privacy and security obligations:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Netlify</strong> — hosting and infrastructure</li>
            <li><strong>Supabase</strong> — authentication and database</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Groq</strong> — AI inference for the solar advisor feature</li>
            <li><strong>OpenStreetMap / Nominatim</strong> — address geocoding</li>
            <li><strong>MapLibre GL / OpenStreetMap</strong> — map rendering</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Google Analytics / Plausible</strong> — aggregate usage analytics</li>
          </ul>
          <p>
            We may also disclose information where required by law or to protect the rights and safety of RoofSolar and its users.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Data retention</h2>
          <p>
            We retain information for as long as needed to provide the Service and for legitimate or legal purposes. You may request deletion of your account and associated data at any time by contacting us.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Your rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, export, or delete your personal information, and to object to or restrict certain processing. To exercise these rights, contact us at{' '}
            <a href="mailto:support@roofsolar.app" className="text-amber-600 hover:underline">support@roofsolar.app</a>.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect your information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Children&rsquo;s privacy</h2>
          <p>
            RoofSolar is not directed to children under 13 (or the minimum age required in your jurisdiction), and we do not knowingly collect personal information from them. If you believe a child has provided us personal information, contact us and we will delete it.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">International users</h2>
          <p>
            Your information may be processed and stored in countries other than your own, which may have different data-protection laws. By using the Service you consent to such processing.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be posted on this page with a revised effective date.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-xl font-bold text-gray-900">Contact us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <strong><a href="mailto:support@roofsolar.app" className="text-amber-600 hover:underline">support@roofsolar.app</a></strong>.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-6 bg-white/40 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RoofSolar</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <Link href="/calculator" className="hover:text-gray-700 transition-colors">Calculator</Link>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors font-medium text-gray-700">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
