import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Plus, Edit, Trash2, RefreshCw, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServices() {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', tagline: '', tagline_en: '', description: '', description_en: '', 
    features: [], features_en: [], categories: [],
    pricing: 'freemium', website_url: '', status: 'approved', logo_url: '', cover_image_url: ''
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [filter, setFilter] = useState('all');
  const [rejectingService, setRejectingService] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['adminServices'],
    queryFn: () => base44.entities.AIService.list('-created_date', 100),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.AIService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      setShowForm(false);
      setEditingService(null);
      setFormData({ name: '', slug: '', tagline: '', tagline_en: '', description: '', description_en: '', features: [], features_en: [], categories: [], pricing: 'freemium', website_url: '', status: 'approved', logo_url: '', cover_image_url: '' });
      toast.success('Service créé avec succès');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      setEditingService(null);
      toast.success('Service mis à jour');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.AIService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      toast.success('Service supprimé');
    },
  });

  const approveRevisionMutation = useMutation({
    mutationFn: async (service) => {
      const revision = service.pending_revision;
      const updateData = {
        name: revision.name,
        tagline: revision.tagline,
        tagline_en: revision.tagline_en,
        description: revision.description,
        description_en: revision.description_en,
        categories: revision.categories,
        logo_url: revision.logo_url,
        cover_image_url: revision.cover_image_url,
        website_url: revision.website_url,
        pricing: revision.pricing,
        features: revision.features,
        features_en: revision.features_en,
        tags: revision.tags,
        pending_revision: null
      };

      await base44.entities.AIService.update(service.id, updateData);

      // Envoyer email au client
      try {
        await base44.integrations.Core.SendEmail({
          to: service.submitted_by,
          subject: `✅ Vos modifications ont été approuvées - ${service.name}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%); border-radius: 16px; overflow: hidden;">
              <div style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.3);">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ Révision approuvée</h1>
              </div>
              <div style="padding: 40px; background: white; margin: 20px; border-radius: 12px;">
                <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
                  Bonjour,
                </p>
                <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
                  Vos modifications pour <strong>${service.name}</strong> ont été approuvées et sont maintenant visibles sur Finder AI !
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://finderai.com/ai/${service.slug}" style="background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Voir ma page
                  </a>
                </div>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      toast.success('Révision approuvée !');
    },
  });

  const rejectRevisionMutation = useMutation({
    mutationFn: async ({ service, comment }) => {
      await base44.entities.AIService.update(service.id, {
        pending_revision: null
      });

      // Envoyer email au client avec le commentaire
      try {
        await base44.integrations.Core.SendEmail({
          to: service.submitted_by,
          subject: `❌ Vos modifications ont été refusées - ${service.name}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%); border-radius: 16px; overflow: hidden;">
              <div style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.3);">
                <h1 style="color: white; margin: 0; font-size: 28px;">❌ Révision refusée</h1>
              </div>
              <div style="padding: 40px; background: white; margin: 20px; border-radius: 12px;">
                <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
                  Bonjour,
                </p>
                <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
                  Vos modifications pour <strong>${service.name}</strong> n'ont pas pu être approuvées. La version actuelle de votre page reste inchangée.
                </p>
                ${comment ? `
                <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: bold;">Motif du refus :</p>
                  <p style="margin: 0; color: #7f1d1d;">${comment}</p>
                </div>
                ` : ''}
                <p style="color: #64748b; font-size: 14px;">
                  Vous pouvez soumettre une nouvelle demande de modification en tenant compte de ces remarques.
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      setRejectingService(null);
      setRejectComment('');
      toast.success('Révision refusée');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: { ...formData, slug } });
    } else {
      createServiceMutation.mutate({ ...formData, slug });
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug,
      tagline: service.tagline || '',
      tagline_en: service.tagline_en || '',
      description: service.description,
      description_en: service.description_en || '',
      features: service.features || [],
      features_en: service.features_en || [],
      categories: service.categories || [],
      pricing: service.pricing,
      website_url: service.website_url || '',
      status: service.status,
      logo_url: service.logo_url || '',
      cover_image_url: service.cover_image_url || ''
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success('Logo uploadé');
    } catch (error) {
      toast.error('Erreur upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image_url: file_url });
      toast.success('Image de couverture uploadée');
    } catch (error) {
      toast.error('Erreur upload cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const toggleCategory = (catId) => {
    const cats = formData.categories || [];
    if (cats.includes(catId)) {
      setFormData({ ...formData, categories: cats.filter(c => c !== catId) });
    } else {
      setFormData({ ...formData, categories: [...cats, catId] });
    }
  };

  const handleStatusChange = (service, newStatus) => {
    updateServiceMutation.mutate({ id: service.id, data: { status: newStatus } });
  };

  // Services avec révisions en attente
  const servicesWithRevisions = services.filter(s => s.pending_revision);
  const pendingServices = services.filter(s => s.status === 'pending' && !s.pending_revision);
  const approvedServices = services.filter(s => s.status === 'approved' && !s.pending_revision);
  const rejectedServices = services.filter(s => s.status === 'rejected');

  // Filtrage
  let filteredServices = services;
  if (filter === 'revisions') {
    filteredServices = servicesWithRevisions;
  } else if (filter === 'pending') {
    filteredServices = pendingServices;
  } else if (filter === 'approved') {
    filteredServices = approvedServices;
  } else if (filter === 'rejected') {
    filteredServices = rejectedServices;
  }

  // Trier pour mettre les révisions en premier
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (a.pending_revision && !b.pending_revision) return -1;
    if (!a.pending_revision && b.pending_revision) return 1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingService ? 'Modifier le service' : 'Créer un service IA'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nom du service"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Slug (optionnel)"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">🇫🇷 Tagline (Français)</label>
                <Input
                  placeholder="Tagline en français"
                  value={formData.tagline}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">🇬🇧 Tagline (English)</label>
                <Input
                  placeholder="Tagline in English"
                  value={formData.tagline_en}
                  onChange={(e) => setFormData({...formData, tagline_en: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">🇫🇷 Description (Français)</label>
                <Textarea
                  placeholder="Description en français"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">🇬🇧 Description (English)</label>
                <Textarea
                  placeholder="Description in English"
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                />
              </div>
              
              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">Catégories (sélection multiple)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        (formData.categories || []).includes(cat.id)
                          ? 'bg-purple-100 border-purple-600 text-purple-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Uploads */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Image de couverture</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                  {formData.cover_image_url && (
                    <img src={formData.cover_image_url} alt="Cover" className="mt-2 w-full h-20 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Select value={formData.pricing} onValueChange={(v) => setFormData({...formData, pricing: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuit">Gratuit</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="payant">Payant</SelectItem>
                    <SelectItem value="abonnement">Abonnement</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="URL du site web"
                value={formData.website_url}
                onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                  {editingService ? 'Mettre à jour' : 'Créer le service'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingService(null);
                }}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={servicesWithRevisions.length > 0 ? 'border-2 border-amber-400 bg-amber-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${servicesWithRevisions.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              Révisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${servicesWithRevisions.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {servicesWithRevisions.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{pendingServices.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{approvedServices.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold">{rejectedServices.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Create */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tous ({services.length})
          </Button>
          <Button
            variant={filter === 'revisions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('revisions')}
            className={servicesWithRevisions.length > 0 ? 'border-amber-400 text-amber-700' : ''}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Révisions ({servicesWithRevisions.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            En attente ({pendingServices.length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Approuvés ({approvedServices.length})
          </Button>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un service
        </Button>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services IA ({filteredServices.length})</CardTitle>
          <CardDescription>Gérez les soumissions de services IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedServices.map((service) => (
              <div key={service.id}>
                <div
                  className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${
                    service.pending_revision
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {service.logo_url && (
                      <img
                        src={service.logo_url}
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{service.name}</h3>
                        {service.pending_revision && (
                          <Badge className="bg-amber-500 text-white animate-pulse">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Nouvelle version à valider
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{service.tagline}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Soumis par: {service.submitted_by || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.pending_revision && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveRevisionMutation.mutate(service)}
                          disabled={approveRevisionMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => rejectRevisionMutation.mutate(service)}
                          disabled={rejectRevisionMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Refuser
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Select value={service.status} onValueChange={(v) => handleStatusChange(service, v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approuvé</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        if (confirm('Supprimer ce service ?')) {
                          deleteServiceMutation.mutate(service.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Inline Edit Form */}
                {editingService?.id === service.id && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Nom du service"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                          <Input
                            placeholder="Slug (optionnel)"
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">🇫🇷 Tagline (Français)</label>
                          <Input
                            placeholder="Tagline en français"
                            value={formData.tagline}
                            onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">🇬🇧 Tagline (English)</label>
                          <Input
                            placeholder="Tagline in English"
                            value={formData.tagline_en}
                            onChange={(e) => setFormData({...formData, tagline_en: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">🇫🇷 Description (Français)</label>
                          <Textarea
                            placeholder="Description en français"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">🇬🇧 Description (English)</label>
                          <Textarea
                            placeholder="Description in English"
                            value={formData.description_en}
                            onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Catégories</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {categories.map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => toggleCategory(cat.id)}
                                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                  (formData.categories || []).includes(cat.id)
                                    ? 'bg-purple-100 border-purple-600 text-purple-900'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Logo</label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={uploadingLogo}
                            />
                            {formData.logo_url && (
                              <img src={formData.logo_url} alt="Logo" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Image de couverture</label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              disabled={uploadingCover}
                            />
                            {formData.cover_image_url && (
                              <img src={formData.cover_image_url} alt="Cover" className="mt-2 w-full h-20 object-cover rounded-lg" />
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Select value={formData.pricing} onValueChange={(v) => setFormData({...formData, pricing: v})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Prix" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gratuit">Gratuit</SelectItem>
                              <SelectItem value="freemium">Freemium</SelectItem>
                              <SelectItem value="payant">Payant</SelectItem>
                              <SelectItem value="abonnement">Abonnement</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approuvé</SelectItem>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="rejected">Rejeté</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          placeholder="URL du site web"
                          value={formData.website_url}
                          onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={updateServiceMutation.isPending}>
                            Mettre à jour
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}