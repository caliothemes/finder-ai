import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LatestNews() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['latestNews'],
    queryFn: () => base44.entities.AINews.filter({ status: 'published' }, '-created_date', 3),
  });

  // Déplacer la condition après les hooks
  if (isLoading || articles.length === 0) return null;

  return (
    <section className="py-16 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold text-purple-500 uppercase tracking-wider">
                Actualités IA
              </span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Les dernières nouvelles
            </h2>
          </div>
          <Link to={createPageUrl('AINews')}>
            <Button variant="outline" className="hidden md:flex">
              Toutes les actualités
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="group rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {article.cover_image_url ? (
                  <div className="relative h-48 overflow-hidden cursor-pointer">
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-purple-700 backdrop-blur-sm">
                        <Newspaper className="w-3 h-3 mr-1" />
                        News
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center cursor-pointer">
                    <Newspaper className="w-12 h-12 text-purple-300" />
                  </div>
                )}
              </a>
              
              <div className="p-5">
                {/* Source */}
                <div className="flex items-center gap-2 mb-3">
                  {article.source_logo_url && (
                    <img src={article.source_logo_url} alt="" className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium text-purple-500">{article.source_name}</span>
                  <span style={{ color: 'var(--border-color)' }}>•</span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Calendar className="w-3 h-3" />
                    {article.published_date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </h3>

                {/* Summary */}
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {article.summary}
                </p>

                {/* Tags */}
                {article.tags?.length > 0 && (
                  <div className="flex gap-1 mb-4">
                    {article.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Link */}
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Lire l'article
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link to={createPageUrl('AINews')}>
            <Button variant="outline">
              Toutes les actualités
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}