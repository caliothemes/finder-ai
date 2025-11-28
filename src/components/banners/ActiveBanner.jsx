import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ActiveBanner({ position }) {
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

  if (isLoading || !activeBanner) return null;

  // Positions en format card (sidebar)
  const isCardFormat = position === 'homepage_sidebar' || position === 'explore_sidebar';

  // Format Card (comme les autres services)
  if (isCardFormat) {
    return (
      <div className="group bg-white rounded-3xl overflow-hidden border-2 border-purple-400 ring-2 ring-purple-200 hover:border-purple-500 hover:ring-purple-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
          <a href={activeBanner.target_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={activeBanner.image_url} 
              alt={activeBanner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </a>
          
          {/* Badge "Sponsorisé" avec tooltip */}
          <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg cursor-pointer hover:opacity-90">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Sponsorisé
                  </Badge>
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
            <p className="text-slate-600 mb-4 line-clamp-3 text-sm font-normal">
              {activeBanner.description}
            </p>
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
        </div>
      </div>
    );
  }

  // Format bannière classique (hero, top)
  const heightClasses = {
    homepage_hero: 'h-[150px] md:h-[200px]',
    explore_top: 'h-[150px] md:h-[200px]',
    category_top: 'h-[150px] md:h-[200px]',
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
      
      {/* Badge "Sponsorisé" avec tooltip - en dehors du lien */}
      <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg cursor-pointer hover:opacity-90">
                <Sparkles className="w-3 h-3 mr-1" />
                Sponsorisé
              </Badge>
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