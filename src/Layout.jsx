import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StoriesViewer from '@/components/StoriesViewer';
import Logo from '@/components/Logo';
import ScrollToTop from '@/components/ScrollToTop';
import { 
        Menu, X, User, Heart, 
        LogOut, LogIn, PlusCircle, Crown, Search,
        Home, Compass, Grid3X3, Newspaper
      } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SearchModal from '@/components/SearchModal';
import { LanguageProvider, useLanguage } from '@/components/LanguageProvider';

// Composant pour le lien admin avec badge de notifications
function AdminNavLink() {
  const { t } = useLanguage();
  
  const { data: revisionCount = 0 } = useQuery({
    queryKey: ['adminRevisionCount'],
    queryFn: async () => {
      const services = await base44.entities.AIService.list();
      return services.filter(s => s.pending_revision).length;
    },
    refetchInterval: 30000, // Refresh toutes les 30 secondes
  });

  return (
    <Link
      to={createPageUrl('Admin')}
      className="flex items-center gap-3 px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all font-medium relative"
    >
      <Crown className="w-4 h-4" />
      {t('nav_admin')}
      {revisionCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
          {revisionCount}
        </span>
      )}
    </Link>
  );
}

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const { language, changeLanguage, t } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white border-r border-slate-200 fixed left-0 top-0 h-screen overflow-y-auto">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 flex flex-col items-center justify-center">
          <div className="relative inline-flex items-center justify-center mb-3">
            <button onClick={() => setStoriesOpen(true)} className="cursor-pointer group relative">
              {/* Glow effect externe */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-15 blur-lg group-hover:opacity-30 animate-pulse-slow"></div>

              {/* Bordure animée 1 */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-spin-slow" style={{ padding: '3px' }}>
                <div className="w-full h-full rounded-full bg-white" />
              </div>

              {/* Bordure animée 2 (sens inverse) */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-l from-cyan-500 via-purple-500 to-pink-500 animate-spin-reverse opacity-80" style={{ padding: '2px' }}>
                <div className="w-full h-full rounded-full bg-white" />
              </div>

              {/* Logo */}
              <div className="relative bg-white rounded-full p-2 flex items-center justify-center">
                <svg width="90" height="90" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <filter id="glowSidebar">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="100" cy="90" r="40" stroke="url(#gradientSidebar)" strokeWidth="8" fill="none" filter="url(#glowSidebar)"/>
                  <circle cx="100" cy="90" r="8" fill="url(#gradientSidebar)"/>
                  <path d="M 130 110 L 155 135" stroke="url(#gradientSidebar)" strokeWidth="10" strokeLinecap="round" filter="url(#glowSidebar)"/>
                  <line x1="100" y1="50" x2="100" y2="20" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
                  <circle cx="100" cy="20" r="6" fill="#9333ea" filter="url(#glowSidebar)" />
                  <line x1="125" y1="60" x2="155" y2="30" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
                  <circle cx="155" cy="30" r="6" fill="#06b6d4" filter="url(#glowSidebar)" />
                  <line x1="140" y1="90" x2="180" y2="90" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
                  <circle cx="180" cy="90" r="6" fill="#ec4899" filter="url(#glowSidebar)" />
                  <line x1="125" y1="115" x2="145" y2="145" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
                  <circle cx="145" cy="145" r="6" fill="#9333ea" filter="url(#glowSidebar)" />
                  <line x1="60" y1="90" x2="20" y2="90" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
                  <circle cx="20" cy="90" r="6" fill="#06b6d4" filter="url(#glowSidebar)" />
                  <line x1="75" y1="60" x2="45" y2="30" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
                  <circle cx="45" cy="30" r="6" fill="#ec4899" filter="url(#glowSidebar)" />
                  <line x1="75" y1="115" x2="50" y2="145" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
                  <circle cx="50" cy="145" r="6" fill="#9333ea" filter="url(#glowSidebar)" />
                  <line x1="100" y1="130" x2="100" y2="160" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
                  <circle cx="100" cy="160" r="6" fill="#06b6d4" filter="url(#glowSidebar)" />
                </svg>
              </div>
            </button>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-950 via-purple-700 to-purple-900 bg-clip-text text-transparent mb-1 text-center">
            Finder AI
          </h2>
          <p className="text-xs text-slate-600 text-center">
            Le répertoire ultime des outils d'IA
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to={createPageUrl('Home')}
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
          >
            <Home className="w-4 h-4" />
            {t('nav_home')}
          </Link>
          <Link
            to={createPageUrl('Explore')}
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
          >
            <Compass className="w-4 h-4" />
            {t('nav_explore')}
          </Link>
          <Link
            to={createPageUrl('Categories')}
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
          >
            <Grid3X3 className="w-4 h-4" />
            {t('nav_categories')}
          </Link>
          <Link
            to={createPageUrl('AINews')}
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
          >
            <Newspaper className="w-4 h-4" />
            Actualités IA
          </Link>

          {user && (
            <>
              <Link
                to={createPageUrl('Favorites')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
              >
                <Heart className="w-4 h-4" />
                {t('nav_favorites')}
              </Link>
              <Link
                to={createPageUrl('Profile')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
              >
                <User className="w-4 h-4" />
                {t('nav_profile')}
              </Link>
              <Link
                to={createPageUrl('ProAccount')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
              >
                <Crown className="w-4 h-4" />
                {t('nav_pro_account')}
              </Link>
              <Link
                to={createPageUrl('BannerManager')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                {t('nav_my_banners')}
              </Link>

              {user.role === 'admin' && (
                <>
                  <div className="my-2 border-t border-slate-200" />
                  <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Administration
                  </div>
                  <AdminNavLink />
                </>
              )}

              <div className="my-2 border-t border-slate-200" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                {t('nav_logout')}
              </button>
              </>
              )}

              {!user && (
              <button
              onClick={() => base44.auth.redirectToLogin()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium"
              >
              <LogIn className="w-4 h-4" />
              {t('nav_login')}
              </button>
              )}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
            {/* Mobile Logo - visible only on mobile */}
            <Link to={createPageUrl('Home')} className="flex lg:hidden items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <filter id="glowMobile">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="100" cy="90" r="40" stroke="url(#gradientMobile)" strokeWidth="8" fill="none" filter="url(#glowMobile)"/>
                <circle cx="100" cy="90" r="8" fill="url(#gradientMobile)"/>
                <path d="M 130 110 L 155 135" stroke="url(#gradientMobile)" strokeWidth="10" strokeLinecap="round" filter="url(#glowMobile)"/>
                <line x1="100" y1="50" x2="100" y2="20" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
                <circle cx="100" cy="20" r="6" fill="#9333ea" filter="url(#glowMobile)" />
                <line x1="125" y1="60" x2="155" y2="30" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
                <circle cx="155" cy="30" r="6" fill="#06b6d4" filter="url(#glowMobile)" />
                <line x1="140" y1="90" x2="180" y2="90" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
                <circle cx="180" cy="90" r="6" fill="#ec4899" filter="url(#glowMobile)" />
                <line x1="125" y1="115" x2="145" y2="145" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
                <circle cx="145" cy="145" r="6" fill="#9333ea" filter="url(#glowMobile)" />
                <line x1="60" y1="90" x2="20" y2="90" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
                <circle cx="20" cy="90" r="6" fill="#06b6d4" filter="url(#glowMobile)" />
                <line x1="75" y1="60" x2="45" y2="30" stroke="#ec4899" strokeWidth="2" opacity="0.4" />
                <circle cx="45" cy="30" r="6" fill="#ec4899" filter="url(#glowMobile)" />
                <line x1="75" y1="115" x2="50" y2="145" stroke="#9333ea" strokeWidth="2" opacity="0.4" />
                <circle cx="50" cy="145" r="6" fill="#9333ea" filter="url(#glowMobile)" />
                <line x1="100" y1="130" x2="100" y2="160" stroke="#06b6d4" strokeWidth="2" opacity="0.4" />
                <circle cx="100" cy="160" r="6" fill="#06b6d4" filter="url(#glowMobile)" />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-950 via-purple-700 to-purple-900 bg-clip-text text-transparent">
                Finder AI
              </span>
            </Link>

            {/* Desktop Nav - Simplified */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to={createPageUrl('Explore')}
                className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
              >
                {t('nav_explore')}
              </Link>

              {user && (
                <Link
                  to={createPageUrl('Favorites')}
                  className="text-slate-700 hover:text-purple-600 font-medium transition-colors flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {t('nav_favorites')}
                </Link>
              )}

              <Link to={createPageUrl('SubmitAI')}>
                <Button className="bg-purple-950 hover:bg-purple-900 text-white">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {t('nav_submit_ai')}
                </Button>
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-2 py-1 rounded text-xl transition-all ${
                    language === 'fr' ? 'bg-purple-100' : 'opacity-50 hover:opacity-100'
                  }`}
                  title="Français"
                >
                  🇫🇷
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded text-xl transition-all ${
                    language === 'en' ? 'bg-purple-100' : 'opacity-50 hover:opacity-100'
                  }`}
                  title="English"
                >
                  🇬🇧
                </button>
              </div>
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-slate-700 hover:text-purple-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      <User className="w-4 h-4 mr-2" />
                      {user.full_name || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {!user && (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-purple-950 hover:bg-purple-900 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('nav_login')}
                </Button>
              )}
              </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pt-4 pb-2 space-y-2">
              <Link
                to={createPageUrl('Home')}
                className="block py-2 text-slate-700 hover:text-purple-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to={createPageUrl('Explore')}
                className="block py-2 text-slate-700 hover:text-purple-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explorer
              </Link>
              <Link
                to={createPageUrl('Categories')}
                className="block py-2 text-slate-700 hover:text-purple-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catégories
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={createPageUrl('Favorites')}
                    className="block py-2 text-slate-700 hover:text-purple-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Favoris
                  </Link>
                  <Link
                    to={createPageUrl('SubmitAI')}
                    className="block py-2 text-purple-600 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Proposer mon IA
                  </Link>
                  <Link
                    to={createPageUrl('Profile')}
                    className="block py-2 text-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <Link
                    to={createPageUrl('ProAccount')}
                    className="block py-2 text-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Compte Pro
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl('Admin')}
                      className="block py-2 text-purple-600 font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-red-600 font-medium"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    base44.auth.redirectToLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-purple-600 font-semibold"
                >
                  Connexion
                </button>
              )}
            </nav>
          )}
        </div>
        </header>

        {/* Stories Modal */}
        {storiesOpen && (
          <StoriesViewer onClose={() => setStoriesOpen(false)} />
        )}

        {/* Main Content */}
        <main>{children}</main>

        {/* Scroll to top button */}
        <ScrollToTop />

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.75; }
            50% { opacity: 1; }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 4s linear infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          .group:hover .animate-spin-slow {
            animation: spin-slow 1.5s linear infinite;
          }
          .group:hover .animate-spin-reverse {
            animation: spin-reverse 2s linear infinite;
          }
        `}</style>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo size={50} />
                <span className="text-xl font-bold">Finder AI</span>
              </div>
              <p className="text-slate-400">
                Le répertoire ultime des outils d'intelligence artificielle
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Découvrir</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('Home')} className="hover:text-white transition-colors">Accueil</Link></li>
                <li><Link to={createPageUrl('Explore')} className="hover:text-white transition-colors">Explorer</Link></li>
                <li><Link to={createPageUrl('Categories')} className="hover:text-white transition-colors">Catégories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Compte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('Profile')} className="hover:text-white transition-colors">Mon Profil</Link></li>
                <li><Link to={createPageUrl('Favorites')} className="hover:text-white transition-colors">Favoris</Link></li>
                <li><Link to={createPageUrl('ProAccount')} className="hover:text-white transition-colors">Compte Pro</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contribuer</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('SubmitAI')} className="hover:text-white transition-colors">Proposer une IA</Link></li>
              </ul>
            </div>

            </div>

            <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
              <p>© 2025 Finder AI. Tous droits réservés. App propulsé par <a href="https://caliothemes.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Caliothemes</a>.</p>
              <p className="mt-2">
                <Link to={createPageUrl('LegalMentions')} className="hover:text-white transition-colors">Mentions légales</Link>
              </p>
            </div>
        </div>
        </footer>
      </div>
    </div>
    );
    }

    export default function Layout({ children, currentPageName }) {
    return (
    <LanguageProvider>
    <LayoutContent children={children} currentPageName={currentPageName} />
    </LanguageProvider>
    );
    }