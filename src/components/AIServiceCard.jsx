import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Heart, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AIServiceCard({ service, onToggleFavorite, isFavorite }) {
  const getPricingBadge = (pricing) => {
    const colors = {
      gratuit: 'bg-green-100 text-green-800 border-green-200',
      freemium: 'bg-blue-100 text-blue-800 border-blue-200',
      payant: 'bg-orange-100 text-orange-800 border-orange-200',
      abonnement: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[pricing] || colors.freemium;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
      {/* Image section */}
      <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
        {service.cover_image_url ? (
          <img
            src={service.cover_image_url}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
            🤖
          </div>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(service.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {service.logo_url && (
            <img
              src={service.logo_url}
              alt={service.name}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <Link to={createPageUrl(`AIDetail?id=${service.id}`)}>
              <h3 className="text-lg font-bold text-slate-900 hover:text-purple-600 transition-colors truncate">
                {service.name}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 line-clamp-1">
              {service.tagline}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Eye className="w-4 h-4" />
              <span>{service.views || 0}</span>
            </div>
          </div>
          <Badge className={`${getPricingBadge(service.pricing)} border text-xs`}>
            {service.pricing}
          </Badge>
        </div>

        {/* Action */}
        <Link to={createPageUrl(`AIDetail?id=${service.id}`)}>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white group/btn">
            <span>Découvrir</span>
            <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}