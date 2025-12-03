import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Search, Loader2, Check, X, Play, ExternalLink, Trash2, RefreshCw, Plus, Youtube, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminVideoScan() {
  const [scanning, setScanning] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const queryClient = useQueryClient();

  // Charger les chaînes YouTube enregistrées
  const { data: youtubeChannels = [] } = useQuery({
    queryKey: ['youtubeChannels'],
    queryFn: () => base44.entities.YouTubeChannel.filter({ active: true }),
  });

  const { data: discoveries = [], isLoading } = useQuery({
    queryKey: ['videoDiscoveries'],
    queryFn: () => base44.entities.AIVideoDiscovery.filter({ status: 'new' }, '-created_date'),
  });

  const { data: publishedVideos = [] } = useQuery({
    queryKey: ['publishedVideos'],
    queryFn: () => base44.entities.AIVideoNews.filter({ status: 'published' }, '-created_date', 50),
  });

  // Mutations pour gérer les chaînes
  const addChannelMutation = useMutation({
    mutationFn: async () => {
      if (!newChannelUrl || !newChannelName) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
      
      // Extraire l'ID ou handle de la chaîne
      let channelId = '';
      if (newChannelUrl.includes('@')) {
        channelId = newChannelUrl.split('@')[1]?.split('/')[0] || '';
      } else if (newChannelUrl.includes('/channel/')) {
        channelId = newChannelUrl.split('/channel/')[1]?.split('/')[0] || '';
      }
      
      await base44.entities.YouTubeChannel.create({
        name: newChannelName,
        url: newChannelUrl,
        channel_id: channelId,
        active: true
      });
      
      toast.success('Chaîne ajoutée !');
      setNewChannelUrl('');
      setNewChannelName('');
      setShowChannelModal(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubeChannels'] });
    }
  });

  const toggleChannelMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      await base44.entities.YouTubeChannel.update(id, { active });
      toast.success(active ? 'Chaîne activée' : 'Chaîne désactivée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubeChannels'] });
    }
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.YouTubeChannel.delete(id);
      toast.success('Chaîne supprimée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubeChannels'] });
    }
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      setScanning(true);
      
      // Construire la liste des chaînes à scanner
      const channelsList = youtubeChannels.length > 0 
        ? youtubeChannels.map((ch, i) => `${i + 1}. ${ch.name} (${ch.url})`).join('\n')
        : `1. Underscore_ (https://www.youtube.com/channel/UCx_N9LnjjK6DSvOd26heuQw)
2. VisionIA-FR (https://www.youtube.com/@VisionIA-FR)
3. Explor_IA (https://www.youtube.com/@Explor_IA)
4. malvaAI (https://www.youtube.com/@malvaAI)`;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Recherche les 10 dernières vidéos YouTube populaires et récentes sur l'intelligence artificielle, ChatGPT, les outils IA, l'actualité IA. 
        
        IMPORTANT - Recherche EN PRIORITÉ sur ces chaînes YouTube spécifiques:
${channelsList}
        
        Puis complète avec d'autres chaînes tech populaires si nécessaire.
        
        Privilégie:
        - Les vidéos des 14 derniers jours
        - Les tutoriels, actualités, reviews d'outils IA
        - Les annonces importantes sur l'IA
        
        Pour chaque vidéo trouvée, fournis:
        - title: titre en français
        - title_en: titre en anglais
        - description: description courte en français (2-3 phrases résumant le contenu)
        - description_en: description courte en anglais  
        - video_url: URL YouTube complète (format https://www.youtube.com/watch?v=VIDEO_ID)
        - thumbnail_url: URL de la miniature (format https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)
        - source_name: nom de la chaîne
        - duration: durée estimée
        - published_date: date de publication (format YYYY-MM-DD)
        - tags: tableau de 3-5 tags pertinents`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            videos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  title_en: { type: "string" },
                  description: { type: "string" },
                  description_en: { type: "string" },
                  video_url: { type: "string" },
                  thumbnail_url: { type: "string" },
                  source_name: { type: "string" },
                  duration: { type: "string" },
                  published_date: { type: "string" },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      if (result.videos && result.videos.length > 0) {
        // Vérifier les doublons
        const existingUrls = [...discoveries, ...publishedVideos].map(v => v.video_url);
        const newVideos = result.videos.filter(v => !existingUrls.includes(v.video_url));
        
        if (newVideos.length > 0) {
          await base44.entities.AIVideoDiscovery.bulkCreate(
            newVideos.map(v => ({
              ...v,
              status: 'new'
            }))
          );
          toast.success(`${newVideos.length} nouvelle(s) vidéo(s) découverte(s) !`);
        } else {
          toast.info('Aucune nouvelle vidéo trouvée');
        }
      }
      
      setScanning(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoDiscoveries'] });
    },
    onError: () => {
      setScanning(false);
      toast.error('Erreur lors du scan');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (video) => {
      const newVideo = await base44.entities.AIVideoNews.create({
        title: video.title,
        title_en: video.title_en,
        description: video.description,
        description_en: video.description_en,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        source_name: video.source_name,
        duration: video.duration,
        published_date: video.published_date,
        tags: video.tags,
        status: 'published'
      });

      await base44.entities.AIVideoDiscovery.update(video.id, {
        status: 'approved',
        ai_video_id: newVideo.id
      });

      toast.success('Vidéo publiée !');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoDiscoveries'] });
      queryClient.invalidateQueries({ queryKey: ['publishedVideos'] });
      setSelectedVideo(null);
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.AIVideoDiscovery.update(id, { status: 'dismissed' });
      toast.success('Vidéo ignorée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoDiscoveries'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.AIVideoNews.delete(id);
      toast.success('Vidéo supprimée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedVideos'] });
    }
  });

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const openApprovalModal = (video) => {
    setEditForm({
      title: video.title || '',
      title_en: video.title_en || '',
      description: video.description || '',
      description_en: video.description_en || '',
      video_url: video.video_url || '',
      thumbnail_url: video.thumbnail_url || '',
      source_name: video.source_name || '',
      duration: video.duration || '',
      published_date: video.published_date || '',
      tags: video.tags || []
    });
    setSelectedVideo(video);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Scan Vidéos Actualités IA</h2>
        </div>
        <Button
          onClick={() => scanMutation.mutate()}
          disabled={scanning}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          {scanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scan en cours...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Lancer le scan
            </>
          )}
        </Button>
      </div>

      {/* Chaînes YouTube */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600" />
              Chaînes YouTube ({youtubeChannels.length})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowChannelModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {youtubeChannels.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Aucune chaîne ajoutée. Le scan utilisera les chaînes par défaut.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {youtubeChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={channel.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteChannelMutation.mutate(channel.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{discoveries.length}</div>
            <div className="text-sm text-slate-600">En attente de validation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{publishedVideos.length}</div>
            <div className="text-sm text-slate-600">Vidéos publiées</div>
          </CardContent>
        </Card>
      </div>

      {/* Discoveries */}
      {discoveries.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Vidéos à valider</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {discoveries.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative aspect-video bg-slate-100">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  {video.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-2 mb-2">{video.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{video.source_name}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{video.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openApprovalModal(video)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissMutation.mutate(video.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Published Videos */}
      {publishedVideos.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Vidéos publiées</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {publishedVideos.slice(0, 6).map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative aspect-video bg-slate-100">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 mb-2">{video.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{video.source_name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(video.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Valider et publier la vidéo</DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {getYouTubeEmbedUrl(editForm.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(editForm.video_url)}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Video className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titre (FR)</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title (EN)</label>
                  <Input
                    value={editForm.title_en}
                    onChange={(e) => setEditForm({...editForm, title_en: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Description (FR)</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (EN)</label>
                  <Textarea
                    value={editForm.description_en}
                    onChange={(e) => setEditForm({...editForm, description_en: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Chaîne</label>
                  <Input
                    value={editForm.source_name}
                    onChange={(e) => setEditForm({...editForm, source_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Durée</label>
                  <Input
                    value={editForm.duration}
                    onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date publication</label>
                  <Input
                    type="date"
                    value={editForm.published_date}
                    onChange={(e) => setEditForm({...editForm, published_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                  Annuler
                </Button>
                <Button
                  onClick={() => approveMutation.mutate({...selectedVideo, ...editForm})}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Publier la vidéo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}