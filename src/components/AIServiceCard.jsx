import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Star, Heart, ExternalLink, Eye, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DefaultAILogo from '@/components/DefaultAILogo';
import { useLanguage } from '@/components/LanguageProvider';

export default function AIServiceCard({ service, onToggleFavorite, isFavorite, hasFinderReview = false, finderReviewRating = null }) {
  const { language, t } = useLanguage();

  // Vérifier si le service est nouveau (moins de 7 jours)
  const isNew = () => {
    if (!service.created_date) return false;
    const createdDate = new Date(service.created_date);
    const now = new Date();
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };



  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
      {/* Image section */}
      <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)} className="block relative h-40 bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer">
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

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew() && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              {language === 'en' ? 'New' : 'Nouveau'}
            </Badge>
          )}
          {hasFinderReview && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg cursor-pointer">
                    <Award className="w-3 h-3 mr-1" />
                    Finder AI
                    {finderReviewRating && (
                      <span className="ml-1 flex items-center">
                        <Star className="w-3 h-3 fill-white" />
                        {finderReviewRating}
                      </span>
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-slate-800 border shadow-lg">
                  <p className="text-sm">{language === 'en' ? 'Reviewed by Finder AI team' : 'Testé par l\'équipe Finder AI'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {service.logo_url ? (
            <img
              src={service.logo_url}
              alt={service.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
              <DefaultAILogo size={32} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link to={createPageUrl(`AIDetail?slug=${service.slug}`)}>
              <h3 className="text-lg font-bold text-slate-900 hover:text-purple-600 transition-colors truncate">
                {service.name}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 line-clamp-1">
              {language === 'en' && service.tagline_en ? service.tagline_en : service.tagline}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-4 line-clamp-2">
          {language === 'en' && service.description_en ? service.description_en : service.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Eye className="w-4 h-4" />
            <span>{service.views || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}



        {/* Action */}
        <Link 
          to={createPageUrl(`AIDetail?slug=${service.slug}`)}
          onClick={() => {
            // Track card click
            let visitorId = localStorage.getItem('visitor_id');
            if (!visitorId) {
              visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
              localStorage.setItem('visitor_id', visitorId);
            }
            base44.entities.ServiceClick.create({
              ai_service_id: service.id,
              click_type: 'card',
              visitor_id: visitorId
            });
          }}
        >
          <Button className="w-full bg-purple-950 hover:bg-purple-900 text-white">
            <span>Découvrir</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}