import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ExternalLink, Heart, Sparkles, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import ActiveBanner from '@/components/banners/ActiveBanner';
import DefaultAILogo from '@/components/DefaultAILogo';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function FeaturedAI({ aiServices, onToggleFavorite, favorites = [], finderReviews = [] }) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  
  // Vérifier s'il y a une bannière payante active
  const { data: hasPaidBanner = false } = useQuery({
    queryKey: ['homepageSidebarBanner'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const banners = await base44.entities.BannerReservation.filter({
        position: 'homepage_sidebar',
        active: true,
        validated: true
      });
      return banners.some(b => b.reserved_dates?.includes(today));
    },
    staleTime: 60000,
  });
  
  // Toujours 15 cards max: promo card + bannière payante (si présente) + services IA
  // 1 slot réservé pour promo card, 1 pour bannière payante (si présente)
  const maxServices = hasPaidBanner ? 14 : 15; // 15 - (1 bannière si présente)
  const displayedServices = aiServices.slice(0, maxServices);
  
  const isFavorite = (serviceId) => {
    return favorites.some(fav => fav.ai_service_id === serviceId);
  };

  const getFinderReview = (serviceId) => {
    return finderReviews.find(r => r.ai_service_id === serviceId && r.active);
  };

  // Vérifier si le service est nouveau (moins de 7 jours)
  const isNew = (service) => {
    if (!service.created_date) return false;
    const createdDate = new Date(service.created_date);
    const now = new Date();
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };



  return (
    <div className="py-16 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
              <h2 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Latest AI Tools' : 'Nouveautés IA'}
              </h2>
            </div>
            <p className="text-lg ml-7" style={{ color: 'var(--text-secondary)' }}>
              {language === 'en' ? 'The latest AI tools added to our directory' : 'Les derniers outils IA ajoutés à notre répertoire'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedServices.slice(0, 4).map((service) => (
            <div
              key={service.id}
              className="group rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              {/* Image */}
              <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)} className="block relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden cursor-pointer">
                {service.cover_image_url ? (
                  <img
                    src={service.cover_image_url}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl opacity-20">🤖</div>
                  </div>
                )}
                
                {/* Badge À l'affiche */}
                {service.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      À l'affiche
                    </Badge>
                  </div>
                )}

                {/* Badge Nouveau */}
                {isNew(service) && !service.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {language === 'en' ? 'New' : 'Nouveau'}
                    </Badge>
                  </div>
                )}

                {/* Badge Finder AI Review */}
                {getFinderReview(service.id) && (
                  <div className="absolute bottom-4 left-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg cursor-pointer">
                            <Award className="w-3 h-3 mr-1" />
                            Finder AI
                            <Star className="w-3 h-3 ml-1 fill-white" />
                            {getFinderReview(service.id).rating}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-slate-800 border shadow-lg">
                          <p className="text-sm">{language === 'en' ? 'Reviewed by Finder AI team' : 'Testé par l\'équipe Finder AI'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </Link>
              
              {/* Favorite button - outside Link */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(service.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 z-10"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-red-500 text-red-500' : ''}`}
                  style={{ color: isFavorite(service.id) ? undefined : 'var(--text-secondary)' }}
                />
              </button>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {service.logo_url ? (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      style={{ border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    >
                      <DefaultAILogo size={40} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                      <h3 className="text-xl font-bold mb-1 hover:text-purple-500 transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                        {service.name}
                      </h3>
                    </Link>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {language === 'en' && service.tagline_en ? service.tagline_en : service.tagline}
                    </p>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' && service.description_en ? service.description_en : service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({service.views || 0})</span>
                </div>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action button */}
                <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white group/btn">
                    <span>{t('home_featured_discover')}</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                </div>
                </div>
                ))}

          {/* Bannière Homepage Sidebar en format card (ou placeholder si pas active) - Position 5 (milieu 2ème ligne) */}
          <ActiveBanner position="homepage_sidebar" showPlaceholder={true} />

          {displayedServices.slice(4).map((service) => (
            <div
              key={service.id}
              className="group rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              {/* Image */}
              <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)} className="block relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden cursor-pointer">
                {service.cover_image_url ? (
                  <img
                    src={service.cover_image_url}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl opacity-20">🤖</div>
                  </div>
                )}

                {/* Badge À l'affiche */}
                {service.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      À l'affiche
                    </Badge>
                  </div>
                )}

                {/* Badge Nouveau */}
                {isNew(service) && !service.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {language === 'en' ? 'New' : 'Nouveau'}
                    </Badge>
                  </div>
                )}

                {/* Badge Finder AI Review */}
                {getFinderReview(service.id) && (
                  <div className="absolute bottom-4 left-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg cursor-pointer">
                            <Award className="w-3 h-3 mr-1" />
                            Finder AI
                            <Star className="w-3 h-3 ml-1 fill-white" />
                            {getFinderReview(service.id).rating}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-slate-800 border shadow-lg">
                          <p className="text-sm">{language === 'en' ? 'Reviewed by Finder AI team' : 'Testé par l\'équipe Finder AI'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </Link>
              
              {/* Favorite button - outside Link */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(service.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 z-10"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-red-500 text-red-500' : ''}`}
                  style={{ color: isFavorite(service.id) ? undefined : 'var(--text-secondary)' }}
                />
              </button>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {service.logo_url ? (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      style={{ border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    >
                      <DefaultAILogo size={40} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                      <h3 className="text-xl font-bold mb-1 hover:text-purple-500 transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                        {service.name}
                      </h3>
                    </Link>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {language === 'en' && service.tagline_en ? service.tagline_en : service.tagline}
                    </p>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' && service.description_en ? service.description_en : service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({service.views || 0})</span>
                </div>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action button */}
                <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white group/btn">
                    <span>{t('home_featured_discover')}</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}