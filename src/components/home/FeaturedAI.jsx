import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, TrendingUp, ExternalLink, Heart, Sparkles, Crown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/components/LanguageProvider';
import ActiveBanner from '@/components/banners/ActiveBanner';
import DefaultAILogo from '@/components/DefaultAILogo';

export default function FeaturedAI({ aiServices, onToggleFavorite, favorites = [] }) {
  const { t } = useLanguage();
  const [pricingOpen, setPricingOpen] = useState({});
  
  const isFavorite = (serviceId) => {
    return favorites.some(fav => fav.ai_service_id === serviceId);
  };

  const getPricingBadge = (pricing) => {
    const colors = {
      gratuit: 'bg-green-100 text-green-800 border-green-200',
      freemium: 'bg-blue-100 text-blue-800 border-blue-200',
      payant: 'bg-orange-100 text-orange-800 border-orange-200',
      abonnement: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[pricing] || colors.freemium;
  };

  const getPricingLabel = (pricing) => {
    const labels = {
      gratuit: '€0',
      freemium: '€+',
      payant: '€€',
      abonnement: '⚡'
    };
    return labels[pricing] || pricing;
  };

  const getPricingDescription = (pricing) => {
    const descriptions = {
      gratuit: 'Service entièrement gratuit',
      freemium: 'Gratuit avec options payantes',
      payant: 'Service payant',
      abonnement: 'Facturation mensuelle ou annuelle'
    };
    return descriptions[pricing] || '';
  };

  const PricingBadge = ({ service }) => (
    <Popover open={pricingOpen[service.id]} onOpenChange={(open) => setPricingOpen({...pricingOpen, [service.id]: open})}>
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <Badge className={`${getPricingBadge(service.pricing)} border cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}>
            {getPricingLabel(service.pricing)}
            <Info className="w-3 h-3" />
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <div className="font-semibold text-sm">{getPricingLabel(service.pricing)}</div>
          <div className="text-xs text-slate-600">{getPricingDescription(service.pricing)}</div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="py-16 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
              <h2 className="text-4xl font-bold text-slate-900">
                {t('home_featured_title')}
              </h2>
            </div>
            <p className="text-lg text-slate-600 ml-7">
              {t('home_featured_subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Bannière Homepage Sidebar en format card */}
          <ActiveBanner position="homepage_sidebar" />

          {aiServices.slice(0, 4).map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
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
                
                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(service.id);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
                  />
                </button>

                {/* Featured badge */}
                {service.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      En vedette
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {service.logo_url ? (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                      <DefaultAILogo size={40} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 hover:text-purple-600 transition-colors truncate">
                        {service.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {service.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 line-clamp-2 text-sm">
                  {service.description}
                </p>

                {/* Rating and pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-xs text-slate-500">({service.views || 0})</span>
                  </div>
                  
                  <PricingBadge service={service} />
                </div>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
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

                {/* Promo Card */}
          <div className="group bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-3xl border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all duration-300 hover:shadow-xl flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t('promo_your_service')}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {t('promo_increase_visibility')}
              </p>
              <Link to={createPageUrl('ProAccount')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  {t('promo_become_pro')}
                </Button>
              </Link>
            </div>
          </div>

          {aiServices.slice(4).map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
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
                
                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(service.id);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite(service.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
                  />
                </button>

                {/* Featured badge */}
                {service.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {t('home_featured_badge')}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {service.logo_url ? (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                      <DefaultAILogo size={40} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 hover:text-purple-600 transition-colors truncate">
                        {service.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {service.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 line-clamp-2 text-sm">
                  {service.description}
                </p>

                {/* Rating and pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-xs text-slate-500">({service.views || 0})</span>
                  </div>
                  
                  <PricingBadge service={service} />
                </div>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
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