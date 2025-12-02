import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ExternalLink, Heart, Star, Crown, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageProvider';
import DefaultAILogo from '@/components/DefaultAILogo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function HomeFeaturedAI({ aiServices, onToggleFavorite, favorites = [], finderReviews = [] }) {
  const { language } = useLanguage();

  const isFavorite = (serviceId) => {
    return favorites.some(fav => fav.ai_service_id === serviceId);
  };

  const getFinderReview = (serviceId) => {
    return finderReviews.find(r => r.ai_service_id === serviceId && r.active);
  };

  if (!aiServices || aiServices.length === 0) return null;

  return (
    <div className="py-16 px-6 relative overflow-hidden">
      {/* Background stylé */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
              <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-400" />
                {language === 'en' ? 'Featured AI Tools' : 'Outils IA en Vedette'}
              </h2>
            </div>
            <p className="text-lg text-white/70 ml-7">
              {language === 'en' ? 'Hand-picked selection by our team' : 'Sélection triée sur le volet par notre équipe'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiServices.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="group bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-2 relative"
            >
              {/* Image */}
              <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)} className="block relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden cursor-pointer">
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
                
                {/* Badge Vedette */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 border-0 shadow-lg font-bold">
                    <Crown className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Featured' : 'En vedette'}
                  </Badge>
                </div>

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
              
              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(service.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110 z-10"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
                />
              </button>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {service.logo_url ? (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-white/20 bg-white flex items-center justify-center overflow-hidden">
                      <DefaultAILogo size={40} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                      <h3 className="text-xl font-bold text-white mb-1 hover:text-yellow-400 transition-colors truncate">
                        {service.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-white/60 line-clamp-1">
                      {language === 'en' && service.tagline_en ? service.tagline_en : service.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-white/70 mb-4 line-clamp-2 text-sm">
                  {language === 'en' && service.description_en ? service.description_en : service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">
                    {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-xs text-white/50">({service.views || 0})</span>
                </div>

                {/* Action button */}
                <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-bold group/btn">
                    <span>{language === 'en' ? 'Discover' : 'Découvrir'}</span>
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