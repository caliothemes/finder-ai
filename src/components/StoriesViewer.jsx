import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function StoriesViewer({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ['activeStories'],
    queryFn: () => base44.entities.Story.filter({ active: true }, '-created_date'),
  });

  const incrementViewMutation = useMutation({
    mutationFn: (storyId) => {
      const story = stories.find(s => s.id === storyId);
      return base44.entities.Story.update(storyId, { views: (story?.views || 0) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeStories'] });
    },
  });

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      incrementViewMutation.mutate(stories[newIndex].id);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      incrementViewMutation.mutate(stories[newIndex].id);
    }
  };

  useEffect(() => {
    if (stories.length && stories[currentIndex]) {
      incrementViewMutation.mutate(stories[currentIndex].id);
    }
  }, []);

  const handleDownloadForInstagram = async () => {
    const story = stories[currentIndex];
    if (!story) return;

    try {
      // Copy text to clipboard
      const textContent = `${story.title}\n\n${story.text}`;
      await navigator.clipboard.writeText(textContent);
      toast.success('Texte copié ! Téléchargement de l\'image...');

      // Download image
      const response = await fetch(story.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story-${story.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  useEffect(() => {
    const timer = setTimeout(nextStory, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!stories.length) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="text-white text-center">
          <p className="text-xl">Aucune story disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">{stories[currentIndex] && (
      <>
          {/* Progress bars */}
          <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                {index === currentIndex && (
                  <div className="h-full bg-white rounded-full animate-progress" />
                )}
                {index < currentIndex && (
                  <div className="h-full bg-white rounded-full" />
                )}
              </div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Download for Instagram button */}
          <button
            onClick={handleDownloadForInstagram}
            className="absolute top-4 right-16 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors z-10"
            title="Télécharger pour Instagram"
          >
            <Download className="w-5 h-5 text-white" />
          </button>

          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              onClick={prevStory}
              className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <button
              onClick={nextStory}
              className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Story Content */}
          <div className="relative w-full max-w-md aspect-[9/16] rounded-3xl overflow-hidden mx-4">
            <img 
              src={stories[currentIndex].image_url} 
              alt={stories[currentIndex].title}
              className="w-full h-full object-cover"
            />
            
            {/* Fixed dark overlay - no theme dependency */}
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-b-3xl"
              style={{ 
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 80%, transparent 100%)',
                height: '60%'
              }}
            />
            
            <Link
              to={createPageUrl(`AIDetail?id=${stories[currentIndex].ai_service_id}`)}
              className="absolute bottom-0 left-0 right-0 p-10"
            >
              <h2 className="text-3xl font-bold text-white mb-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {stories[currentIndex].title}
              </h2>
              <p className="text-white text-base leading-relaxed mb-6" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {stories[currentIndex].text}
              </p>
              <div 
                className="inline-block px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
              >
                Découvrir →
              </div>
            </Link>

            {/* Download button inside story card */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadForInstagram();
              }}
              className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
              style={{ 
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.5)'
              }}
              title="Télécharger pour Instagram"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </>
      )}
      
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}