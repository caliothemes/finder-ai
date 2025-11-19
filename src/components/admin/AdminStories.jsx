import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStories() {
  const [previewStory, setPreviewStory] = useState(null);
  const queryClient = useQueryClient();

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
          <div className="relative w-full max-w-md aspect-[9/16] rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={previewStory.image_url} alt={previewStory.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <button
              onClick={() => setPreviewStory(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{previewStory.title}</h2>
              <p className="text-white/90 text-sm leading-relaxed">{previewStory.text}</p>
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