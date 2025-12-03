import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, Check, X, Eye, ExternalLink, 
  Loader2, Pencil, Save, AlertCircle, Sparkles, Plus, Trash2, Upload, Languages, Tags
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminAISearchScan() {
  const { theme } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [approvingDiscovery, setApprovingDiscovery] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const queryClient = useQueryClient();

  const { data: discoveries = [], isLoading } = useQuery({
    queryKey: ['discoveries'],
    queryFn: () => base44.entities.AIServiceDiscovery.list('-created_date', 2000),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const updateDiscoveryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIServiceDiscovery.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      setEditingId(null);
      if (variables.data.status === 'dismissed') {
        toast.success('Service rejeté');
      } else if (variables.data.status === 'reviewed') {
        toast.success('Marqué comme vu');
      } else {
        toast.success('Découverte mise à jour');
      }
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  // Check for duplicates before approving
  const checkForDuplicates = (formData, discovery, categories) => {
    const nameToCheck = formData.name.toLowerCase().trim();
    
    // Find services with similar names
    const duplicates = existingServices.filter(service => {
      const existingName = service.name.toLowerCase().trim();
      // Exact match or very similar
      return existingName === nameToCheck || 
             existingName.includes(nameToCheck) || 
             nameToCheck.includes(existingName);
    });

    if (duplicates.length > 0) {
      setDuplicateServices(duplicates);
      setPendingApproval({ discovery, categories, formData });
      setShowDuplicateModal(true);
      return true;
    }
    return false;
  };

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.AIService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['existingAIServices'] });
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      toast.success('Service supprimé');
    },
  });

  const approveDiscoveryMutation = useMutation({
    mutationFn: async ({ discovery, categories, formData }) => {
      const slug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const aiServiceData = {
        name: formData.name,
        slug: slug,
        tagline: formData.tagline || '',
        tagline_en: formData.tagline_en || '',
        description: formData.description || '',
        description_en: formData.description_en || '',
        categories: categories,
        logo_url: formData.logo_url || '',
        cover_image_url: formData.cover_image_url || '',
        website_url: formData.website_url,
        pricing: formData.pricing || 'freemium',
        features: formData.features || [],
        features_en: formData.features_en || [],
        tags: formData.tags || [],
        status: 'approved',
        submitted_by: 'ai_scanner'
      };

      const newService = await base44.entities.AIService.create(aiServiceData);
      
      await base44.entities.AIServiceDiscovery.update(discovery.id, {
        status: 'approved',
        ai_service_id: newService.id
      });

      return newService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      queryClient.invalidateQueries({ queryKey: ['existingAIServices'] });
      setApprovingDiscovery(null);
      setSelectedCategories([]);
      setApproveFormData({});
      setShowDuplicateModal(false);
      setPendingApproval(null);
      setDuplicateServices([]);
      toast.success('Service IA créé et approuvé !');
    },
  });

  const triggerScanMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      const response = await base44.functions.invoke('dailyAIScan');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      setIsScanning(false);
      toast.success(`Scan terminé ! ${data.discovered} nouveau(x) service(s) découvert(s).`);
    },
    onError: (error) => {
      setIsScanning(false);
      toast.error('Erreur lors du scan: ' + error.message);
    }
  });

  const handleStatusChange = (id, status) => {
    updateDiscoveryMutation.mutate({ 
      id, 
      data: { status } 
    });
  };

  const handleEdit = (discovery) => {
    setEditingId(discovery.id);
    setEditData(discovery);
  };

  const handleSave = () => {
    updateDiscoveryMutation.mutate({
      id: editingId,
      data: editData
    });
  };

  const [approveFormData, setApproveFormData] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const handleApprove = (discovery) => {
    if (!discovery.name || !discovery.website_url) {
      toast.error('Nom et URL sont requis');
      return;
    }
    setApprovingDiscovery(discovery);
    setSelectedCategories(discovery.suggested_categories || []);
    setApproveFormData({
      name: discovery.name || '',
      tagline: discovery.tagline || '',
      tagline_en: '',
      description: discovery.description || '',
      description_en: '',
      website_url: discovery.website_url || '',
      pricing: discovery.suggested_pricing || 'freemium',
      logo_url: discovery.logo_url || '',
      cover_image_url: discovery.cover_image_url || '',
      features: discovery.features || [],
      features_en: [],
      tags: discovery.tags || [],
    });
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingCover(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setApproveFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'cover_image_url']: file_url
      }));
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur upload');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!approveFormData.tagline && !approveFormData.description && (!approveFormData.features || approveFormData.features.length === 0)) {
      toast.error('Aucun contenu français à traduire');
      return;
    }

    setIsTranslating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following French content to English. Return ONLY a valid JSON object with the translated fields.

French content:
- Tagline: "${approveFormData.tagline || ''}"
- Description: "${approveFormData.description || ''}"
- Features: ${JSON.stringify(approveFormData.features || [])}

Return JSON format:
{
  "tagline_en": "translated tagline",
  "description_en": "translated description", 
  "features_en": ["feature 1", "feature 2", ...]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            tagline_en: { type: "string" },
            description_en: { type: "string" },
            features_en: { type: "array", items: { type: "string" } }
          }
        }
      });

      setApproveFormData(prev => ({
        ...prev,
        tagline_en: response.tagline_en || prev.tagline_en,
        description_en: response.description_en || prev.description_en,
        features_en: response.features_en || prev.features_en
      }));
      
      toast.success('Traduction automatique effectuée !');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAutoGenerateCover = async () => {
    if (!approveFormData.name) {
      toast.error('Nom requis pour générer une image');
      return;
    }
    
    setFetchingCover(true);
    try {
      // D'abord essayer de récupérer depuis le site web
      if (approveFormData.website_url) {
        const ogResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(approveFormData.website_url)}&meta=true`);
        const ogData = await ogResponse.json();
        
        if (ogData?.data?.image?.url) {
          setApproveFormData({ ...approveFormData, cover_image_url: ogData.data.image.url });
          toast.success('Image trouvée sur le site !');
          setFetchingCover(false);
          return;
        } else if (ogData?.data?.logo?.url && !approveFormData.logo_url) {
          setApproveFormData({ ...approveFormData, logo_url: ogData.data.logo.url });
        }
      }
      
      // Sinon générer avec l'IA
      toast.info('Aucune image trouvée, génération IA en cours...');
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: `Professional modern banner for AI tool "${approveFormData.name}". ${approveFormData.tagline || 'Innovative AI technology'}. Abstract futuristic design with gradient colors (purple, pink, blue, cyan), neural network patterns, geometric shapes, technology aesthetic, clean minimal style, high quality digital art. No text, no logos, no words.`
      });
      
      if (imageResult?.url) {
        setApproveFormData({ ...approveFormData, cover_image_url: imageResult.url });
        toast.success('Image générée avec succès !');
      } else {
        toast.error('Impossible de générer une image');
      }
    } catch (error) {
      console.error('Cover generation error:', error);
      toast.error('Erreur lors de la génération: ' + error.message);
    } finally {
      setFetchingCover(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!approveFormData.name && !approveFormData.description) {
      toast.error('Nom ou description requis pour générer les tags');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const categoryNames = selectedCategories
        .map(catId => categories.find(c => c.id === catId)?.name)
        .filter(Boolean);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate relevant search tags/keywords for this AI tool. Tags should be in French and help users find this tool.

AI Tool Information:
- Name: ${approveFormData.name || ''}
- Tagline: ${approveFormData.tagline || ''}
- Description: ${approveFormData.description || ''}
- Categories: ${categoryNames.join(', ') || 'N/A'}
- Features: ${(approveFormData.features || []).join(', ') || 'N/A'}

Generate 8-12 relevant tags. Include:
- Main use cases
- Technology type (AI, machine learning, etc.)
- Target users
- Key features
- Related terms users might search for

Return ONLY a JSON array of lowercase French tags, no duplicates.`,
        response_json_schema: {
          type: "object",
          properties: {
            tags: { 
              type: "array", 
              items: { type: "string" },
              description: "Array of relevant tags in French"
            }
          },
          required: ["tags"]
        }
      });

      if (response.tags && response.tags.length > 0) {
        const existingTags = approveFormData.tags || [];
        const newTags = [...new Set([...existingTags, ...response.tags])];
        setApproveFormData({ ...approveFormData, tags: newTags });
        toast.success(`${response.tags.length} tags générés !`);
      } else {
        toast.error('Aucun tag généré');
      }
    } catch (error) {
      console.error('Tag generation error:', error);
      toast.error('Erreur lors de la génération des tags');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('-created_date'); // Par défaut: plus récents en premier
  const itemsPerPage = 20;
  const [duplicateServices, setDuplicateServices] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);

  // Fetch existing AI services to check for duplicates
  const { data: existingServices = [] } = useQuery({
    queryKey: ['existingAIServices'],
    queryFn: () => base44.entities.AIService.list('-created_date', 5000),
  });
  
  const newCount = discoveries.filter(d => d.status === 'new').length;
  const reviewedCount = discoveries.filter(d => d.status === 'reviewed').length;

  // Filtrage
  let filteredDiscoveries = filter === 'all' 
    ? discoveries 
    : discoveries.filter(d => d.status === filter);

  // Tri par date
  filteredDiscoveries = [...filteredDiscoveries].sort((a, b) => {
    const dateA = new Date(a.created_date);
    const dateB = new Date(b.created_date);
    return sortOrder === '-created_date' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDiscoveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDiscoveries = filteredDiscoveries.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Search Scan</h2>
          <p className="text-slate-600">Découvertes automatiques de services IA</p>
        </div>
        <Button
          onClick={() => triggerScanMutation.mutate()}
          disabled={isScanning}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scan en cours...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Lancer un scan
            </>
          )}
        </Button>
      </div>

      {/* Filter Tabs + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tous ({discoveries.length})
          </Button>
          <Button
            variant={filter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new')}
          >
            À valider ({newCount})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Services créés ({discoveries.filter(d => d.status === 'approved').length})
          </Button>
          <Button
            variant={filter === 'reviewed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('reviewed')}
          >
            Vus ({reviewedCount})
          </Button>
          <Button
            variant={filter === 'dismissed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('dismissed')}
          >
            Rejetés ({discoveries.filter(d => d.status === 'dismissed').length})
          </Button>
        </div>

        {/* Tri par date */}
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Plus récents d'abord</SelectItem>
            <SelectItem value="created_date">Plus anciens d'abord</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{newCount}</div>
            <div className="text-sm text-slate-600">À valider</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{reviewedCount}</div>
            <div className="text-sm text-slate-600">Vus</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {discoveries.filter(d => d.status === 'approved').length}
            </div>
            <div className="text-sm text-slate-600">Services créés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-400">
              {discoveries.filter(d => d.status === 'dismissed').length}
            </div>
            <div className="text-sm text-slate-600">Rejetés</div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination Top */}
      {totalPages > 1 && (
        <div 
          className="flex items-center justify-between p-4 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDiscoveries.length)} sur {filteredDiscoveries.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </Button>
            <span className="px-3 py-1 text-sm font-medium">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </Button>
          </div>
        </div>
      )}

      {/* Discoveries List */}
      <div className="space-y-4">
        {paginatedDiscoveries.map((discovery) => (
          <Card 
            key={discovery.id} 
            className="overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <CardHeader 
              style={{ 
                background: theme === 'dark' 
                  ? 'linear-gradient(to right, rgba(30,41,59,0.8), rgba(88,28,135,0.2))' 
                  : 'linear-gradient(to right, #f8fafc, rgba(147, 51, 234, 0.1))' 
              }}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {discovery.logo_url && (
                      <img
                        src={discovery.logo_url}
                        alt={discovery.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    {editingId === discovery.id ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="max-w-md"
                      />
                    ) : (
                      <CardTitle className="text-xl">{discovery.name}</CardTitle>
                    )}
                    <Badge
                      variant={
                        discovery.status === 'new' ? 'default' :
                        discovery.status === 'approved' ? 'success' :
                        'secondary'
                      }
                    >
                      {discovery.status}
                    </Badge>
                  </div>
                  
                  {editingId === discovery.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Tagline"
                        value={editData.tagline || ''}
                        onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                      />
                      <Input
                        placeholder="URL du site"
                        value={editData.website_url || ''}
                        onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      {discovery.tagline && (
                        <p className="text-sm text-slate-600 mb-2">{discovery.tagline}</p>
                      )}
                      <p className="text-sm text-slate-700 mb-2">{discovery.description}</p>
                      {discovery.website_url && (
                        <a
                          href={discovery.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                        >
                          {discovery.website_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                {discovery.cover_image_url && (
                  <img
                    src={discovery.cover_image_url}
                    alt={discovery.name}
                    className="w-32 h-32 rounded-lg object-cover ml-4"
                  />
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Tags & Features */}
              <div className="space-y-3 mb-4">
                {discovery.suggested_categories?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 mr-2">Catégories:</span>
                    {discovery.suggested_categories.map((cat, i) => (
                      <Badge key={i} variant="outline" className="mr-1">
                        {categories.find(c => c.id === cat)?.name || cat}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {discovery.tags?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 mr-2">Tags:</span>
                    {discovery.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="mr-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {discovery.features?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600">Fonctionnalités:</span>
                    <ul className="list-disc list-inside text-sm text-slate-700 mt-1">
                      {discovery.features.slice(0, 3).map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t">
                {editingId === discovery.id ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      variant="outline"
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    {discovery.status !== 'approved' && (
                      <>
                        <Button
                          onClick={() => handleEdit(discovery)}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleApprove(discovery)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(discovery.id, 'reviewed')}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Marquer vu
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(discovery.id, 'dismissed')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {discovery.status === 'approved' && discovery.ai_service_id && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Service créé: {discovery.ai_service_id}
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {discovery.admin_notes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-800">{discovery.admin_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredDiscoveries.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune découverte pour le moment
            </h3>
            <p className="text-slate-600 mb-4">
              Lancez un scan pour découvrir de nouveaux services IA
            </p>
            <Button
              onClick={() => triggerScanMutation.mutate()}
              disabled={isScanning}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Lancer le premier scan
            </Button>
          </div>
        )}
      </div>

      {/* Modal de validation avec édition complète */}
      {approvingDiscovery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Publier: {approvingDiscovery.name}</h2>
                <p className="text-slate-600">Modifiez les informations avant de publier le service</p>
              </div>
              <Button
                onClick={handleAutoTranslate}
                disabled={isTranslating}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traduction...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Traduire FR → EN
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Colonne gauche */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Nom *</label>
                  <Input
                    value={approveFormData.name || ''}
                    onChange={(e) => setApproveFormData({...approveFormData, name: e.target.value})}
                    placeholder="Nom du service"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Tagline (FR)</label>
                  <Input
                    value={approveFormData.tagline || ''}
                    onChange={(e) => setApproveFormData({...approveFormData, tagline: e.target.value})}
                    placeholder="Phrase d'accroche en français"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Tagline (EN)</label>
                  <Input
                    value={approveFormData.tagline_en || ''}
                    onChange={(e) => setApproveFormData({...approveFormData, tagline_en: e.target.value})}
                    placeholder="Tagline in English"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Description (FR)</label>
                  <Textarea
                    value={approveFormData.description || ''}
                    onChange={(e) => setApproveFormData({...approveFormData, description: e.target.value})}
                    placeholder="Description complète en français"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Description (EN)</label>
                  <Textarea
                    value={approveFormData.description_en || ''}
                    onChange={(e) => setApproveFormData({...approveFormData, description_en: e.target.value})}
                    placeholder="Full description in English"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">URL du site *</label>
                  <Input
                    value={approveFormData.website_url || ''}
                    onChange={(e) => setApproveFormData({...approveFormData, website_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Modèle de prix</label>
                  <Select 
                    value={approveFormData.pricing || 'freemium'} 
                    onValueChange={(v) => setApproveFormData({...approveFormData, pricing: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gratuit">Gratuit</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="payant">Payant</SelectItem>
                      <SelectItem value="abonnement">Abonnement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-4">
                {/* Images */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Logo</label>
                  <div className="flex items-center gap-3">
                    {approveFormData.logo_url && (
                      <img src={approveFormData.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                        disabled={uploadingLogo}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Image de couverture</label>
                  <div className="space-y-2">
                    {approveFormData.cover_image_url && (
                      <img src={approveFormData.cover_image_url} alt="Cover" className="w-full h-32 rounded-lg object-cover" />
                    )}
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-purple-400 transition-colors">
                          {uploadingCover ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                          ) : (
                            <>
                              <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                              <span className="text-xs text-slate-600">Upload</span>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], 'cover')} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateCover}
                        disabled={fetchingCover}
                        className="flex-1 border-2 border-dashed border-purple-300 rounded-lg p-3 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                      >
                        {fetchingCover ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                            <span className="text-xs text-purple-600 font-medium">Auto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features FR */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Fonctionnalités (FR)</label>
                  <div className="space-y-2">
                    {(approveFormData.features || []).map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...approveFormData.features];
                            newFeatures[idx] = e.target.value;
                            setApproveFormData({...approveFormData, features: newFeatures});
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newFeatures = approveFormData.features.filter((_, i) => i !== idx);
                            setApproveFormData({...approveFormData, features: newFeatures});
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setApproveFormData({...approveFormData, features: [...(approveFormData.features || []), '']})}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                </div>

                {/* Features EN */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Features (EN)</label>
                  <div className="space-y-2">
                    {(approveFormData.features_en || []).map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...approveFormData.features_en];
                            newFeatures[idx] = e.target.value;
                            setApproveFormData({...approveFormData, features_en: newFeatures});
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newFeatures = approveFormData.features_en.filter((_, i) => i !== idx);
                            setApproveFormData({...approveFormData, features_en: newFeatures});
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setApproveFormData({...approveFormData, features_en: [...(approveFormData.features_en || []), '']})}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-slate-700">Tags</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateTags}
                      disabled={isGeneratingTags}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                    >
                      {isGeneratingTags ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Tags className="w-3 h-3 mr-1" />
                          Générer avec IA
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(approveFormData.tags || []).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = approveFormData.tags.filter((_, i) => i !== idx);
                            setApproveFormData({...approveFormData, tags: newTags});
                          }}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Ajouter un tag et appuyer sur Entrée"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setApproveFormData({
                          ...approveFormData, 
                          tags: [...(approveFormData.tags || []), e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Catégories *</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {categories.map(cat => (
                  <label 
                    key={cat.id} 
                    className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50 transition-colors text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-medium text-slate-900">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={() => {
                  const hasDuplicates = checkForDuplicates(approveFormData, approvingDiscovery, selectedCategories);
                  if (!hasDuplicates) {
                    approveDiscoveryMutation.mutate({ 
                      discovery: approvingDiscovery, 
                      categories: selectedCategories,
                      formData: approveFormData
                    });
                  }
                }}
                disabled={selectedCategories.length === 0 || !approveFormData.name || !approveFormData.website_url || approveDiscoveryMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                {approveDiscoveryMutation.isPending ? 'Création...' : `Publier le service`}
              </Button>
              <Button
                onClick={() => {
                  setApprovingDiscovery(null);
                  setSelectedCategories([]);
                  setApproveFormData({});
                }}
                variant="outline"
                disabled={approveDiscoveryMutation.isPending}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détection de doublons */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">⚠️ Doublon(s) détecté(s)</h2>
                <p className="text-slate-600">
                  Un ou plusieurs services avec un nom similaire existent déjà
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Nouveau service :</strong> {pendingApproval?.formData?.name}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="font-medium text-slate-700">Services existants similaires :</p>
              {duplicateServices.map(service => (
                <div 
                  key={service.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {service.logo_url && (
                      <img src={service.logo_url} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.website_url}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {service.status} • {service.views || 0} vues
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Supprimer "${service.name}" ?`)) {
                        deleteServiceMutation.mutate(service.id);
                        setDuplicateServices(prev => prev.filter(s => s.id !== service.id));
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => {
                  if (pendingApproval) {
                    approveDiscoveryMutation.mutate({
                      discovery: pendingApproval.discovery,
                      categories: pendingApproval.categories,
                      formData: pendingApproval.formData
                    });
                  }
                }}
                disabled={approveDiscoveryMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                {approveDiscoveryMutation.isPending ? 'Création...' : 'Créer quand même'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setPendingApproval(null);
                  setDuplicateServices([]);
                }}
                disabled={approveDiscoveryMutation.isPending}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}