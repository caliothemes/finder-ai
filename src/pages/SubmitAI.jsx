import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Upload, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubmitAI() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category_id: '',
    website_url: '',
    pricing: 'freemium',
    logo_url: '',
    cover_image_url: '',
    features: [''],
    tags: ['']
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: proAccount } = useQuery({
    queryKey: ['proAccount', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.ProAccount.filter({ user_email: user.email });
      return accounts[0] || null;
    },
    enabled: !!user,
  });

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'cover_image_url']: file_url
      }));
      
      toast.success('Image uploadée avec succès');
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const submitAIMutation = useMutation({
    mutationFn: async () => {
      if (!formData.name || !formData.description || !formData.category_id) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const slug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const cleanFeatures = formData.features.filter(f => f.trim() !== '');
      const cleanTags = formData.tags.filter(t => t.trim() !== '');

      await base44.entities.AIService.create({
        ...formData,
        slug,
        features: cleanFeatures,
        tags: cleanTags,
        submitted_by: user.email,
        status: 'pending',
        views: 0,
        likes: 0,
        average_rating: 0
      });

      if (!proAccount) {
        await base44.entities.ProAccount.create({
          user_email: user.email,
          company_name: formData.name,
          plan_type: 'free',
          credits: 0,
          status: 'active'
        });
      }

      toast.success('Votre IA a été soumise et sera examinée prochainement ! 🎉');
      
      setFormData({
        name: '',
        tagline: '',
        description: '',
        category_id: '',
        website_url: '',
        pricing: 'freemium',
        logo_url: '',
        cover_image_url: '',
        features: [''],
        tags: ['']
      });
    }
  });

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const updateTag = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Rejoignez le répertoire</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Proposer mon outil IA
          </h1>
          <p className="text-xl text-slate-600">
            Partagez votre outil avec des milliers d'utilisateurs
          </p>
        </div>

        {/* Pro Account Banner */}
        {!proAccount && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Compte Pro Gratuit</h3>
                <p className="text-purple-100 mb-4">
                  En soumettant votre IA, vous créez automatiquement un compte Pro gratuit pour gérer vos outils et accéder à des fonctionnalités avancées.
                </p>
                <Link to={createPageUrl('ProAccount')}>
                  <Button variant="outline" className="bg-white text-purple-600 hover:bg-purple-50">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Informations de base</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name">Nom de l'outil IA *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: ChatGPT, Midjourney..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="tagline">Phrase d'accroche *</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Une courte description en une ligne"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description complète *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez en détail votre outil IA, ses cas d'usage, et ce qui le rend unique..."
                    className="mt-2 min-h-32"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pricing">Modèle de prix *</Label>
                    <Select
                      value={formData.pricing}
                      onValueChange={(value) => setFormData({ ...formData, pricing: value })}
                    >
                      <SelectTrigger className="mt-2">
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

                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Visuels</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-24 h-24 mx-auto rounded-xl object-cover mb-4" />
                    ) : (
                      <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploading} asChild>
                        <span>{uploading ? 'Upload...' : 'Choisir un logo'}</span>
                      </Button>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Image de couverture</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                    {formData.cover_image_url ? (
                      <img src={formData.cover_image_url} alt="Cover" className="w-full h-24 mx-auto rounded-xl object-cover mb-4" />
                    ) : (
                      <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'cover')}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploading} asChild>
                        <span>{uploading ? 'Upload...' : 'Choisir une image'}</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Fonctionnalités</h2>
              
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Ex: Génération d'images en haute résolution"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeFeature(index)}
                      disabled={formData.features.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter une fonctionnalité
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Tags</h2>
              
              <div className="space-y-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="Ex: image, AI, créatif"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeTag(index)}
                      disabled={formData.tags.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="w-full"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter un tag
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t">
              <Button
                onClick={() => submitAIMutation.mutate()}
                disabled={submitAIMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
              >
                {submitAIMutation.isPending ? (
                  'Soumission en cours...'
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Soumettre mon outil IA
                  </>
                )}
              </Button>
              
              <p className="text-center text-sm text-slate-500 mt-4">
                Votre soumission sera examinée sous 48h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}