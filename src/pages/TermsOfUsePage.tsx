import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-4 w-fit">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Terms of Use</h1>
          <p className="text-foreground-muted mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none space-y-6 text-foreground-secondary">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Inktella ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree to any part of these terms, you may not use the Platform. Inktella reserves the right to modify these terms at any time, and continued use of the Platform constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Platform Purpose</h2>
            <p>
              Inktella is exclusively dedicated to poetry and constructive feedback on poetry. The Platform is designed for poets to share their work, receive meaningful feedback, and grow as writers. All content must relate directly to poetry creation and critique.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Content Guidelines</h2>
            <p className="font-semibold text-foreground mb-2">General Audience & Appropriateness:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>Inktella is intended for a general audience, mainstream users of all ages</li>
              <li>No adult content, explicit material, or graphic violence is permitted</li>
              <li>Content must be appropriate for readers of all ages</li>
              <li>Poetry must be original or properly attributed if inspired by others</li>
            </ul>

            <p className="font-semibold text-foreground mb-2">Exclusive Poetry Focus:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>Only poetry and poetry-related content is allowed</li>
              <li>No unrelated posts, off-topic discussions, or non-poetry content</li>
              <li>Marketing, promotional content, or advertisements are not permitted</li>
              <li>No requests for monetary assistance or financial solicitation</li>
              <li>No medical, legal, or professional advice</li>
            </ul>

            <p className="font-semibold text-foreground mb-2">Images in Poems:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Images must be original, licensed, or properly credited</li>
              <li>Images must be relevant to the poem and appropriate for all audiences</li>
              <li>Copyrighted material without permission is strictly prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Language Standards</h2>
            <p>
              While poetry often explores complex emotions and themes, language must remain respectful and not include gratuitous profanity or hate speech. Slurs, harassment, or discriminatory language targeting individuals or groups are strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. AI Usage Policy</h2>
            <p className="font-semibold text-foreground mb-2">Composing Poetry:</p>
            <p className="mb-4">
              You may use AI as a tool to assist with your creative process, but you must not rely on AI to fully generate your poetry. AI should enhance your writing, not replace your voice. Poetry should reflect your authentic creative effort and growth as a writer.
            </p>

            <p className="font-semibold text-foreground mb-2">Providing Feedback:</p>
            <p>
              AI-generated feedback is strictly prohibited. All feedback must be original, thoughtful, and written by you. Using AI to generate feedback is considered cheating and violates the spirit of our community. We actively monitor for AI-generated feedback and will restrict your feedback privileges if detected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Account Restrictions & Enforcement</h2>
            <p className="mb-4">
              Inktella reserves the right to take the following actions against users who violate these Terms of Use:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Warn:</strong> We may issue a warning about violations</li>
              <li><strong>Restrict:</strong> Limit specific features or capabilities</li>
              <li><strong>Suspend:</strong> Temporarily disable account access</li>
              <li><strong>Ban:</strong> Permanently remove your account and access to the Platform</li>
              <li><strong>Downgrade:</strong> Reduce your account privileges or status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
            <p>
              You retain all rights to the poetry and content you post on Inktella. By posting content, you grant Inktella a non-exclusive license to display and distribute your content on the Platform. You are responsible for ensuring that your content does not infringe on any third-party intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. User Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Harass, bully, or discriminate against other users</li>
              <li>Post spam, duplicate content, or promotional material</li>
              <li>Impersonate other users or create fake accounts</li>
              <li>Engage in illegal activities</li>
              <li>Attempt to manipulate engagement metrics through artificial means</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disclaimer of Warranties</h2>
            <p>
              Inktella is provided "as is" without warranties of any kind. We do not guarantee that the Platform will be uninterrupted or error-free. We are not responsible for the accuracy or quality of feedback provided by other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Inktella shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
            <p>
              If you have questions about these Terms of Use, please contact us at{' '}
              <a href="mailto:poetry@inktella.cyou" className="text-brand-500 hover:text-brand-600 underline">
                poetry@inktella.cyou
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
