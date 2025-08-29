import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use | Fadetrack',
  description: 'Read the Terms governing your use of Fadetrack.'
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1>Terms of Use</h1>
      <p><strong>Last Updated:</strong> {new Date().toISOString().split('T')[0]}</p>

      <p>These Terms of Use ("Terms") govern your access to and use of the Fadetrack platform (the "Service"). By creating an account or using the Service you agree to be bound by these Terms.</p>

      <h2>1. Accounts</h2>
      <ul>
        <li>You must provide an accurate email address and be at least 16.</li>
        <li>You are responsible for maintaining account security.</li>
        <li>We may suspend or terminate accounts for breach or misuse.</li>
      </ul>

      <h2>2. Acceptable Use</h2>
      <ul>
        <li>No unlawful, abusive, defamatory, or deceptive content.</li>
        <li>No scraping, reverse engineering, or circumventing security.</li>
        <li>No posting of private personal data of others without consent.</li>
      </ul>

      <h2>3. User Content</h2>
      <p>You retain ownership of content you submit (logs, reviews, profile details). By submitting public content you grant us a worldwide, non‑exclusive, royalty‑free license to host, display, and distribute it solely to operate and improve the Service.</p>

      <h2>4. Public Reviews</h2>
      <p>Marking a review public makes its content visible to other users. Do not include sensitive or identifying information without permission.</p>

      <h2>5. Directory & Ratings</h2>
      <p>Average ratings and directory ordering are algorithmic and may change. We do not guarantee the availability, quality, or suitability of any professional.</p>

      <h2>6. Intellectual Property</h2>
      <p>The Service, trademarks, and software are our or our licensors' property. Except for the limited right to use the Service, no license is granted.</p>

      <h2>7. Prohibited Conduct (Illustrative)</h2>
      <ul>
        <li>Automated or rate‑limited circumvention.</li>
        <li>Submitting fraudulent, duplicate, or incentive‑manipulated reviews.</li>
        <li>Attempting to access another user's data without authorization.</li>
      </ul>

      <h2>8. Termination</h2>
      <p>You may delete your account at any time. We may suspend or terminate access for violations, risk, or required legal compliance.</p>

      <h2>9. Disclaimer</h2>
      <p>Service provided "as is" without warranties of any kind (express or implied). We disclaim implied warranties of merchantability, fitness, and non‑infringement to fullest extent permitted.</p>

      <h2>10. Limitation of Liability</h2>
      <p>To the maximum extent permitted, we are not liable for indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or goodwill.</p>

      <h2>11. Indemnity</h2>
      <p>You agree to defend and indemnify us against claims arising from your breach of these Terms or misuse of the Service.</p>

      <h2>12. Changes</h2>
      <p>We may modify these Terms. Material changes will be communicated in-app or via email. Continued use constitutes acceptance.</p>

      <h2>13. Governing Law</h2>
      <p>These Terms are governed by the laws of the jurisdiction of our primary business operations (United States), excluding conflicts principles.</p>

      <h2>14. Contact</h2>
      <p>Email: <a href="mailto:support@fadetrack.app">support@fadetrack.app</a></p>

      <p className="text-xs opacity-70">These Terms are provided for informational purposes and do not constitute legal advice.</p>
      <p><Link href="/">← Back to Home</Link></p>
    </main>
  );
}
