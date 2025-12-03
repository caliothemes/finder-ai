import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Video, Play, ExternalLink, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import moment from 'moment';

export default function VideoNewsSection() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videoNews'],
    queryFn: () => base44.entities.AIVideoNews.filter({ status: 'published' }, '-published_date', 12),
  });

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (isLoading || videos.length === 0) return null;

  return (
    <>
      <div className="mt-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {language === 'en' ? 'AI Video News' : 'Actualités IA en Vidéo'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {language === 'en' ? 'The latest AI videos from around the web' : 'Les dernières vidéos IA du web'}
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
              }}
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={language === 'en' ? video.title_en || video.title : video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <Video className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-7 h-7 text-red-600 ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration badge */}
                {video.duration && (
                  <Badge className="absolute bottom-3 right-3 bg-black/80 text-white border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}
                  </Badge>
                )}

                {/* Source badge */}
                <Badge className="absolute top-3 left-3 bg-red-600 text-white border-0">
                  <Video className="w-3 h-3 mr-1" />
                  {video.source_name}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-purple-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {language === 'en' ? video.title_en || video.title : video.title}
                </h3>
                
                <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                  {language === 'en' ? video.description_en || video.description : video.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Calendar className="w-3 h-3" />
                    {moment(video.published_date).format('DD MMM YYYY')}
                  </div>
                  
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex gap-1">
                      {video.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
          {selectedVideo && (
            <div>
              <div className="aspect-video bg-black">
                {getYouTubeEmbedUrl(selectedVideo.video_url) ? (
                  <iframe
                    src={`${getYouTubeEmbedUrl(selectedVideo.video_url)}?autoplay=1`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Video className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {language === 'en' ? selectedVideo.title_en || selectedVideo.title : selectedVideo.title}
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? selectedVideo.description_en || selectedVideo.description : selectedVideo.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-700">
                      {selectedVideo.source_name}
                    </Badge>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {moment(selectedVideo.published_date).format('DD MMMM YYYY')}
                    </span>
                  </div>
                  <a href={selectedVideo.video_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Watch on YouTube' : 'Voir sur YouTube'}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}