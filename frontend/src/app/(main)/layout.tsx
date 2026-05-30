import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CompareBar } from '@/components/compare/CompareBar';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
      <ChatbotWidget />
    </div>
  );
}
