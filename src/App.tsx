import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import FeedPage from '@/pages/FeedPage';
import AuthPage from '@/pages/AuthPage';
import ExplorePage from '@/pages/ExplorePage';
import TopicPage from '@/pages/TopicPage';
import PoemPage from '@/pages/PoemPage';
import WritePage from '@/pages/WritePage';
import ProfilePage from '@/pages/ProfilePage';
import DashboardPage from '@/pages/DashboardPage';
import DashboardDemoPage from '@/pages/DashboardDemoPage';
import FundingMembersHallPage from '@/pages/FundingMembersHallPage';
import LoveInktella from '@/pages/LoveInktella';
import InkPage from '@/pages/InkPage';
import NotificationsPage from '@/pages/NotificationsPage';
import CriticNotesPage from '@/pages/CriticNotesPage';
import SettingsPage from '@/pages/SettingsPage';
import TermsOfUsePage from '@/pages/TermsOfUsePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import RefundPolicyPage from '@/pages/RefundPolicyPage';
import SupporterTermsPage from '@/pages/SupporterTermsPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard-demo" element={<DashboardDemoPage />} />
              <Route path="/funding-members" element={<FundingMembersHallPage />} />
              <Route path="/love-inktella" element={<LoveInktella />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/topic/:slug" element={<TopicPage />} />
              <Route path="/poem/:id" element={<PoemPage />} />
              <Route path="/write" element={<WritePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/ink" element={<InkPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/critic-notes" element={<CriticNotesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/terms" element={<TermsOfUsePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/supporter-terms" element={<SupporterTermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--surface))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
