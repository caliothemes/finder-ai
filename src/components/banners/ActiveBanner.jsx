import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EmptyBannerPlaceholder from './EmptyBannerPlaceholder';

export default function ActiveBanner({ position, showPlaceholder = false }) {
  const today = new Date().toISOString().split('T')[0];

  const { data: activeBanner, isLoading } = useQuery({
    queryKey: ['activeBanner', position, today],
    queryFn: async () => {
      try {
        const banners = await base44.entities.BannerReservation.filter({
          position: position,
          validated: true,
          active: true
        });
        
        // Trouver une bannière qui a réservé aujourd'hui
        const banner = banners.find(b => 
          (b.reserved_dates || []).includes(today)
        );
        
        return banner || null;
      } catch (error) {
        console.error('Error loading banner:', error);
        return null;
      }
    },
  });

  // Si pas de bannière et placeholder demandé, afficher le placeholder
  if (!isLoading && !activeBanner && showPlaceholder) {
    const isCardFormat = position === 'homepage_sidebar' || position === 'explore_sidebar';
    const isArticleFormat = position === 'homepage_hero' || position === 'explore_top';
    return <EmptyBannerPlaceholder variant={isArticleFormat ? 'article' : isCardFormat ? 'card' : 'banner'} />;
  }

  if (isLoading || !activeBanner) return null;

  // Positions en format card (sidebar)
  const isCardFormat = position === 'homepage_sidebar' || position === 'explore_sidebar';

  // Format Card (comme les autres services)
  if (isCardFormat) {
    return (
      <div className="group bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 rounded-3xl overflow-hidden border-2 border-purple-400 ring-2 ring-purple-200 hover:border-purple-500 hover:ring-purple-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
          <a href={activeBanner.target_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={activeBanner.image_url} 
              alt={activeBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </a>
          
          {/* Badge "Sponsorisé" + icône info avec tooltip */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Sponsorisé
            </Badge>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white shadow-md">
                    <Info className="w-3 h-3 text-purple-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-white text-slate-800 border shadow-lg p-3 z-50">
                  <p className="text-sm font-medium mb-1">🚀 Votre bannière ici !</p>
                  <p className="text-xs text-slate-600">Boostez la visibilité de votre outil IA avec un compte Pro et atteignez des milliers d'utilisateurs.</p>
                  <Link to={createPageUrl('ProAccount')} className="text-xs text-purple-600 font-medium hover:underline mt-1 inline-block">
                    Découvrir les plans Pro →
                  </Link>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <a href={activeBanner.target_url} target="_blank" rel="noopener noreferrer">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 hover:text-purple-600 transition-colors">
              {activeBanner.title}
            </h3>
          </a>
          {activeBanner.description && (
            <p className="text-slate-600 mb-4 line-clamp-[8] text-sm font-normal">
              {activeBanner.description}
            </p>
          )}

          {/* Badges */}
          {activeBanner.badges && activeBanner.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeBanner.badges.map((badge, idx) => (
                <Badge key={idx} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          <a 
            href={activeBanner.target_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Découvrir
          </a>

          {/* Pro promo encart */}
          <Link 
            to={createPageUrl('ProAccount')}
            className="mt-3 block text-center text-[10px] text-purple-600 hover:text-purple-700 transition-colors"
          >
            <span className="opacity-70">🚀 Votre service IA ici ?</span>{' '}
            <span className="font-semibold underline">Devenir Pro</span>
          </Link>
          </div>
          </div>
          );
          }

  // Format Article pour homepage_hero et explore_top
    const isArticleFormat = position === 'homepage_hero' || position === 'explore_top';

    if (isArticleFormat) {
      return (
        <div className="group bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl overflow-hidden border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col md:flex-row">
            {/* Image à gauche */}
            <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden">
              <a href={activeBanner.target_url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={activeBanner.image_url} 
                  alt={activeBanner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </a>

              {/* Badge "Sponsorisé" */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Sponsorisé
                </Badge>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white shadow-md">
                        <Info className="w-3 h-3 text-purple-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-white text-slate-800 border shadow-lg p-3 z-50">
                      <p className="text-sm font-medium mb-1">🚀 Votre bannière ici !</p>
                      <p className="text-xs text-slate-600">Boostez la visibilité de votre outil IA avec un compte Pro.</p>
                      <Link to={createPageUrl('ProAccount')} className="text-xs text-purple-600 font-medium hover:underline mt-1 inline-block">
                        Découvrir les plans Pro →
                      </Link>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Contenu à droite */}
            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
              <a href={activeBanner.target_url} target="_blank" rel="noopener noreferrer">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 hover:text-purple-600 transition-colors">
                  {activeBanner.title}
                </h3>
              </a>
              {activeBanner.description && (
                <p className="text-slate-600 mb-6 text-base leading-relaxed line-clamp-4">
                  {activeBanner.description}
                </p>
              )}
              <a 
                href={activeBanner.target_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-fit bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Découvrir
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Format bannière classique (autres positions)
    const heightClasses = {
      explore_bottom: 'h-[150px] md:h-[200px]',
      categories_bottom: 'h-[150px] md:h-[200px]',
      category_top: 'h-[150px] md:h-[200px]',
      homepage_category_bottom: 'h-[150px] md:h-[200px]',
      service_detail: 'h-[250px]'
    };

    return (
      <div className={`relative group overflow-hidden rounded-2xl shadow-xl ${heightClasses[position] || 'h-[200px]'}`}>
        <a 
          href={activeBanner.target_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img 
            src={activeBanner.image_url} 
            alt={activeBanner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Badge "Sponsorisé" + icône info avec tooltip */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            Sponsorisé
          </Badge>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white shadow-md">
                  <Info className="w-3 h-3 text-purple-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs bg-white text-slate-800 border shadow-lg p-3 z-50">
                <p className="text-sm font-medium mb-1">🚀 Votre bannière ici !</p>
                <p className="text-xs text-slate-600">Boostez la visibilité de votre outil IA avec un compte Pro et atteignez des milliers d'utilisateurs.</p>
                <Link to={createPageUrl('ProAccount')} className="text-xs text-purple-600 font-medium hover:underline mt-1 inline-block">
                  Découvrir les plans Pro →
                </Link>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }