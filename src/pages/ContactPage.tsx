import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { setMetadata } from '@/lib/metadata';

export default function ContactPage() {
  useEffect(() => {
    setMetadata({
      title: 'Contact Us',
      description: 'Get in touch with the Inktella team. Send us your questions, feedback, or concerns about our poetry community platform.',
      url: 'https://inktella.onspace.app/contact',
    });
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="flex items-center gap-2 text-brand-500 hover:text-brand-600 mb-4 w-fit">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
          <p className="text-foreground-muted mt-2">We&apos;d love to hear from you</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Main Contact Section */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Get in Touch</h2>
            <p className="text-foreground-secondary mb-8">
              Have questions, feedback, or concerns about Inktella? We&apos;re here to help. Reach out to us via email and we&apos;ll get back to you as soon as possible.
            </p>

            {/* Email Contact Card */}
            <div className="border border-border rounded-xl p-8 bg-background-subtle hover:border-brand-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={24} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
                  <p className="text-foreground-secondary mb-4">
                    For all inquiries, feature requests, bug reports, and general questions, please email us at:
                  </p>
                  <a
                    href="mailto:poetry@inktella.cyou"
                    className="text-brand-500 hover:text-brand-600 font-medium text-lg underline"
                  >
                    poetry@inktella.cyou
                  </a>
                  <p className="text-sm text-foreground-muted mt-4">
                    We typically respond within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Common Inquiries</h2>
            <div className="space-y-6">
              {/* Account Issues */}
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-brand-500" />
                  Account & Technical Issues
                </h3>
                <p className="text-foreground-secondary">
                  If you&apos;re having trouble logging in, resetting your password, or experiencing technical problems, please describe the issue in detail when you email us. Include your username and the device/browser you&apos;re using.
                </p>
              </div>

              {/* Content Violations */}
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-brand-500" />
                  Report Content Violations
                </h3>
                <p className="text-foreground-secondary">
                  Found content that violates our Terms of Use? Please report it by emailing us with a description of the violation and links to the problematic content. We take violations seriously and will investigate promptly.
                </p>
              </div>

              {/* Feature Requests */}
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-brand-500" />
                  Feature Requests & Feedback
                </h3>
                <p className="text-foreground-secondary">
                  Have an idea to improve Inktella? We&apos;d love to hear it! Send us your suggestions and feedback. Your input helps shape the future of the Platform.
                </p>
              </div>

              {/* Privacy & Data Requests */}
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-brand-500" />
                  Privacy & Data Requests
                </h3>
                <p className="text-foreground-secondary">
                  To request access to your data, delete your account, or exercise your privacy rights, contact us and we&apos;ll process your request in accordance with our Privacy Policy.
                </p>
              </div>

              {/* Content Questions */}
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-brand-500" />
                  Terms & Content Guidelines Questions
                </h3>
                <p className="text-foreground-secondary">
                  Unsure about what content is allowed? Have questions about our Terms of Use or AI usage policy? We&apos;re happy to clarify. See our full policies in the&nbsp;
                  <Link to="/terms" className="text-brand-500 hover:text-brand-600 underline">
                    Terms of Use
                  </Link>
                  &nbsp;and&nbsp;
                  <Link to="/privacy" className="text-brand-500 hover:text-brand-600 underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Response Time */}
          <section className="bg-background-subtle border border-border rounded-xl p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Response Times</h2>
            <ul className="space-y-3 text-foreground-secondary">
              <li className="flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-1">•</span>
                <span><strong>General Inquiries:</strong> 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-1">•</span>
                <span><strong>Technical Issues:</strong> 48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-1">•</span>
                <span><strong>Report Violations:</strong> Within 24 hours for initial review</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-500 font-bold mt-1">•</span>
                <span><strong>Legal/Privacy Requests:</strong> As required by applicable law</span>
              </li>
            </ul>
          </section>

          {/* Additional Resources */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Additional Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/terms"
                className="border border-border rounded-lg p-4 hover:border-brand-400 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-2">Terms of Use</h3>
                <p className="text-sm text-foreground-muted">Read our complete terms and content guidelines</p>
              </Link>
              <Link
                to="/privacy"
                className="border border-border rounded-lg p-4 hover:border-brand-400 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-2">Privacy Policy</h3>
                <p className="text-sm text-foreground-muted">Learn how we protect your information</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
