import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Plus, Edit, Trash2, RefreshCw, Check, X, Eye, Languages, Loader2, ImageIcon, Sparkles, Upload, Search } from 'lucide-react';
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
  const [fetchingCover, setFetchingCover] = useState(false);
  const [filter, setFilter] = useState('all');
  const [rejectingService, setRejectingService] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [previewingRevision, setPreviewingRevision] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState({ current: 0, total: 0 });
  const [generatingCovers, setGeneratingCovers] = useState(false);
  const [coverProgress, setCoverProgress] = useState({ current: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 20;
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['adminServices'],
    queryFn: () => base44.entities.AIService.list('-created_date', 5000),
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

  const fetchCoverFromWeb = async () => {
    if (!formData.website_url && !formData.name) {
      toast.error('URL du site ou nom requis');
      return;
    }
    
    setFetchingCover(true);
    try {
      const urlToFetch = formData.website_url || `https://www.google.com/search?q=${encodeURIComponent(formData.name + ' AI tool')}`;
      const ogResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(urlToFetch)}&meta=true`);
      const ogData = await ogResponse.json();
      
      if (ogData?.data?.image?.url) {
        setFormData({ ...formData, cover_image_url: ogData.data.image.url });
        toast.success('Image trouvée sur le site !');
      } else if (ogData?.data?.logo?.url) {
        setFormData({ ...formData, cover_image_url: ogData.data.logo.url });
        toast.success('Logo trouvé sur le site !');
      } else {
        toast.info('Aucune image trouvée, génération en cours...');
        const imageResult = await base44.integrations.Core.GenerateImage({
          prompt: `Professional modern banner for AI tool "${formData.name}". ${formData.tagline || 'AI technology'}. Abstract futuristic design, gradient purple pink blue, technology aesthetic, clean minimal, no text, high quality.`
        });
        if (imageResult?.url) {
          setFormData({ ...formData, cover_image_url: imageResult.url });
          toast.success('Image générée avec succès !');
        } else {
          toast.error('Impossible de trouver ou générer une image');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche: ' + error.message);
    } finally {
      setFetchingCover(false);
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

  // Fonction de traduction automatique
  const translateAllServices = async () => {
    const servicesToTranslate = services.filter(s => 
      s.status === 'approved' && 
      (!s.tagline_en || !s.description_en || s.tagline_en.trim() === '' || s.description_en.trim() === '')
    );

    if (servicesToTranslate.length === 0) {
      toast.info('Tous les services sont déjà traduits !');
      return;
    }

    setTranslating(true);
    setTranslationProgress({ current: 0, total: servicesToTranslate.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < servicesToTranslate.length; i++) {
      const service = servicesToTranslate[i];
      setTranslationProgress({ current: i + 1, total: servicesToTranslate.length });

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate the following French AI service information to English. Keep it professional and concise.

French Tagline: "${service.tagline || ''}"
French Description: "${service.description || ''}"
French Features: ${JSON.stringify(service.features || [])}

Provide accurate English translations.`,
          response_json_schema: {
            type: "object",
            properties: {
              tagline_en: { type: "string", description: "English tagline" },
              description_en: { type: "string", description: "English description" },
              features_en: { type: "array", items: { type: "string" }, description: "English features" }
            },
            required: ["tagline_en", "description_en"]
          }
        });

        await base44.entities.AIService.update(service.id, {
          tagline_en: result.tagline_en,
          description_en: result.description_en,
          features_en: result.features_en || []
        });

        successCount++;
      } catch (error) {
        console.error(`Error translating ${service.name}:`, error);
        errorCount++;
      }
    }

    setTranslating(false);
    queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    
    if (errorCount === 0) {
      toast.success(`${successCount} services traduits avec succès !`);
    } else {
      toast.warning(`${successCount} traduits, ${errorCount} erreurs`);
    }
  };

  // Fonction de génération d'images de couverture
  const generateMissingCovers = async () => {
    const servicesWithoutCover = services.filter(s => 
      s.status === 'approved' && 
      (!s.cover_image_url || s.cover_image_url.trim() === '')
    );

    if (servicesWithoutCover.length === 0) {
      toast.info('Tous les services ont déjà une image de couverture !');
      return;
    }

    setGeneratingCovers(true);
    setCoverProgress({ current: 0, total: servicesWithoutCover.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < servicesWithoutCover.length; i++) {
      const service = servicesWithoutCover[i];
      setCoverProgress({ current: i + 1, total: servicesWithoutCover.length });

      try {
        const imagePrompt = `Professional modern banner for AI tool "${service.name}". ${service.tagline || 'Innovative AI technology'}. Abstract futuristic design with gradient colors (purple, pink, blue, cyan), neural network patterns, geometric shapes, technology aesthetic, clean minimal style, high quality digital art. No text, no logos, no words.`;
        
        const imageResult = await base44.integrations.Core.GenerateImage({
          prompt: imagePrompt
        });
        
        if (imageResult && imageResult.url) {
          await base44.entities.AIService.update(service.id, {
            cover_image_url: imageResult.url
          });
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error generating cover for ${service.name}:`, error);
        errorCount++;
      }

      // Pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setGeneratingCovers(false);
    queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    
    if (errorCount === 0) {
      toast.success(`${successCount} images générées avec succès !`);
    } else {
      toast.warning(`${successCount} générées, ${errorCount} erreurs`);
    }
  };

  // Services avec révisions en attente
  const servicesWithRevisions = services.filter(s => s.pending_revision);
  const pendingServices = services.filter(s => s.status === 'pending' && !s.pending_revision);
  const approvedServices = services.filter(s => s.status === 'approved' && !s.pending_revision);
  const rejectedServices = services.filter(s => s.status === 'rejected');

  // Filtrage par statut
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

  // Filtrage par recherche
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredServices = filteredServices.filter(s => 
      s.name?.toLowerCase().includes(query) ||
      s.tagline?.toLowerCase().includes(query) ||
      s.submitted_by?.toLowerCase().includes(query) ||
      s.slug?.toLowerCase().includes(query)
    );
  }

  // Trier pour mettre les révisions en premier
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (a.pending_revision && !b.pending_revision) return -1;
    if (!a.pending_revision && b.pending_revision) return 1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);
  const paginatedServices = sortedServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal de prévisualisation des révisions */}
      {previewingRevision && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl my-4">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Prévisualisation des modifications</h3>
                <p className="text-amber-100 text-sm">{previewingRevision.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewingRevision(null)} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Comparaison Nom */}
              {previewingRevision.pending_revision.name !== previewingRevision.name && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">Nom</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-900 line-through">{previewingRevision.name}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900 font-medium">{previewingRevision.pending_revision.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison Tagline FR */}
              {previewingRevision.pending_revision.tagline !== previewingRevision.tagline && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">🇫🇷 Tagline</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-700">{previewingRevision.tagline || '(vide)'}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900">{previewingRevision.pending_revision.tagline || '(vide)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison Tagline EN */}
              {previewingRevision.pending_revision.tagline_en !== previewingRevision.tagline_en && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">🇬🇧 Tagline</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-700">{previewingRevision.tagline_en || '(vide)'}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900">{previewingRevision.pending_revision.tagline_en || '(vide)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison Description FR */}
              {previewingRevision.pending_revision.description !== previewingRevision.description && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">🇫🇷 Description</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap">{previewingRevision.description || '(vide)'}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900 text-sm whitespace-pre-wrap">{previewingRevision.pending_revision.description || '(vide)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison Description EN */}
              {previewingRevision.pending_revision.description_en !== previewingRevision.description_en && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">🇬🇧 Description</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap">{previewingRevision.description_en || '(vide)'}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900 text-sm whitespace-pre-wrap">{previewingRevision.pending_revision.description_en || '(vide)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison Images */}
              {(previewingRevision.pending_revision.logo_url !== previewingRevision.logo_url || 
                previewingRevision.pending_revision.cover_image_url !== previewingRevision.cover_image_url) && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">Images</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium mb-2 block">Actuel</span>
                      <div className="flex gap-3">
                        {previewingRevision.logo_url && (
                          <img src={previewingRevision.logo_url} alt="Logo actuel" className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        {previewingRevision.cover_image_url && (
                          <img src={previewingRevision.cover_image_url} alt="Cover actuel" className="h-16 flex-1 rounded-lg object-cover" />
                        )}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium mb-2 block">Nouveau</span>
                      <div className="flex gap-3">
                        {previewingRevision.pending_revision.logo_url && (
                          <img src={previewingRevision.pending_revision.logo_url} alt="Logo nouveau" className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        {previewingRevision.pending_revision.cover_image_url && (
                          <img src={previewingRevision.pending_revision.cover_image_url} alt="Cover nouveau" className="h-16 flex-1 rounded-lg object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison Prix */}
              {previewingRevision.pending_revision.pricing !== previewingRevision.pricing && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">Modèle de prix</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-900 capitalize">{previewingRevision.pricing}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900 capitalize font-medium">{previewingRevision.pending_revision.pricing}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comparaison URL */}
              {previewingRevision.pending_revision.website_url !== previewingRevision.website_url && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">Site web</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium">Actuel</span>
                      <p className="text-slate-700 text-sm break-all">{previewingRevision.website_url || '(vide)'}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium">Nouveau</span>
                      <p className="text-slate-900 text-sm break-all">{previewingRevision.pending_revision.website_url || '(vide)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              {JSON.stringify(previewingRevision.pending_revision.features) !== JSON.stringify(previewingRevision.features) && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">Fonctionnalités</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium mb-2 block">Actuel</span>
                      <div className="flex flex-wrap gap-1">
                        {(previewingRevision.features || []).map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium mb-2 block">Nouveau</span>
                      <div className="flex flex-wrap gap-1">
                        {(previewingRevision.pending_revision.features || []).map((f, i) => (
                          <Badge key={i} className="bg-green-200 text-green-800 text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {JSON.stringify(previewingRevision.pending_revision.tags) !== JSON.stringify(previewingRevision.tags) && (
                <div className="border rounded-xl p-4">
                  <label className="text-sm font-semibold text-slate-500 mb-2 block">Tags</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-xs text-red-600 font-medium mb-2 block">Actuel</span>
                      <div className="flex flex-wrap gap-1">
                        {(previewingRevision.tags || []).map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-xs text-green-600 font-medium mb-2 block">Nouveau</span>
                      <div className="flex flex-wrap gap-1">
                        {(previewingRevision.pending_revision.tags || []).map((t, i) => (
                          <Badge key={i} className="bg-green-200 text-green-800 text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 rounded-b-2xl">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  approveRevisionMutation.mutate(previewingRevision);
                  setPreviewingRevision(null);
                }}
                disabled={approveRevisionMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Approuver ces modifications
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => {
                  setRejectingService(previewingRevision);
                  setPreviewingRevision(null);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Refuser
              </Button>
              <Button variant="ghost" onClick={() => setPreviewingRevision(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de refus avec commentaire */}
      {rejectingService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Refuser la révision</h3>
            <p className="text-slate-600 mb-4">
              Service : <strong>{rejectingService.name}</strong>
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Motif du refus (optionnel)</label>
              <Textarea
                placeholder="Expliquez au client pourquoi sa révision est refusée..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => rejectRevisionMutation.mutate({ service: rejectingService, comment: rejectComment })}
                disabled={rejectRevisionMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Confirmer le refus
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingService(null);
                  setRejectComment('');
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="flex gap-2 mb-2">
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
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={fetchCoverFromWeb}
                      disabled={fetchingCover}
                      className="flex-1 border-2 border-dashed border-purple-300 rounded-lg p-3 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      {fetchingCover ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                          <span className="text-xs text-purple-600 font-medium">Auto-fetch</span>
                        </>
                      )}
                    </button>
                  </div>
                  {formData.cover_image_url && (
                    <img src={formData.cover_image_url} alt="Cover" className="w-full h-20 object-cover rounded-lg" />
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

      {/* Search + Filter + Create */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
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
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline"
            onClick={generateMissingCovers}
            disabled={generatingCovers}
            className="bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100"
          >
            {generatingCovers ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Images {coverProgress.current}/{coverProgress.total}
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Générer images manquantes ({services.filter(s => s.status === 'approved' && (!s.cover_image_url || s.cover_image_url.trim() === '')).length})
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={translateAllServices}
            disabled={translating}
            className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {translating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traduction {translationProgress.current}/{translationProgress.total}
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Traduire tout
              </>
            )}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un service
          </Button>
        </div>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services IA ({filteredServices.length})</CardTitle>
          <CardDescription>
            Gérez les soumissions de services IA • Page {currentPage} sur {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedServices.map((service) => (
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
                          <button
                            onClick={() => setPreviewingRevision(service)}
                            className="inline-flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse hover:bg-amber-600 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Voir les modifications
                          </button>
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
                          onClick={() => setRejectingService(service)}
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
                            <div className="flex gap-2 mb-2">
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
                                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                              </label>
                              <button
                                type="button"
                                onClick={fetchCoverFromWeb}
                                disabled={fetchingCover}
                                className="flex-1 border-2 border-dashed border-purple-300 rounded-lg p-3 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                              >
                                {fetchingCover ? (
                                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" />
                                ) : (
                                  <>
                                    <Sparkles className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                                    <span className="text-xs text-purple-600 font-medium">Auto-fetch</span>
                                  </>
                                )}
                              </button>
                            </div>
                            {formData.cover_image_url && (
                              <img src={formData.cover_image_url} alt="Cover" className="w-full h-20 object-cover rounded-lg" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
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
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

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
              
              <span className="text-sm text-slate-500 ml-4">
                {filteredServices.length} services au total
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}