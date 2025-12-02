import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Check, X, Eye, ExternalLink, Loader2, Pencil, Save, 
  Trash2, Plus, Newspaper, Globe, Calendar, Sparkles, Upload, Image, Languages, Flame
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNews() {
  const [activeTab, setActiveTab] = useState('articles');
  const [isScanning, setIsScanning] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editingDiscoveryId, setEditingDiscoveryId] = useState(null);
  const [editDiscoveryData, setEditDiscoveryData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(null);
  const [translating, setTranslating] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '', title_en: '', summary: '', summary_en: '', content: '', content_en: '',
    source_name: '', source_url: '', cover_image_url: '', tags: [], status: 'published'
  });
  const queryClient = useQueryClient();

  // Upload image
  const handleImageUpload = async (file, type, id = null) => {
    if (!file) return;
    setUploadingImage(id || 'new');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'article' && editingId) {
        setEditData({ ...editData, cover_image_url: file_url });
      } else if (type === 'discovery' && editingDiscoveryId) {
        setEditDiscoveryData({ ...editDiscoveryData, cover_image_url: file_url });
      } else if (type === 'new') {
        setNewArticle({ ...newArticle, cover_image_url: file_url });
      }
      
      toast.success('Image uploadée !');
    } catch (error) {
      toast.error('Erreur upload: ' + error.message);
    } finally {
      setUploadingImage(null);
    }
  };

  // Auto-translate
  const handleAutoTranslate = async (type) => {
    let translatingId = 'new';
    let textToTranslate = {};
    
    if (type === 'new') {
      translatingId = 'new';
      textToTranslate = { title: newArticle.title, summary: newArticle.summary, content: newArticle.content };
    } else if (type === 'article') {
      translatingId = editingId;
      textToTranslate = { title: editData.title, summary: editData.summary, content: editData.content };
    } else if (type === 'discovery') {
      translatingId = editingDiscoveryId;
      textToTranslate = { title: editDiscoveryData.title, summary: editDiscoveryData.summary };
    }

    if (!textToTranslate.title) {
      toast.error('Veuillez remplir le titre avant de traduire');
      return;
    }

    setTranslating(translatingId);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional translator. Translate the following French text to English. Keep the same tone, style and meaning.

French text to translate:
Title: "${textToTranslate.title}"
Summary: "${textToTranslate.summary || ''}"
${textToTranslate.content ? `Content: "${textToTranslate.content}"` : ''}

Provide accurate English translations.`,
        response_json_schema: {
          type: "object",
          properties: {
            title_en: { type: "string", description: "English translation of the title" },
            summary_en: { type: "string", description: "English translation of the summary" },
            content_en: { type: "string", description: "English translation of the content" }
          },
          required: ["title_en", "summary_en"]
        }
      });

      if (response && response.title_en) {
        if (type === 'new') {
          setNewArticle(prev => ({ 
            ...prev, 
            title_en: response.title_en,
            summary_en: response.summary_en || '',
            content_en: response.content_en || ''
          }));
        } else if (type === 'article') {
          setEditData(prev => ({ 
            ...prev, 
            title_en: response.title_en,
            summary_en: response.summary_en || '',
            content_en: response.content_en || ''
          }));
        } else if (type === 'discovery') {
          setEditDiscoveryData(prev => ({ 
            ...prev, 
            title_en: response.title_en,
            summary_en: response.summary_en || ''
          }));
        }
        toast.success('Traduction automatique effectuée !');
      } else {
        toast.error('Erreur: réponse de traduction invalide');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Erreur traduction: ' + error.message);
    } finally {
      setTranslating(null);
    }
  };

  // Fetch articles
  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['adminNews'],
    queryFn: () => base44.entities.AINews.list('-created_date', 100),
  });

  // Fetch discoveries
  const { data: discoveries = [], isLoading: loadingDiscoveries } = useQuery({
    queryKey: ['newsDiscoveries'],
    queryFn: () => base44.entities.AINewsDiscovery.list('-created_date', 100),
  });

  // Mutations
  const createArticleMutation = useMutation({
    mutationFn: (data) => {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return base44.entities.AINews.create({ ...data, slug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      setShowCreateForm(false);
      setNewArticle({ title: '', title_en: '', summary: '', summary_en: '', content: '', content_en: '', source_name: '', source_url: '', cover_image_url: '', tags: [], status: 'published' });
      toast.success('Article créé !');
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AINews.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      setEditingId(null);
      toast.success('Article mis à jour');
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.AINews.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      toast.success('Article supprimé');
    },
  });

  const updateDiscoveryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AINewsDiscovery.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsDiscoveries'] });
      setEditingDiscoveryId(null);
      toast.success('Découverte mise à jour');
    },
  });

  const approveDiscoveryMutation = useMutation({
    mutationFn: async (discovery) => {
      const slug = discovery.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      const articleData = {
        title: discovery.title,
        title_en: discovery.title_en || '',
        slug,
        summary: discovery.summary || '',
        summary_en: discovery.summary_en || '',
        content: discovery.content || '',
        content_en: discovery.content_en || '',
        source_name: discovery.source_name,
        source_url: discovery.source_url,
        source_logo_url: discovery.source_logo_url || '',
        cover_image_url: discovery.cover_image_url || '',
        published_date: discovery.published_date,
        tags: discovery.tags || [],
        status: 'published'
      };

      const newArticle = await base44.entities.AINews.create(articleData);
      await base44.entities.AINewsDiscovery.update(discovery.id, {
        status: 'approved',
        ai_news_id: newArticle.id
      });

      return newArticle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews'] });
      queryClient.invalidateQueries({ queryKey: ['newsDiscoveries'] });
      setEditingDiscoveryId(null);
      toast.success('Article publié !');
    },
  });

  const dismissDiscoveryMutation = useMutation({
    mutationFn: (id) => base44.entities.AINewsDiscovery.update(id, { status: 'dismissed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsDiscoveries'] });
      toast.success('Article rejeté');
    },
  });

  const triggerScanMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      const response = await base44.functions.invoke('scanAINews');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['newsDiscoveries'] });
      setIsScanning(false);
      toast.success(`${data.discovered} articles découverts !`);
    },
    onError: (error) => {
      setIsScanning(false);
      toast.error('Erreur: ' + error.message);
    }
  });

  const newDiscoveriesCount = discoveries.filter(d => d.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-purple-600" />
            Actualités IA
          </h2>
          <p className="text-slate-600">Gérez les articles et découvertes</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => triggerScanMutation.mutate()}
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scan en cours...</>
            ) : (
              <><Search className="w-4 h-4 mr-2" />Scanner les news</>
            )}
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />Créer un article
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{articles.length}</div>
            <div className="text-sm text-slate-600">Articles publiés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {articles.filter(a => a.status === 'published').length}
            </div>
            <div className="text-sm text-slate-600">En ligne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{newDiscoveriesCount}</div>
            <div className="text-sm text-slate-600">À valider</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
            </div>
            <div className="text-sm text-slate-600">Vues totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle>Créer un article</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Français */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">🇫🇷 Français</label>
              <Input
                placeholder="Titre de l'article"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
              <Textarea
                placeholder="Résumé (2-3 phrases)"
                value={newArticle.summary}
                onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                rows={2}
              />
              <Textarea
                placeholder="Contenu complet (optionnel)"
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                rows={3}
              />
            </div>
            
            {/* Bouton traduction auto */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAutoTranslate('new')}
              disabled={translating === 'new' || !newArticle.title}
              className="w-full"
            >
              {translating === 'new' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduction en cours...</>
              ) : (
                <><Languages className="w-4 h-4 mr-2" />Traduire automatiquement en anglais</>
              )}
            </Button>

            {/* Anglais */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">🇬🇧 English</label>
              <Input
                placeholder="Article title"
                value={newArticle.title_en}
                onChange={(e) => setNewArticle({ ...newArticle, title_en: e.target.value })}
              />
              <Textarea
                placeholder="Summary (2-3 sentences)"
                value={newArticle.summary_en}
                onChange={(e) => setNewArticle({ ...newArticle, summary_en: e.target.value })}
                rows={2}
              />
              <Textarea
                placeholder="Full content (optional)"
                value={newArticle.content_en}
                onChange={(e) => setNewArticle({ ...newArticle, content_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nom de la source (ex: TechCrunch)"
                value={newArticle.source_name}
                onChange={(e) => setNewArticle({ ...newArticle, source_name: e.target.value })}
              />
              <Input
                placeholder="URL de l'article source"
                value={newArticle.source_url}
                onChange={(e) => setNewArticle({ ...newArticle, source_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="URL de l'image de couverture"
                  value={newArticle.cover_image_url}
                  onChange={(e) => setNewArticle({ ...newArticle, cover_image_url: e.target.value })}
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'new')}
                  />
                  <Button type="button" variant="outline" asChild disabled={uploadingImage === 'new'}>
                    <span>
                      {uploadingImage === 'new' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Upload className="w-4 h-4 mr-1" />Upload</>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
              {newArticle.cover_image_url && (
                <img src={newArticle.cover_image_url} alt="Preview" className="w-32 h-20 rounded object-cover" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createArticleMutation.mutate(newArticle)}
                disabled={!newArticle.title || !newArticle.source_name || !newArticle.source_url}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />Publier
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="articles">
            Articles ({articles.length})
          </TabsTrigger>
          <TabsTrigger value="discoveries" className="relative">
            Découvertes
            {newDiscoveriesCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                {newDiscoveriesCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="relative">
            <Flame className="w-4 h-4 mr-1 text-orange-500" />
            Actu importantes
            {articles.filter(a => a.weekly_highlight).length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {articles.filter(a => a.weekly_highlight).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          {loadingArticles ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Aucun article. Lancez un scan ou créez un article manuellement.
            </div>
          ) : (
            articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {article.cover_image_url && (
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-32 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      {editingId === article.id ? (
                        <div className="space-y-3">
                          {/* Français */}
                          <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                            <label className="text-sm font-medium flex items-center gap-2">🇫🇷 Français</label>
                            <Input
                              placeholder="Titre"
                              value={editData.title}
                              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            />
                            <Textarea
                              placeholder="Résumé"
                              value={editData.summary}
                              onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                              rows={2}
                            />
                          </div>
                          
                          {/* Bouton traduction */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoTranslate('article')}
                            disabled={translating === editingId || !editData.title}
                            className="w-full"
                          >
                            {translating === editingId ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduction...</>
                            ) : (
                              <><Languages className="w-4 h-4 mr-2" />Traduire en anglais</>
                            )}
                          </Button>

                          {/* Anglais */}
                          <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                            <label className="text-sm font-medium flex items-center gap-2">🇬🇧 English</label>
                            <Input
                              placeholder="Title"
                              value={editData.title_en || ''}
                              onChange={(e) => setEditData({ ...editData, title_en: e.target.value })}
                            />
                            <Textarea
                              placeholder="Summary"
                              value={editData.summary_en || ''}
                              onChange={(e) => setEditData({ ...editData, summary_en: e.target.value })}
                              rows={2}
                            />
                          </div>

                          {/* Image de couverture */}
                          <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Image className="w-4 h-4" />
                              Image de couverture
                            </label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="URL de l'image"
                                value={editData.cover_image_url || ''}
                                onChange={(e) => setEditData({ ...editData, cover_image_url: e.target.value })}
                                className="flex-1"
                              />
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e.target.files[0], 'article', editingId)}
                                />
                                <Button type="button" variant="outline" asChild disabled={uploadingImage === editingId}>
                                  <span>
                                    {uploadingImage === editingId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <><Upload className="w-4 h-4 mr-1" />Upload</>
                                    )}
                                  </span>
                                </Button>
                              </label>
                            </div>
                            {editData.cover_image_url && (
                              <img src={editData.cover_image_url} alt="Preview" className="w-48 h-28 rounded-lg object-cover border" />
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updateArticleMutation.mutate({ id: article.id, data: editData })}>
                              <Save className="w-4 h-4 mr-1" />Sauvegarder
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900">{article.title}</h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                {article.source_logo_url && (
                                  <img src={article.source_logo_url} alt="" className="w-4 h-4" />
                                )}
                                <span>{article.source_name}</span>
                                <span>•</span>
                                <span>{article.published_date || 'Non daté'}</span>
                                <span>•</span>
                                <span>{article.views || 0} vues</span>
                              </div>
                            </div>
                            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                              {article.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{article.summary}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(article.id); setEditData(article); }}>
                              <Pencil className="w-4 h-4 mr-1" />Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant={article.weekly_highlight ? "default" : "outline"}
                              className={article.weekly_highlight ? "bg-orange-500 hover:bg-orange-600" : ""}
                              onClick={() => updateArticleMutation.mutate({
                                id: article.id,
                                data: { weekly_highlight: !article.weekly_highlight }
                              })}
                            >
                              <Flame className="w-4 h-4 mr-1" />
                              {article.weekly_highlight ? 'Actu importante ✓' : 'Marquer important'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateArticleMutation.mutate({
                                id: article.id,
                                data: { status: article.status === 'published' ? 'unpublished' : 'published' }
                              })}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {article.status === 'published' ? 'Dépublier' : 'Publier'}
                            </Button>
                            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline">
                                <ExternalLink className="w-4 h-4 mr-1" />Source
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => {
                                if (confirm('Supprimer cet article ?')) {
                                  deleteArticleMutation.mutate(article.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />Supprimer
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Weekly Highlights Tab */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-bold text-slate-900">Actualités importantes de la semaine</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Les 5 dernières actualités marquées comme "importantes" seront affichées dans le module spécial sur la page Actualités (1 en aperçu + 4 en grille).
            </p>
          </div>

          {articles.filter(a => a.weekly_highlight).length === 0 ? (
            <div className="text-center py-12">
              <Flame className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune actualité importante sélectionnée</p>
              <p className="text-sm text-slate-400 mt-2">
                Allez dans l'onglet "Articles" et cliquez sur "Marquer important" pour ajouter des actualités ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles
                .filter(a => a.weekly_highlight)
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                .map((article, index) => (
                  <Card key={article.id} className={index < 5 ? "border-orange-300 bg-orange-50/50" : "border-slate-200 opacity-60"}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-4">
                        {article.cover_image_url && (
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-20 h-14 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {index < 5 ? (
                              <Badge className="bg-orange-500 text-white">Affiché #{index + 1}</Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500">Non affiché</Badge>
                            )}
                            <span className="text-xs text-slate-500">{article.published_date}</span>
                          </div>
                          <h4 className="font-medium text-slate-900 mt-1">{article.title}</h4>
                          <p className="text-sm text-slate-500">{article.source_name}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => updateArticleMutation.mutate({
                            id: article.id,
                            data: { weekly_highlight: false }
                          })}
                        >
                          <X className="w-4 h-4 mr-1" />Retirer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Discoveries Tab */}
        <TabsContent value="discoveries" className="space-y-4">
          {loadingDiscoveries ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : discoveries.filter(d => d.status === 'new').length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune découverte en attente</p>
              <Button
                onClick={() => triggerScanMutation.mutate()}
                disabled={isScanning}
                className="mt-4"
              >
                <Search className="w-4 h-4 mr-2" />Lancer un scan
              </Button>
            </div>
          ) : (
            discoveries.filter(d => d.status === 'new').map((discovery) => (
              <Card key={discovery.id} className="border-orange-200 bg-orange-50/30">
                <CardContent className="pt-6">
                  {editingDiscoveryId === discovery.id ? (
                    /* Mode édition */
                    <div className="space-y-4">
                      {/* Français */}
                      <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                        <label className="text-sm font-medium flex items-center gap-2">🇫🇷 Français</label>
                        <Input
                          placeholder="Titre"
                          value={editDiscoveryData.title}
                          onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Résumé"
                          value={editDiscoveryData.summary}
                          onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, summary: e.target.value })}
                          rows={2}
                        />
                      </div>
                      
                      {/* Bouton traduction auto */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoTranslate('discovery')}
                        disabled={translating === editingDiscoveryId || !editDiscoveryData.title}
                        className="w-full"
                      >
                        {translating === editingDiscoveryId ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traduction...</>
                        ) : (
                          <><Languages className="w-4 h-4 mr-2" />Traduire en anglais</>
                        )}
                      </Button>

                      {/* Anglais */}
                      <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                        <label className="text-sm font-medium flex items-center gap-2">🇬🇧 English</label>
                        <Input
                          placeholder="Title"
                          value={editDiscoveryData.title_en || ''}
                          onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, title_en: e.target.value })}
                        />
                        <Textarea
                          placeholder="Summary"
                          value={editDiscoveryData.summary_en || ''}
                          onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, summary_en: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Nom de la source"
                          value={editDiscoveryData.source_name}
                          onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, source_name: e.target.value })}
                        />
                        <Input
                          placeholder="URL source"
                          value={editDiscoveryData.source_url}
                          onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, source_url: e.target.value })}
                        />
                      </div>
                      
                      {/* Image de couverture */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Image de couverture
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="URL de l'image"
                            value={editDiscoveryData.cover_image_url || ''}
                            onChange={(e) => setEditDiscoveryData({ ...editDiscoveryData, cover_image_url: e.target.value })}
                            className="flex-1"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e.target.files[0], 'discovery', discovery.id)}
                            />
                            <Button type="button" variant="outline" asChild disabled={uploadingImage === discovery.id}>
                              <span>
                                {uploadingImage === discovery.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <><Upload className="w-4 h-4 mr-1" />Upload</>
                                )}
                              </span>
                            </Button>
                          </label>
                        </div>
                        {editDiscoveryData.cover_image_url && (
                          <img 
                            src={editDiscoveryData.cover_image_url} 
                            alt="Preview" 
                            className="w-48 h-28 rounded-lg object-cover border"
                          />
                        )}
                      </div>

                      <Input
                        placeholder="Tags (séparés par des virgules)"
                        value={(editDiscoveryData.tags || []).join(', ')}
                        onChange={(e) => setEditDiscoveryData({ 
                          ...editDiscoveryData, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                        })}
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            updateDiscoveryMutation.mutate({ id: discovery.id, data: editDiscoveryData });
                          }}
                        >
                          <Save className="w-4 h-4 mr-1" />Sauvegarder
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveDiscoveryMutation.mutate(editDiscoveryData)}
                        >
                          <Check className="w-4 h-4 mr-1" />Sauvegarder & Publier
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingDiscoveryId(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Mode affichage */
                    <div className="flex gap-4">
                      {discovery.cover_image_url && (
                        <img
                          src={discovery.cover_image_url}
                          alt={discovery.title}
                          className="w-32 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{discovery.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                              {discovery.source_logo_url && (
                                <img src={discovery.source_logo_url} alt="" className="w-4 h-4" />
                              )}
                              <Globe className="w-4 h-4" />
                              <span>{discovery.source_name}</span>
                              {discovery.published_date && (
                                <>
                                  <span>•</span>
                                  <Calendar className="w-4 h-4" />
                                  <span>{discovery.published_date}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-orange-100">Nouveau</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{discovery.summary}</p>
                        {discovery.tags?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {discovery.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingDiscoveryId(discovery.id);
                              setEditDiscoveryData({ ...discovery });
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-1" />Modifier
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveDiscoveryMutation.mutate(discovery)}
                          >
                            <Check className="w-4 h-4 mr-1" />Publier
                          </Button>
                          <a href={discovery.source_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4 mr-1" />Voir
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => dismissDiscoveryMutation.mutate(discovery.id)}
                          >
                            <X className="w-4 h-4 mr-1" />Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}