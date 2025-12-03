import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Video, Play, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import moment from 'moment';

export default function LatestVideoNews() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['latestVideoNews'],
    queryFn: () => base44.entities.AIVideoNews.filter({ status: 'published' }, '-published_date', 2),
  });

  if (isLoading || videos.length === 0) return null;

  return (
    <>
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Latest Video News' : 'Les dernières nouvelles en vidéo'}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {language === 'en' ? 'Stay updated with AI video content' : 'Restez informé avec du contenu vidéo IA'}
              </p>
            </div>
          </div>

          {/* Video Grid - 2 videos */}
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl cursor-pointer relative block"
                style={{ 
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(168, 85, 247, 0.1))' 
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(168, 85, 247, 0.05))',
                  border: '1px solid var(--border-color)',
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={language === 'en' ? video.title_en || video.title : video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Video className="w-16 h-16" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl group-hover:shadow-red-500/30">
                      <Play className="w-9 h-9 text-red-600 ml-1.5" fill="currentColor" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <Badge className="absolute bottom-4 right-4 bg-black/80 text-white border-0 backdrop-blur-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration}
                    </Badge>
                  )}

                  {/* Source badge */}
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg">
                    <Video className="w-3 h-3 mr-1" />
                    {video.source_name}
                  </Badge>

                  {/* Title overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-bold text-lg line-clamp-2 mb-2 drop-shadow-lg">
                      {language === 'en' ? video.title_en || video.title : video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar className="w-3 h-3" />
                      {moment(video.published_date).format('DD MMM YYYY')}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}