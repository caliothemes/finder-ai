import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Newspaper, Calendar, ExternalLink, ArrowLeft, Eye, Share2, Clock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AINewsDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const { data: article, isLoading } = useQuery({
    queryKey: ['newsDetail', slug],
    queryFn: async () => {
      if (!slug) return null;
      const articles = await base44.entities.AINews.filter({ slug, status: 'published' });
      return articles[0] || null;
    },
    enabled: !!slug,
  });

  // Incrémenter les vues
  const incrementViewMutation = useMutation({
    mutationFn: async (id) => {
      const current = await base44.entities.AINews.filter({ id });
      if (current[0]) {
        await base44.entities.AINews.update(id, { views: (current[0].views || 0) + 1 });
      }
    },
  });

  useEffect(() => {
    if (article?.id) {
      incrementViewMutation.mutate(article.id);
    }
  }, [article?.id]);

  // Récupérer d'autres articles pour suggestions
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['relatedNews', article?.id],
    queryFn: async () => {
      const articles = await base44.entities.AINews.filter({ status: 'published' }, '-created_date', 5);
      return articles.filter(a => a.id !== article?.id).slice(0, 3);
    },
    enabled: !!article?.id,
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-6">
        <Newspaper className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Article non trouvé</h1>
        <p className="text-slate-600 mb-6">Cet article n'existe pas ou a été supprimé.</p>
        <Link to={createPageUrl('AINews')}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux actualités
          </Button>
        </Link>
      </div>
    );
  }

  const title = language === 'en' && article.title_en ? article.title_en : article.title;
  const summary = language === 'en' && article.summary_en ? article.summary_en : article.summary;
  const content = language === 'en' && article.content_en ? article.content_en : article.content;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Image */}
      {article.cover_image_url && (
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden">
          <img
            src={article.cover_image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Back button overlay */}
          <div className="absolute top-6 left-6">
            <Link to={createPageUrl('AINews')}>
              <Button variant="secondary" className="bg-white/90 hover:bg-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux actualités
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button if no image */}
        {!article.cover_image_url && (
          <Link to={createPageUrl('AINews')} className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux actualités
          </Link>
        )}

        {/* Article Header */}
        <article className={`bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden ${article.cover_image_url ? '-mt-24 relative z-10' : ''}`}>
          <div className="p-8 md:p-12">
            {/* Source & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
                {article.source_logo_url && (
                  <img src={article.source_logo_url} alt="" className="w-5 h-5" />
                )}
                <span className="text-sm font-semibold text-purple-700">{article.source_name}</span>
              </div>
              
              {article.published_date && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.published_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
              
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Eye className="w-4 h-4" />
                {article.views || 0} vues
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {title}
            </h1>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-l-4 border-purple-500">
              <p className="text-lg text-slate-700 leading-relaxed font-medium">
                {summary}
              </p>
            </div>

            {/* Content */}
            {content && (
              <div className="prose prose-lg prose-slate max-w-none mb-8">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">{children}</h2>,
                    h2: ({ children }) => <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h3>,
                    h3: ({ children }) => <h4 className="text-lg font-semibold text-slate-900 mt-4 mb-2">{children}</h4>,
                    p: ({ children }) => <p className="text-slate-700 leading-relaxed mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-300 pl-4 py-2 my-4 bg-purple-50 rounded-r-lg italic text-slate-600">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {/* Source Attribution */}
            <div className="bg-slate-100 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {article.source_logo_url ? (
                    <img src={article.source_logo_url} alt="" className="w-8 h-8" />
                  ) : (
                    <Globe className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-1">Source de l'article</p>
                  <p className="font-semibold text-slate-900 mb-2">{article.source_name}</p>
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Lire l'article original sur {article.source_name}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir l'article original
                </Button>
              </a>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Articles similaires</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={createPageUrl(`AINewsDetail?slug=${related.slug}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group"
                >
                  {related.cover_image_url && (
                    <img
                      src={related.cover_image_url}
                      alt={related.title}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {related.source_logo_url && (
                        <img src={related.source_logo_url} alt="" className="w-4 h-4" />
                      )}
                      <span className="text-xs text-purple-600 font-medium">{related.source_name}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {language === 'en' && related.title_en ? related.title_en : related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}