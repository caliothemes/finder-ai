import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServices() {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', tagline: '', description: '', categories: [],
    pricing: 'freemium', website_url: '', status: 'approved', logo_url: '', cover_image_url: ''
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['adminServices'],
    queryFn: () => base44.entities.AIService.list('-created_date', 50),
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
      setFormData({ name: '', slug: '', tagline: '', description: '', categories: [], pricing: 'freemium', website_url: '', status: 'approved', logo_url: '', cover_image_url: '' });
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
      description: service.description,
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

  const pendingServices = services.filter(s => s.status === 'pending');
  const approvedServices = services.filter(s => s.status === 'approved');
  const rejectedServices = services.filter(s => s.status === 'rejected');

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
              <Input
                placeholder="Tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Services List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services IA soumis</CardTitle>
              <CardDescription>Gérez les soumissions de services IA</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id}>
                <div
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
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
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      <p className="text-sm text-slate-600">{service.tagline}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Soumis par: {service.submitted_by || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                        <Input
                          placeholder="Tagline"
                          value={formData.tagline}
                          onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                        />
                        <Textarea
                          placeholder="Description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          required
                        />
                        
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