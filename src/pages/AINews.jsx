import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Calendar, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function AINews() {
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = React.useState(1);
  const articlesPerPage = 9; // 1 featured + 8 grid
  
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['publicNews'],
    queryFn: () => base44.entities.AINews.filter({ status: 'published' }, '-created_date', 500),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getTitle = (article) => language === 'en' && article.title_en ? article.title_en : article.title;
  const getSummary = (article) => language === 'en' && article.summary_en ? article.summary_en : article.summary;

  // Pagination
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = articles.slice(startIndex, startIndex + articlesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm mb-6">
            <Newspaper className="w-4 h-4" />
            <span>{language === 'en' ? 'Artificial Intelligence News' : 'Actualités Intelligence Artificielle'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {language === 'en' ? 'AI News' : 'Actualités IA'}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Stay up to date with the latest news about artificial intelligence'
              : 'Restez informé des dernières nouvelles sur l\'intelligence artificielle'}
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {language === 'en' ? 'No news yet' : 'Aucune actualité pour le moment'}
            </h3>
            <p className="text-slate-600">
              {language === 'en' ? 'Come back soon for the latest AI news' : 'Revenez bientôt pour les dernières nouvelles IA'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Article */}
            {paginatedArticles[0] && (
              <Link to={createPageUrl(`AINewsDetail?slug=${articles[0].slug}`)}>
                <article className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl hover:border-purple-300 transition-all group">
                  <div className="md:flex">
                    {articles[0].cover_image_url && (
                      <div className="md:w-1/2 overflow-hidden">
                        <img
                          src={articles[0].cover_image_url}
                          alt={getTitle(articles[0])}
                          className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        {articles[0].views > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {articles[0].views}
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {getTitle(articles[0])}
                      </h2>
                      <p className="text-slate-600 mb-6 line-clamp-3">{getSummary(articles[0])}</p>
                      {articles[0].tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {articles[0].tags.slice(0, 4).map((tag, i) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <Button className="bg-purple-600 hover:bg-purple-700 w-fit">
                        {language === 'en' ? 'Read full article' : 'Lire l\'article complet'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Other Articles */}
            <div className="grid md:grid-cols-2 gap-6">
              {articles.slice(1).map((article) => (
                <Link
                  key={article.id}
                  to={createPageUrl(`AINewsDetail?slug=${article.slug}`)}
                >
                  <article className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group h-full">
                    {article.cover_image_url && (
                      <div className="overflow-hidden">
                        <img
                          src={article.cover_image_url}
                          alt={getTitle(article)}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {article.source_logo_url && (
                          <img src={article.source_logo_url} alt="" className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium text-purple-600">{article.source_name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{article.published_date}</span>
                        {article.views > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {getTitle(article)}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">{getSummary(article)}</p>
                      <span className="inline-flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                        {language === 'en' ? 'Read article' : 'Lire l\'article'}
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}