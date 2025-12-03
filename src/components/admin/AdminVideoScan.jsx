import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Search, Loader2, Check, X, Play, ExternalLink, Trash2, Plus, Youtube, Languages } from 'lucide-react';
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
  const [translating, setTranslating] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    video_url: '',
    thumbnail_url: '',
    source_name: '',
    duration: '',
    published_date: new Date().toISOString().split('T')[0],
    tags: []
  });
  const [manualTagInput, setManualTagInput] = useState('');
  const queryClient = useQueryClient();

  // Charger les chaînes YouTube enregistrées
  const [showAllChannels, setShowAllChannels] = useState(false);
  
  const { data: youtubeChannels = [] } = useQuery({
    queryKey: ['youtubeChannels'],
    queryFn: () => base44.entities.YouTubeChannel.list(),
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
      
      const today = new Date().toISOString().split('T')[0];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `MISSION: Recherche sur internet les vidéos YouTube RÉCENTES sur l'intelligence artificielle.

Date actuelle: ${today}

ÉTAPE 1 - Recherche Google ces requêtes EXACTES:
- "site:youtube.com ${youtubeChannels.slice(0, 5).map(c => c.name).join(' OR ')}" 
- "site:youtube.com AI news ${today.substring(0, 7)}"
- "site:youtube.com ChatGPT Claude Gemini 2024"

CHAÎNES À RECHERCHER:
${channelsList}

ÉTAPE 2 - Pour CHAQUE vidéo trouvée:
1. Note le VIDEO ID (11 caractères après "watch?v=" ou après "youtu.be/")
2. Construis l'URL: https://www.youtube.com/watch?v=[VIDEO_ID]
3. Construis la thumbnail: https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg

⚠️ RÈGLES ABSOLUES:
- Le video_url DOIT contenir un ID de 11 caractères (lettres, chiffres, - ou _)
- Si tu ne trouves PAS l'ID réel de la vidéo, NE L'INCLUS PAS
- Exemple valide: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- INTERDIT d'inventer des IDs comme "XXXXXXXXXXX" ou "abc123..."

Retourne UNIQUEMENT les vidéos avec des URLs RÉELLES trouvées:
- title: titre en français
- title_en: titre en anglais  
- description: résumé FR (2-3 phrases)
- description_en: résumé EN
- video_url: URL YouTube avec vrai ID
- thumbnail_url: thumbnail YouTube avec même ID
- source_name: nom de la chaîne
- duration: durée estimée
- published_date: YYYY-MM-DD
- tags: 3-5 mots-clés`,
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

      console.log('Résultat du scan:', result);
      
      if (result.videos && result.videos.length > 0) {
        // Filtrer les vidéos avec des URLs valides
        const validVideos = result.videos.filter(v => {
          if (!v.video_url) return false;
          const videoIdMatch = v.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          return videoIdMatch !== null;
        });
        
        // Vérifier les doublons
        const existingUrls = [...discoveries, ...publishedVideos].map(v => v.video_url);
        const newVideos = validVideos.filter(v => !existingUrls.includes(v.video_url));
        
        if (newVideos.length > 0) {
          await base44.entities.AIVideoDiscovery.bulkCreate(
            newVideos.map(v => ({
              ...v,
              status: 'new'
            }))
          );
          toast.success(`${newVideos.length} nouvelle(s) vidéo(s) découverte(s) !`);
        } else {
          toast.info(`${validVideos.length} vidéos trouvées mais déjà présentes ou invalides`);
        }
      } else {
        toast.warning('Aucune vidéo retournée par le scan');
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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setManualForm({
                title: '',
                title_en: '',
                description: '',
                description_en: '',
                video_url: '',
                thumbnail_url: '',
                source_name: '',
                duration: '',
                published_date: new Date().toISOString().split('T')[0],
                tags: []
              });
              setShowManualModal(true);
            }}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Publier manuellement
          </Button>
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
            <div className="space-y-2">
              {(showAllChannels ? youtubeChannels : youtubeChannels.slice(0, 3)).map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">{channel.name}</span>
                    {!channel.active && (
                      <Badge variant="outline" className="text-xs text-slate-400">Inactive</Badge>
                    )}
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
              {youtubeChannels.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllChannels(!showAllChannels)}
                  className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  {showAllChannels ? (
                    <>Voir moins</>
                  ) : (
                    <>+ {youtubeChannels.length - 3} autres chaînes</>
                  )}
                </Button>
              )}
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
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{video.description}</p>
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {video.tags.slice(0, 4).map((tag, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-700 text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {video.video_url && (
                    <p className="text-xs text-slate-400 font-mono truncate mb-3" title={video.video_url}>
                      {video.video_url}
                    </p>
                  )}
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
                    <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.title + ' ' + video.source_name)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Rechercher sur YouTube"
                    >
                      <Button size="sm" variant="outline" className="bg-red-50">
                        <Search className="w-4 h-4 text-red-600" />
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

      {/* Manual Video Modal */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600" />
              Publier une vidéo manuellement
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* URL de la vidéo */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <label className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Video className="w-4 h-4" />
                URL YouTube
              </label>
              <Input
                value={manualForm.video_url}
                onChange={(e) => {
                  const url = e.target.value;
                  setManualForm({...manualForm, video_url: url});
                  // Auto-générer la thumbnail
                  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  if (match) {
                    setManualForm(prev => ({
                      ...prev,
                      video_url: url,
                      thumbnail_url: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
                    }));
                  }
                }}
                className="mt-1 font-mono text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Preview */}
            {manualForm.video_url && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {(() => {
                  const match = manualForm.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  return match ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${match[1]}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Video className="w-16 h-16" />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Titre (FR)</label>
                <Input
                  value={manualForm.title}
                  onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
                  placeholder="Titre en français"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title (EN)</label>
                <Input
                  value={manualForm.title_en}
                  onChange={(e) => setManualForm({...manualForm, title_en: e.target.value})}
                  placeholder="Title in English"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Description (FR)</label>
                <Textarea
                  value={manualForm.description}
                  onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                  rows={3}
                  placeholder="Description en français"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (EN)</label>
                <Textarea
                  value={manualForm.description_en}
                  onChange={(e) => setManualForm({...manualForm, description_en: e.target.value})}
                  rows={3}
                  placeholder="Description in English"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Chaîne</label>
                <Input
                  value={manualForm.source_name}
                  onChange={(e) => setManualForm({...manualForm, source_name: e.target.value})}
                  placeholder="Nom de la chaîne"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Durée</label>
                <Input
                  value={manualForm.duration}
                  onChange={(e) => setManualForm({...manualForm, duration: e.target.value})}
                  placeholder="12:34"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date publication</label>
                <Input
                  type="date"
                  value={manualForm.published_date}
                  onChange={(e) => setManualForm({...manualForm, published_date: e.target.value})}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={manualTagInput}
                  onChange={(e) => setManualTagInput(e.target.value)}
                  placeholder="Ajouter un tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualTagInput.trim()) {
                      e.preventDefault();
                      setManualForm({...manualForm, tags: [...manualForm.tags, manualTagInput.trim()]});
                      setManualTagInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (manualTagInput.trim()) {
                      setManualForm({...manualForm, tags: [...manualForm.tags, manualTagInput.trim()]});
                      setManualTagInput('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {manualForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {manualForm.tags.map((tag, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">
                      {tag}
                      <button
                        onClick={() => setManualForm({...manualForm, tags: manualForm.tags.filter((_, i) => i !== idx)})}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowManualModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  if (!manualForm.video_url || !manualForm.title) {
                    toast.error('URL et titre requis');
                    return;
                  }
                  try {
                    await base44.entities.AIVideoNews.create({
                      ...manualForm,
                      status: 'published'
                    });
                    toast.success('Vidéo publiée !');
                    setShowManualModal(false);
                    queryClient.invalidateQueries({ queryKey: ['publishedVideos'] });
                  } catch (error) {
                    toast.error('Erreur lors de la publication');
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Publier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Channel Modal */}
      <Dialog open={showChannelModal} onOpenChange={setShowChannelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600" />
              Ajouter une chaîne YouTube
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom de la chaîne</label>
              <Input
                placeholder="Ex: Underscore_"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL de la chaîne</label>
              <Input
                placeholder="https://www.youtube.com/@..."
                value={newChannelUrl}
                onChange={(e) => setNewChannelUrl(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Formats acceptés: youtube.com/@handle ou youtube.com/channel/ID
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowChannelModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => addChannelMutation.mutate()}
                disabled={addChannelMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {addChannelMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

              {/* URL de la vidéo - IMPORTANT */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <label className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  URL YouTube (à vérifier/corriger)
                </label>
                <Input
                  value={editForm.video_url}
                  onChange={(e) => setEditForm({...editForm, video_url: e.target.value})}
                  className="mt-1 font-mono text-sm"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Si la vidéo ne s'affiche pas, l'URL est probablement incorrecte. Recherchez la vraie vidéo sur YouTube et collez l'URL ici.
                </p>
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
                  variant="outline"
                  onClick={async () => {
                    setTranslating(true);
                    try {
                      const result = await base44.integrations.Core.InvokeLLM({
                        prompt: `Traduis ce contenu de vidéo YouTube:

Titre original: ${editForm.title_en || editForm.title}
Description originale: ${editForm.description_en || editForm.description}

Retourne:
- title: titre traduit en français (naturel et accrocheur)
- title_en: titre en anglais
- description: description traduite en français (2-3 phrases)
- description_en: description en anglais`,
                        response_json_schema: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            title_en: { type: "string" },
                            description: { type: "string" },
                            description_en: { type: "string" }
                          }
                        }
                      });
                      setEditForm({
                        ...editForm,
                        title: result.title || editForm.title,
                        title_en: result.title_en || editForm.title_en,
                        description: result.description || editForm.description,
                        description_en: result.description_en || editForm.description_en
                      });
                      toast.success('Traduction effectuée !');
                    } catch (error) {
                      toast.error('Erreur de traduction');
                    }
                    setTranslating(false);
                  }}
                  disabled={translating}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  {translating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Languages className="w-4 h-4 mr-2" />
                  )}
                  Traduire
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