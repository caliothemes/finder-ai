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
  Loader2, Pencil, Save, AlertCircle, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAISearchScan() {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  const { data: discoveries = [], isLoading } = useQuery({
    queryKey: ['discoveries'],
    queryFn: () => base44.entities.AIServiceDiscovery.list('-created_date', 100),
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
    mutationFn: async (discovery) => {
      const slug = discovery.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // S'assurer que les catégories sont des IDs valides
      const validCategories = (discovery.suggested_categories || []).filter(catId => 
        categories.some(c => c.id === catId)
      );

      const aiServiceData = {
        name: discovery.name,
        slug: slug,
        tagline: discovery.tagline || '',
        description: discovery.description || '',
        categories: validCategories.length > 0 ? validCategories : [],
        logo_url: discovery.logo_url || '',
        cover_image_url: discovery.cover_image_url || '',
        website_url: discovery.website_url,
        pricing: discovery.suggested_pricing || 'freemium',
        features: discovery.features || [],
        tags: discovery.tags || [],
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

  const handleApprove = (discovery) => {
    if (!discovery.name || !discovery.website_url) {
      toast.error('Nom et URL sont requis');
      return;
    }
    approveDiscoveryMutation.mutate(discovery);
  };

  const newCount = discoveries.filter(d => d.status === 'new').length;
  const reviewedCount = discoveries.filter(d => d.status === 'reviewed').length;

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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{newCount}</div>
            <div className="text-sm text-slate-600">Nouveaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{reviewedCount}</div>
            <div className="text-sm text-slate-600">En révision</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {discoveries.filter(d => d.status === 'approved').length}
            </div>
            <div className="text-sm text-slate-600">Approuvés</div>
          </CardContent>
        </Card>
      </div>

      {/* Discoveries List */}
      <div className="space-y-4">
        {discoveries.map((discovery) => (
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

        {discoveries.length === 0 && (
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
    </div>
  );
}