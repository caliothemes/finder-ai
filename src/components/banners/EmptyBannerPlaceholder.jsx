import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export default function EmptyBannerPlaceholder({ variant = 'banner' }) {
  // Hook doit toujours être appelé en premier
  const { theme } = useTheme();
  
  // Card format (comme les cards de services)
  if (variant === 'card') {
    return (
      <div 
        className="group rounded-2xl border-2 border-dashed transition-all duration-300 hover:shadow-xl flex items-center justify-center p-8 min-h-[300px]"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom right, rgba(88, 28, 135, 0.2), rgba(30, 41, 59, 0.5), rgba(157, 23, 77, 0.2))'
            : 'linear-gradient(to bottom right, #faf5ff, #fdf4ff, #faf5ff)',
          borderColor: theme === 'dark' ? 'rgba(147, 51, 234, 0.5)' : '#d8b4fe'
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Votre Service IA ici
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Augmentez votre visibilité avec un compte pro
          </p>
          <Link to={createPageUrl('ProAccount')}>
            <Button className="bg-purple-950 hover:bg-purple-900 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Devenir Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Article format (pour homepage_hero et explore_top)
  if (variant === 'article') {
    return (
      <div 
        className="group rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300 hover:shadow-xl"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom right, rgba(88, 28, 135, 0.3), rgba(30, 41, 59, 0.8), rgba(157, 23, 77, 0.3))'
            : 'linear-gradient(to bottom right, #faf5ff, #ffffff, #fdf2f8)',
          borderColor: theme === 'dark' ? 'rgba(147, 51, 234, 0.5)' : '#d8b4fe'
        }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image placeholder à gauche */}
          <div 
            className="md:w-2/5 h-48 md:h-auto flex items-center justify-center relative overflow-hidden"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(to bottom right, rgba(88, 28, 135, 0.5), rgba(157, 23, 77, 0.5))'
                : 'linear-gradient(to bottom right, #e9d5ff, #fbcfe8)'
            }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgxNDcsIDUxLCAyMzQsIDAuMSkiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
            <div className="relative text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-sm" style={{ color: theme === 'dark' ? '#c4b5fd' : '#7c3aed' }}>Votre image ici</p>
            </div>
          </div>

          {/* Contenu à droite */}
          <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit mb-4"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(147, 51, 234, 0.3)' : '#f3e8ff',
                color: theme === 'dark' ? '#c4b5fd' : '#7c3aed'
              }}
            >
              <Sparkles className="w-3 h-3" />
              Espace disponible
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Titre de votre service IA
            </h3>
            <p className="mb-6 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Rédigez une description accrocheuse pour présenter votre service IA. 
              Expliquez les avantages et fonctionnalités qui font la différence pour vos utilisateurs.
            </p>
            <Link to={createPageUrl('ProAccount')}>
              <Button className="w-fit bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all">
                <Crown className="w-4 h-4 mr-2" />
                Réserver cet emplacement
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Banner format (horizontal) - pour les autres positions
  return (
    <div 
      className="relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 h-[150px] md:h-[200px]"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(to right, rgba(88, 28, 135, 0.2), rgba(157, 23, 77, 0.2), rgba(88, 28, 135, 0.2))'
          : 'linear-gradient(to right, #f3e8ff, #fce7f3, #f3e8ff)',
        borderColor: theme === 'dark' ? 'rgba(147, 51, 234, 0.5)' : '#d8b4fe'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Votre bannière ici
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Atteignez des milliers d'utilisateurs
              </p>
            </div>
          </div>
          <Link to={createPageUrl('ProAccount')}>
            <Button className="bg-purple-950 hover:bg-purple-900 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Devenir Pro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}