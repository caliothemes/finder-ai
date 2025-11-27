import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Calendar, ExternalLink, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AINews() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['publicNews'],
    queryFn: () => base44.entities.AINews.filter({ status: 'published' }, '-created_date', 50),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm mb-6">
            <Newspaper className="w-4 h-4" />
            <span>Actualités Intelligence Artificielle</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Actualités IA
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Restez informé des dernières nouvelles sur l'intelligence artificielle
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune actualité pour le moment</h3>
            <p className="text-slate-600">Revenez bientôt pour les dernières nouvelles IA</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Article */}
            {articles[0] && (
              <article className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  {articles[0].cover_image_url && (
                    <div className="md:w-1/2">
                      <img
                        src={articles[0].cover_image_url}
                        alt={articles[0].title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      {articles[0].source_logo_url && (
                        <img src={articles[0].source_logo_url} alt="" className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium text-purple-600">{articles[0].source_name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {articles[0].published_date}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">{articles[0].title}</h2>
                    <p className="text-slate-600 mb-6">{articles[0].summary}</p>
                    {articles[0].tags?.length > 0 && (
                      <div className="flex gap-2 mb-6">
                        {articles[0].tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <a href={articles[0].source_url} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Lire l'article complet
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                </div>
              </article>
            )}

            {/* Other Articles */}
            <div className="grid md:grid-cols-2 gap-6">
              {articles.slice(1).map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  {article.cover_image_url && (
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {article.source_logo_url && (
                        <img src={article.source_logo_url} alt="" className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium text-purple-600">{article.source_name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{article.published_date}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{article.summary}</p>
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Lire l'article
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}