import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, Trash2, X, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStories() {
  const [previewStory, setPreviewStory] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const queryClient = useQueryClient();

  const handleDownloadStory = async (story) => {
    if (!story) return;

    try {
      setIsDownloading(true);
      toast.info('Génération de la story...');

      const width = 1080;
      const height = 1920;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = story.image_url;
      });

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

      const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.3, 'rgba(0,0,0,0.4)');
      gradient.addColorStop(0.6, 'rgba(0,0,0,0.7)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const padding = 80;
      const maxWidth = width - (padding * 2);

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

      ctx.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'left';
      
      const descLines = wrapText(story.text || '', maxWidth);
      const descLineHeight = 56;
      
      const titleFont = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.font = titleFont;
      const titleLines = wrapText(story.title, maxWidth);
      const titleLineHeight = 90;
      
      const totalTextHeight = (titleLines.length * titleLineHeight) + 40 + (descLines.length * descLineHeight) + 100;
      let currentY = height - totalTextHeight;

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

      ctx.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 10;

      descLines.forEach((line, i) => {
        ctx.fillText(line, padding, currentY + (i * descLineHeight));
      });

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

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

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `story-${story.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        setIsDownloading(false);
        toast.success('Story téléchargée !');
      }, 'image/png', 1);

    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const { data: aiServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['aiServices'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }),
  });

  const { data: stories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('-created_date'),
  });

  const createStoryMutation = useMutation({
    mutationFn: async (service) => {
      const descriptionPreview = service.description?.substring(0, 120) || service.tagline || '';
      
      await base44.entities.Story.create({
        ai_service_id: service.id,
        title: service.name,
        text: descriptionPreview,
        image_url: service.cover_image_url || service.logo_url || '',
        active: true,
        views: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Story créée');
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId) => base44.entities.Story.delete(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Story supprimée');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ storyId, active }) => base44.entities.Story.update(storyId, { active: !active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  if (servicesLoading || storiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const servicesWithStories = aiServices.map(service => ({
    ...service,
    hasStory: stories.some(s => s.ai_service_id === service.id)
  }));

  return (
    <div className="space-y-6">
      {/* Active Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Stories Actives ({stories.filter(s => s.active).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stories.filter(s => s.active).map((story) => (
              <div key={story.id} className="relative group">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border-4 border-purple-500 cursor-pointer hover:scale-105 transition-transform"
                     onClick={() => setPreviewStory(story)}>
                  <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm mb-1 truncate">{story.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Eye className="w-3 h-3" />
                      <span>{story.views}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => deleteStoryMutation.mutate(story.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services AI List */}
      <Card>
        <CardHeader>
          <CardTitle>Services IA - Créer des Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {servicesWithStories.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3 flex-1">
                  {service.logo_url && (
                    <img src={service.logo_url} alt={service.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{service.tagline}</p>
                  </div>
                </div>
                {service.hasStory ? (
                  <Badge className="bg-green-100 text-green-800">Story créée</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => createStoryMutation.mutate(service)}
                    disabled={createStoryMutation.isPending}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Créer Story
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewStory && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setPreviewStory(null)}>
          <div 
            className="relative w-full max-w-xs sm:max-w-sm rounded-3xl overflow-hidden" 
            style={{ aspectRatio: '9/16', maxHeight: 'calc(100vh - 100px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewStory.image_url} alt={previewStory.title} className="w-full h-full object-cover" />
            
            {/* Fixed dark overlay */}
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-b-3xl"
              style={{ 
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 80%, transparent 100%)',
                height: '60%'
              }}
            />
            
            {/* Close button */}
            <button
              onClick={() => setPreviewStory(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Download button */}
            <button
              onClick={() => handleDownloadStory(previewStory)}
              disabled={isDownloading}
              className="absolute top-4 right-16 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10 disabled:opacity-50"
              style={{ 
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.5)'
              }}
              title="Télécharger pour Instagram"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <h2 className="text-2xl font-bold text-white mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {previewStory.title}
              </h2>
              <p className="text-white text-sm leading-relaxed mb-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {previewStory.text}
              </p>
              <div 
                className="inline-block px-5 py-2.5 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
              >
                Découvrir →
              </div>
              <div className="flex items-center gap-2 mt-4 text-white/70 text-sm">
                <Eye className="w-4 h-4" />
                <span>{previewStory.views} vues</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}