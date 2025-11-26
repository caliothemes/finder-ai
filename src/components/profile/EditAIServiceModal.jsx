import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditAIServiceModal({ service, onClose }) {
  const [formData, setFormData] = useState({
    name: service.name || '',
    tagline: service.tagline || '',
    tagline_en: service.tagline_en || '',
    description: service.description || '',
    description_en: service.description_en || '',
    categories: service.categories || [],
    logo_url: service.logo_url || '',
    cover_image_url: service.cover_image_url || '',
    website_url: service.website_url || '',
    pricing: service.pricing || 'freemium',
    features: service.features || [],
    features_en: service.features_en || [],
    tags: service.tags || []
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const submitRevisionMutation = useMutation({
    mutationFn: async () => {
      const pendingRevision = {
        ...formData,
        submitted_at: new Date().toISOString()
      };

      await base44.entities.AIService.update(service.id, {
        pending_revision: pendingRevision
      });

      // Envoyer email à l'admin
      try {
        await base44.integrations.Core.SendEmail({
          to: 'admin@finderai.com',
          subject: `🔄 Demande de révision: ${service.name}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%); border-radius: 16px; overflow: hidden;">
              <div style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(139, 92, 246, 0.3);">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Demande de révision</h1>
              </div>
              <div style="padding: 40px; background: white; margin: 20px; border-radius: 12px;">
                <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
                  Une demande de révision a été soumise pour le service IA suivant:
                </p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #1e1b4b; margin: 0 0 10px 0;">${service.name}</h3>
                  <p style="color: #64748b; margin: 0;">Soumis par: ${service.submitted_by}</p>
                </div>
                <p style="color: #334155; font-size: 14px;">
                  Connectez-vous à l'administration pour examiner cette demande.
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
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      toast.success('Demande de révision soumise ! Un admin va la valider.');
      onClose();
    },
  });

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
      toast.error('Erreur upload');
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

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Modifier {service.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info révision */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm">
              ⚠️ Vos modifications seront soumises pour validation. Un administrateur devra les approuver avant qu'elles soient visibles.
            </p>
          </div>

          {/* Nom */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nom du service</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Taglines */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">🇫🇷 Tagline</label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Phrase d'accroche en français"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">🇬🇧 Tagline</label>
              <Input
                value={formData.tagline_en}
                onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                placeholder="Tagline in English"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="text-sm font-medium mb-2 block">🇫🇷 Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Description complète en français"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">🇬🇧 Description</label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={4}
              placeholder="Full description in English"
            />
          </div>

          {/* Catégories */}
          <div>
            <label className="text-sm font-medium mb-2 block">Catégories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.categories.includes(cat.id)
                      ? 'bg-purple-100 border-purple-600 text-purple-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Logo</label>
              <div className="flex items-center gap-3">
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                    {uploadingLogo ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600">Changer le logo</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Image de couverture</label>
              <div className="flex flex-col gap-3">
                {formData.cover_image_url && (
                  <img src={formData.cover_image_url} alt="Cover" className="w-full h-24 rounded-lg object-cover" />
                )}
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                    {uploadingCover ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600">Changer l'image</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Prix et URL */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Modèle de prix</label>
              <Select value={formData.pricing} onValueChange={(v) => setFormData({ ...formData, pricing: v })}>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Site web</label>
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fonctionnalités</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.features.map((feature, idx) => (
                <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {feature}
                  <button onClick={() => removeFeature(idx)} className="hover:text-purple-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Nouvelle fonctionnalité"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" variant="outline" onClick={addFeature}>Ajouter</Button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button onClick={() => removeTag(idx)} className="hover:text-slate-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nouveau tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>Ajouter</Button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <Button
            onClick={() => submitRevisionMutation.mutate()}
            disabled={submitRevisionMutation.isPending}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {submitRevisionMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              'Soumettre les modifications'
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}