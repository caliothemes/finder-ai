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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <Link
              to={createPageUrl(`AIDetail?id=${stories[currentIndex].ai_service_id}`)}
              className="absolute bottom-0 left-0 right-0 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-3">{stories[currentIndex].title}</h2>
              <p className="text-white/90 text-base leading-relaxed mb-4">{stories[currentIndex].text}</p>
              <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium hover:bg-white/30 transition-colors">
                Découvrir →
              </div>
            </Link>
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