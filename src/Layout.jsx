import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StoriesViewer from '@/components/StoriesViewer';
import Logo from '@/components/Logo';
import ScrollToTop from '@/components/ScrollToTop';
import MemberInviteCard from '@/components/sidebar/MemberInviteCard';
import { 
        Menu, X, User, Heart, 
        LogOut, LogIn, PlusCircle, Crown, Search,
        Home, Compass, Grid3X3, Newspaper, Sparkles, Bot
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
    refetchInterval: 30000,
  });

  const { data: pendingBannersCount = 0 } = useQuery({
    queryKey: ['pendingBannersCount'],
    queryFn: async () => {
      const banners = await base44.entities.BannerReservation.list();
      return banners.filter(b => !b.validated && b.active).length;
    },
    refetchInterval: 30000,
  });

  const { data: pendingClaimsCount = 0 } = useQuery({
    queryKey: ['pendingClaimsCount'],
    queryFn: async () => {
      const claims = await base44.entities.AIOwnershipClaim.filter({ status: 'pending' });
      return claims.length;
    },
    refetchInterval: 30000,
  });

  const { data: pendingFinderReviewsCount = 0 } = useQuery({
    queryKey: ['pendingFinderReviewsCount'],
    queryFn: async () => {
      const requests = await base44.entities.FinderAIReviewRequest.filter({ status: 'pending' });
      return requests.length;
    },
    refetchInterval: 30000,
  });

  const totalNotifications = revisionCount + pendingBannersCount + pendingClaimsCount + pendingFinderReviewsCount;

  return (
    <Link
      to={createPageUrl('Admin')}
      className="flex items-center gap-3 px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all font-medium relative"
    >
      <Crown className="w-4 h-4" />
      {t('nav_admin')}
      {totalNotifications > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
          {totalNotifications}
        </span>
      )}
    </Link>
  );
}

// Hook pour tracker les nouveautés depuis la dernière visite
function useNewItemsTracker() {
  const location = useLocation();
  
  // Récupérer les counts actuels
  const { data: aiServicesCount = 0 } = useQuery({
    queryKey: ['aiServicesCount'],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter({ status: 'approved' });
      return services.length;
    },
    staleTime: 60000,
  });

  const { data: categoriesCount = 0 } = useQuery({
    queryKey: ['categoriesCount'],
    queryFn: async () => {
      const categories = await base44.entities.Category.list();
      return categories.length;
    },
    staleTime: 60000,
  });

  const { data: newsCount = 0 } = useQuery({
        queryKey: ['newsCount'],
        queryFn: async () => {
          const news = await base44.entities.AINews.filter({ status: 'published' });
          return news.length;
        },
        staleTime: 60000,
      });



  // Calculer les nouveautés
  const newItems = useMemo(() => {
    const lastVisit = JSON.parse(localStorage.getItem('lastVisitCounts') || '{}');
    
    return {
      explore: lastVisit.explore !== undefined ? Math.max(0, aiServicesCount - lastVisit.explore) : 0,
      categories: lastVisit.categories !== undefined ? Math.max(0, categoriesCount - lastVisit.categories) : 0,
      news: lastVisit.news !== undefined ? Math.max(0, newsCount - lastVisit.news) : 0,
    };
  }, [aiServicesCount, categoriesCount, newsCount]);

  // Mettre à jour le localStorage quand l'utilisateur visite une page
  useEffect(() => {
    const currentPath = location.pathname;
    const lastVisit = JSON.parse(localStorage.getItem('lastVisitCounts') || '{}');
    
    if (currentPath.includes('Explore') && aiServicesCount > 0) {
      localStorage.setItem('lastVisitCounts', JSON.stringify({ ...lastVisit, explore: aiServicesCount }));
    } else if (currentPath.includes('Categories') && categoriesCount > 0) {
      localStorage.setItem('lastVisitCounts', JSON.stringify({ ...lastVisit, categories: categoriesCount }));
    } else if (currentPath.includes('AINews') && newsCount > 0) {
      localStorage.setItem('lastVisitCounts', JSON.stringify({ ...lastVisit, news: newsCount }));
    }
  }, [location.pathname, aiServicesCount, categoriesCount, newsCount]);

  return newItems;
}

// Badge pour les nouveautés
function NewItemsBadge({ count }) {
  if (!count || count <= 0) return null;
  
  return (
    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full min-w-[20px] text-center">
      +{count > 99 ? '99+' : count}
    </span>
  );
}

function LayoutContent({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [storiesOpen, setStoriesOpen] = useState(false);
    const { language, changeLanguage, t } = useLanguage();
    const newItems = useNewItemsTracker();
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);

    const { data: favoritesCount = 0 } = useQuery({
      queryKey: ['favoritesCount', user?.email],
      queryFn: async () => {
        if (!user?.email) return 0;
        const favorites = await base44.entities.Favorite.filter({ user_email: user.email });
        return favorites.length;
      },
      enabled: !!user?.email,
      staleTime: 30000,
    });

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

    // Tracking des visites
    useEffect(() => {
      const trackPageView = async () => {
        // Générer ou récupérer un ID visiteur unique
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
          visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          localStorage.setItem('visitor_id', visitorId);
        }

        // Détecter l'appareil
        const width = window.innerWidth;
        let device = 'desktop';
        if (width < 768) device = 'mobile';
        else if (width < 1024) device = 'tablet';

        // Enregistrer la visite
        try {
          await base44.entities.PageView.create({
            page: currentPageName || location.pathname,
            visitor_id: visitorId,
            user_email: user?.email || null,
            referrer: document.referrer || null,
            device: device
          });
        } catch (e) {
          // Silently fail
        }
      };

      trackPageView();
    }, [location.pathname, currentPageName]);

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
            <button onClick={() => setStoriesOpen(true)} className="cursor-pointer group relative w-[110px] h-[110px] flex items-center justify-center">
              {/* Glow effect externe */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-15 blur-lg group-hover:opacity-30 animate-pulse-slow"></div>

              {/* Bordure animée 1 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-spin-slow"></div>

              {/* Fond blanc intérieur pour bordure 1 */}
              <div className="absolute inset-[3px] rounded-full bg-white"></div>

              {/* Bordure animée 2 (sens inverse) */}
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-l from-cyan-500 via-purple-500 to-pink-500 animate-spin-reverse opacity-80"></div>

              {/* Fond blanc intérieur pour bordure 2 */}
              <div className="absolute inset-[5px] rounded-full bg-white"></div>

              {/* Logo */}
              <div className="relative bg-white rounded-full w-[100px] h-[100px] flex items-center justify-center">
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
            <NewItemsBadge count={newItems.explore} />
          </Link>
          <Link
                            to={createPageUrl('Categories')}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                          >
                            <Grid3X3 className="w-4 h-4" />
                            {t('nav_categories')}
                            <NewItemsBadge count={newItems.categories} />
                          </Link>
                          <Link
                                            to={createPageUrl('FinderGPT')}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:text-purple-600 rounded-l-xl transition-all font-medium"
                                            style={{ background: 'linear-gradient(to right, rgba(253, 224, 71, 0.25), rgba(255, 255, 255, 0))' }}
                                          >
                                            <Bot className="w-4 h-4" />
                                            Agent FinderAI
                                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                                              NEW
                                            </span>
                                          </Link>
          <Link
                            to={createPageUrl('AINews')}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                          >
                            <Newspaper className="w-4 h-4" />
                            {t('nav_ai_news')}
            <NewItemsBadge count={newItems.news} />
          </Link>

          {user && (
                            <>
                              <Link
                                to={createPageUrl('Favorites')}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                              >
                                <Heart className="w-4 h-4" />
                                {t('nav_favorites')}
                                {favoritesCount > 0 && (
                                                        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full min-w-[20px] text-center">
                                                          {favoritesCount}
                                                        </span>
                                                      )}
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
              <>
              <button
              onClick={() => base44.auth.redirectToLogin()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium"
              >
              <LogIn className="w-4 h-4" />
              {t('nav_login')}
              </button>

              {/* Member Invite Card */}
              <div className="mt-4 px-1">
                <MemberInviteCard />
              </div>
              </>
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
                                      className="text-slate-700 hover:text-purple-600 font-medium transition-colors flex items-center gap-2 relative"
                                    >
                                      <Heart className="w-4 h-4" />
                                      {t('nav_favorites')}
                                      {favoritesCount > 0 && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full min-w-[18px] text-center">
                                                                  {favoritesCount}
                                                                </span>
                                                              )}
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
              {/* Search Button with Animation */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="group relative p-2.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <Search className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
              </button>

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
            <nav className="lg:hidden pt-4 pb-2 space-y-1">
              <Link
                to={createPageUrl('Home')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                {t('nav_home')}
              </Link>
              <Link
                to={createPageUrl('Explore')}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass className="w-4 h-4" />
                {t('nav_explore')}
                <NewItemsBadge count={newItems.explore} />
              </Link>
              <Link
                                    to={createPageUrl('Categories')}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <Grid3X3 className="w-4 h-4" />
                                    {t('nav_categories')}
                                    <NewItemsBadge count={newItems.categories} />
                                  </Link>
                                  <Link
                                                        to={createPageUrl('FinderGPT')}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:text-purple-600 rounded-l-xl transition-all font-medium"
                                                        style={{ background: 'linear-gradient(to right, rgba(253, 224, 71, 0.25), rgba(255, 255, 255, 0))' }}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                      >
                                                        <Bot className="w-4 h-4" />
                                                        Agent FinderAI
                                                        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                                                          NEW
                                                        </span>
                                                      </Link>
                                  <Link
                                                      to={createPageUrl('AINews')}
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <Newspaper className="w-4 h-4" />
                                  {t('nav_ai_news')}
                <NewItemsBadge count={newItems.news} />
              </Link>

              {user ? (
                <>
                  <Link
                                          to={createPageUrl('Favorites')}
                                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          <Heart className="w-4 h-4" />
                                          {t('nav_favorites')}
                                          {newItems.favoritesCount > 0 && (
                                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full min-w-[20px] text-center">
                                              {newItems.favoritesCount}
                                            </span>
                                          )}
                                        </Link>
                  <Link
                    to={createPageUrl('Profile')}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t('nav_profile')}
                  </Link>
                  <Link
                    to={createPageUrl('ProAccount')}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Crown className="w-4 h-4" />
                    {t('nav_pro_account')}
                  </Link>
                  <Link
                    to={createPageUrl('BannerManager')}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
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
                      <Link
                        to={createPageUrl('Admin')}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Crown className="w-4 h-4" />
                        {t('nav_admin')}
                      </Link>
                    </>
                  )}

                  <div className="my-2 border-t border-slate-200" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav_logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    base44.auth.redirectToLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  {t('nav_login')}
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
                        <div className="flex flex-col items-center text-center border-r border-slate-700 pr-8">
                          <Logo size={100} />
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mt-3 mb-2">
                            Finder AI
                          </h2>
                          <p className="text-slate-400 text-sm mb-4">
                            {t('footer_tagline')}
                          </p>
                          <a 
                            href="https://www.instagram.com/finderai_/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-pink-400 transition-colors"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        </div>

                        <div>
                          <h3 className="font-bold mb-4">{t('footer_discover')}</h3>
                          <ul className="space-y-2 text-slate-400">
                            <li><Link to={createPageUrl('Home')} className="hover:text-white transition-colors">{t('footer_home')}</Link></li>
                            <li><Link to={createPageUrl('Explore')} className="hover:text-white transition-colors">{t('footer_explore')}</Link></li>
                            <li><Link to={createPageUrl('Categories')} className="hover:text-white transition-colors">{t('footer_categories')}</Link></li>
                            <li><Link to={createPageUrl('AINews')} className="hover:text-white transition-colors">{t('footer_ai_news')}</Link></li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-bold mb-4">{t('footer_account')}</h3>
                          <ul className="space-y-2 text-slate-400">
                            <li><Link to={createPageUrl('Profile')} className="hover:text-white transition-colors">{t('footer_profile')}</Link></li>
                            <li><Link to={createPageUrl('Favorites')} className="hover:text-white transition-colors">{t('footer_favorites')}</Link></li>
                            <li><Link to={createPageUrl('ProAccount')} className="hover:text-white transition-colors">{t('footer_pro_account')}</Link></li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-bold mb-4">{t('footer_contribute')}</h3>
                          <ul className="space-y-2 text-slate-400">
                            <li><Link to={createPageUrl('SubmitAI')} className="hover:text-white transition-colors">{t('footer_submit_ai')}</Link></li>
                          </ul>
                        </div>

                        </div>

                        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-500 text-xs">
                          <p>{t('footer_copyright')} {t('footer_powered_by')} <a href="https://caliothemes.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Caliothemes</a>.</p>
                          <span className="hidden sm:inline">•</span>
                          <Link to={createPageUrl('LegalMentions')} className="hover:text-white transition-colors">{t('footer_legal')}</Link>
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