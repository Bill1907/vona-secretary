import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container max-w-4xl mx-auto px-4 py-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
