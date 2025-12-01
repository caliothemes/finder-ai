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
  Loader2, Pencil, Save, AlertCircle, Sparkles, Plus, Trash2, Upload
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminAISearchScan() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      setEditingId(null);
      toast.success('Découverte mise à jour');
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
      setApprovingDiscovery(null);
      setSelectedCategories([]);
      setApproveFormData({});
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

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const newCount = discoveries.filter(d => d.status === 'new').length;
  const reviewedCount = discoveries.filter(d => d.status === 'reviewed').length;

  // Filtrage
  const filteredDiscoveries = filter === 'all' 
    ? discoveries 
    : discoveries.filter(d => d.status === filter);

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

      {/* Filter Tabs */}
      <div className="flex gap-2">
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
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border">
          <span className="text-sm text-slate-600">
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
          <Card key={discovery.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
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
            <h2 className="text-2xl font-bold mb-2">Publier: {approvingDiscovery.name}</h2>
            <p className="text-slate-600 mb-6">Modifiez les informations avant de publier le service</p>
            
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
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                      disabled={uploadingCover}
                    />
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
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Tags</label>
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
                onClick={() => approveDiscoveryMutation.mutate({ 
                  discovery: approvingDiscovery, 
                  categories: selectedCategories,
                  formData: approveFormData
                })}
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
    </div>
  );
}