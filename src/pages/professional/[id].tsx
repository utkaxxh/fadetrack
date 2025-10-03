import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PublicProfessionalProfile from '../../components/PublicProfessionalProfile';
import Link from 'next/link';

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{borderColor: '#114B5F'}}></div>
          <p style={{color: '#114B5F'}}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9, #f8fafc)'}}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{backgroundColor: 'rgba(241, 245, 249, 0.85)', borderBottom: '1px solid rgba(17, 75, 95, 0.15)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded" style={{backgroundColor: '#114B5F'}}></div>
              <h1 className="text-2xl font-bold" style={{color: '#114B5F'}}>
                RateMyMUA
              </h1>
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 btn-primary-teal"
            >
              Join RateMyMUA
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <PublicProfessionalProfile professionalId={id as string} />
      </main>

      {/* Footer */}
      <footer className="mt-16" style={{backgroundColor: 'rgba(241, 245, 249, 0.75)', borderTop: '1px solid rgba(17, 75, 95, 0.15)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm flex items-center gap-1" style={{color: '#114B5F'}}>
              Made with 
              <span className="mx-1" style={{color: '#114B5F'}}>♥</span> 
              in San Francisco
            </p>
            <div className="flex gap-4">
              <Link href="/" className="text-sm transition-colors duration-200" style={{color: '#114B5F'}}>
                Home
              </Link>
              <Link href="/directory" className="text-sm transition-colors duration-200" style={{color: '#114B5F'}}>
                Find Professionals
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
