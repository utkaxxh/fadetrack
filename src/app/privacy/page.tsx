import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Fadetrack',
  description: 'Learn how Fadetrack collects, uses, and protects your data.'
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated:</strong> {new Date().toISOString().split('T')[0]}</p>

      <p>Fadetrack ("we", "our", "us") helps users log grooming services, discover professionals, and share authentic reviews. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our platform (the "Service").</p>

      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <p>Email address and (optionally) display name when you sign up via Supabase authentication.</p>
      <h3>Usage & Content</h3>
      <ul>
        <li>Haircut / service logs (date, style, notes, cost).</li>
        <li>Reviews (ratings, text, titles, professional names, locations).</li>
        <li>Professional setup profile fields you voluntarily provide.</li>
      </ul>
      <h3>Location Data</h3>
      <p>When you choose a location via autocomplete we store normalized fields (city, state, country, place_id). We do not collect precise GPS.</p>
      <h3>Technical Data</h3>
      <p>Basic analytics (aggregated usage, referrers, approximate region) to improve reliability. No cross‑site ad tracking.</p>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>Provide core functionality (logs, reminders, reviews, directory rank calculations).</li>
        <li>Surface relevant professionals and compute average ratings.</li>
        <li>Improve UX, diagnose performance issues, prevent abuse.</li>
        <li>Send transactional emails (e.g. reminders) you opt into.</li>
      </ul>

      <h2>3. Legal Bases (EEA/UK)</h2>
      <ul>
        <li><strong>Performance of a contract</strong> – operating your account.</li>
        <li><strong>Legitimate interests</strong> – preventing fraud, improving Service.</li>
        <li><strong>Consent</strong> – optional communications where required.</li>
      </ul>

      <h2>4. Sharing & Disclosure</h2>
      <ul>
        <li><strong>Public Content:</strong> Reviews you mark public are visible to other users.</li>
        <li><strong>Service Providers:</strong> Managed hosting (Vercel), database/auth (Supabase), basic analytics tooling – each processes data on our behalf.</li>
        <li><strong>Legal:</strong> If required to comply with law, protect rights, or prevent abuse.</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>We retain account and log data while your account is active. You can request deletion of your account and associated personal data (subject to minimal legal retention obligations).</p>

      <h2>6. Your Rights</h2>
      <ul>
        <li>Access, export, correct, or delete your personal data.</li>
        <li>Opt out of non-essential emails.</li>
        <li>Object to or restrict certain processing (where applicable).</li>
      </ul>
      <p>Contact us to exercise rights: <a href="mailto:privacy@fadetrack.app">privacy@fadetrack.app</a>.</p>

      <h2>7. Security</h2>
      <p>We use industry practices (TLS encryption in transit, role-based policies in database) but no system is 100% secure. Report issues to <a href="mailto:security@fadetrack.app">security@fadetrack.app</a>.</p>

      <h2>8. Children</h2>
      <p>The Service is not directed to individuals under 16. If you believe a minor has provided data, contact us for removal.</p>

      <h2>9. International Transfers</h2>
      <p>Data may be processed in regions where our hosting providers operate (e.g., United States). We rely on provider contractual safeguards for transfers.</p>

      <h2>10. Changes</h2>
      <p>We may update this Policy. Material changes will be highlighted within the app or via email. Continued use after posting constitutes acceptance.</p>

      <h2>11. Contact</h2>
      <p>Email: <a href="mailto:support@fadetrack.app">support@fadetrack.app</a></p>

      <p className="text-xs opacity-70">This Privacy Policy is provided for informational purposes and does not constitute legal advice.</p>
      <p><Link href="/">← Back to Home</Link></p>
    </main>
  );
}
