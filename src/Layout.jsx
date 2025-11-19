import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
        Menu, X, User, Heart, 
        LogOut, LogIn, PlusCircle, Crown, Search 
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

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.3),transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.3),transparent_70%)]" />
                <Search className="w-5 h-5 text-white relative z-10 drop-shadow-lg" />
                <div className="absolute inset-0 border-2 border-white/30 rounded-xl" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full blur-sm animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-950 via-purple-700 to-purple-900 bg-clip-text text-transparent">
                Finder AI
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 text-slate-700 hover:text-purple-600 font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </button>
              <Link
                to={createPageUrl('Home')}
                className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
              >
                Accueil
              </Link>
              <Link
                to={createPageUrl('Explore')}
                className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
              >
                Explorer
              </Link>
              <Link
                to={createPageUrl('Categories')}
                className="text-slate-700 hover:text-purple-600 font-medium transition-colors"
              >
                Catégories
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={createPageUrl('Favorites')}
                    className="text-slate-700 hover:text-purple-600 font-medium transition-colors flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Favoris
                  </Link>
                  
                  <Link to={createPageUrl('SubmitAI')}>
                    <Button className="bg-purple-950 hover:bg-purple-900 text-white">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Proposer mon IA
                    </Button>
                  </Link>

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
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('ProAccount')} className="cursor-pointer">
                          <Crown className="w-4 h-4 mr-2" />
                          Compte Pro
                        </Link>
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('Admin')} className="cursor-pointer">
                            <Crown className="w-4 h-4 mr-2" />
                            Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Se déconnecter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-purple-950 hover:bg-purple-900 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
              )}
            </nav>

            <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pt-4 pb-2 space-y-2">
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

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <Search className="w-4 h-4 text-white relative z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.3),transparent_70%)]" />
                </div>
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
            <p>© 2024 Finder AI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}