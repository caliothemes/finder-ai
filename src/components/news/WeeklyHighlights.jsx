import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Flame, Calendar, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageProvider';

export default function WeeklyHighlights({ articles }) {
  const { language } = useLanguage();
  
  // Prendre les 6 derniers articles marqués weekly_highlight triés par date
  const highlightArticles = articles
    .filter(a => a.weekly_highlight && a.status === 'published')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

  if (highlightArticles.length === 0) return null;

  const getTitle = (article) => language === 'en' && article.title_en ? article.title_en : article.title;
  const getSummary = (article) => language === 'en' && article.summary_en ? article.summary_en : article.summary;

  return (
    <div className="mt-16 mb-8">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {language === 'en' ? 'Important News of the Week' : 'Actualités Importantes de la Semaine'}
            </h2>
            <p className="text-white/80 mt-1">
              {language === 'en' 
                ? 'The most important AI news you shouldn\'t miss'
                : 'Les actualités IA les plus importantes à ne pas manquer'}
            </p>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlightArticles.map((article) => (
          <Link
            key={article.id}
            to={createPageUrl(`AINewsDetail?slug=${article.slug}`)}
          >
            <article className="group bg-white rounded-2xl overflow-hidden border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all h-full">
              {/* Badge Highlight */}
              <div className="relative">
                {article.cover_image_url && (
                  <div className="overflow-hidden">
                    <img
                      src={article.cover_image_url}
                      alt={getTitle(article)}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                    <Flame className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Important' : 'Important'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {article.source_logo_url && (
                    <img src={article.source_logo_url} alt="" className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium text-orange-600">{article.source_name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.published_date}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {getTitle(article)}
                </h3>
                
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {getSummary(article)}
                </p>
                
                <span className="inline-flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700">
                  {language === 'en' ? 'Read article' : 'Lire l\'article'}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}