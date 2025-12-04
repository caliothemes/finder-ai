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
      toast.info('Génération de la story...');

      // Story dimensions (9:16 ratio for Instagram)
      const width = 1080;
      const height = 1920;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Load and draw background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = story.image_url;
      });

      // Draw image covering full canvas
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imgRatio;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgRatio;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Draw dark gradient overlay at bottom
      const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.3, 'rgba(0,0,0,0.4)');
      gradient.addColorStop(0.6, 'rgba(0,0,0,0.7)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Text settings
      const padding = 80;
      const maxWidth = width - (padding * 2);
      let currentY = height - 200;

      // Helper function to wrap text
      const wrapText = (text, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // Draw description text first (to calculate position for title)
      ctx.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'left';
      
      const descLines = wrapText(story.text || '', maxWidth);
      const descLineHeight = 56;
      
      // Calculate total text height
      const titleFont = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.font = titleFont;
      const titleLines = wrapText(story.title, maxWidth);
      const titleLineHeight = 90;
      
      const totalTextHeight = (titleLines.length * titleLineHeight) + 40 + (descLines.length * descLineHeight) + 100;
      currentY = height - totalTextHeight;

      // Draw title with shadow
      ctx.font = titleFont;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      titleLines.forEach((line, i) => {
        ctx.fillText(line, padding, currentY + (i * titleLineHeight));
      });

      currentY += titleLines.length * titleLineHeight + 40;

      // Draw description
      ctx.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 10;

      descLines.forEach((line, i) => {
        ctx.fillText(line, padding, currentY + (i * descLineHeight));
      });

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw "Découvrir →" button
      currentY += descLines.length * descLineHeight + 50;
      const buttonText = 'Découvrir →';
      ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const buttonWidth = ctx.measureText(buttonText).width + 60;
      const buttonHeight = 70;

      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.roundRect(padding, currentY - 45, buttonWidth, buttonHeight, 35);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(buttonText, padding + 30, currentY);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `story-${story.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        toast.success('Story téléchargée !');
      }, 'image/png', 1);

    } catch (error) {
      console.error('Download error:', error);
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
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-3xl overflow-hidden mx-4" style={{ aspectRatio: '9/16', maxHeight: 'calc(100vh - 120px)' }}>
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