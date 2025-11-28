import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ExternalLink, Star, Heart, Eye, Share2, 
  Check, DollarSign, Sparkles, MessageSquare, Award, CreditCard, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';
import DefaultAILogo from '@/components/DefaultAILogo';
import FinderAIReviewBlock from '@/components/FinderAIReviewBlock';
import FinderAIReviewBadge from '@/components/FinderAIReviewBadge';

export default function AIDetail() {
  const { language, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const serviceSlug = urlParams.get('slug');
  const serviceId = urlParams.get('id'); // Fallback pour compatibilité
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimData, setClaimData] = useState({
    first_name: '', last_name: '', company: '', ai_website: '', id_document_url: ''
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: service, isLoading } = useQuery({
    queryKey: ['aiService', serviceSlug || serviceId],
    queryFn: async () => {
      let services;
      if (serviceSlug) {
        services = await base44.entities.AIService.filter({ slug: serviceSlug });
      } else {
        services = await base44.entities.AIService.filter({ id: serviceId });
      }
      if (services.length > 0) {
        await base44.entities.AIService.update(services[0].id, {
          views: (services[0].views || 0) + 1
        });
        return services[0];
      }
      return null;
    },
    enabled: !!(serviceSlug || serviceId),
  });

  // Mise à jour des meta tags pour le SEO
  useEffect(() => {
    if (service) {
      document.title = `${service.name} - Finder AI`;
      
      // Meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = service.tagline || service.description?.substring(0, 160);

      // Open Graph
      const ogTags = {
        'og:title': service.name,
        'og:description': service.tagline || service.description?.substring(0, 160),
        'og:image': service.cover_image_url || service.logo_url,
        'og:url': window.location.href
      };
      
      Object.entries(ogTags).forEach(([property, content]) => {
        if (content) {
          let tag = document.querySelector(`meta[property="${property}"]`);
          if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', property);
            document.head.appendChild(tag);
          }
          tag.content = content;
        }
      });
    }
  }, [service]);

  const { data: categories = [] } = useQuery({
    queryKey: ['serviceCategories', service?.categories],
    queryFn: async () => {
      if (!service.categories || service.categories.length === 0) return [];
      const allCats = await base44.entities.Category.list();
      return allCats.filter(cat => service.categories.includes(cat.id));
    },
    enabled: !!service?.categories,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', serviceId],
    queryFn: () => base44.entities.Review.filter({ ai_service_id: serviceId }, '-created_date'),
    enabled: !!serviceId,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const isFavorite = favorites.some(f => f.ai_service_id === serviceId);

  // Avis Finder AI
  const { data: finderReview } = useQuery({
    queryKey: ['finderAIReview', service?.id],
    queryFn: async () => {
      const reviews = await base44.entities.FinderAIReview.filter({ 
        ai_service_id: service.id,
        active: true 
      });
      return reviews[0] || null;
    },
    enabled: !!service?.id,
  });

  // Compte Pro et demande d'avis
  const { data: proAccount } = useQuery({
    queryKey: ['proAccountForReview', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.ProAccount.filter({ user_email: user.email });
      return accounts[0] || null;
    },
    enabled: !!user,
  });

  const { data: existingReviewRequest } = useQuery({
    queryKey: ['reviewRequest', service?.id, user?.email],
    queryFn: async () => {
      const requests = await base44.entities.FinderAIReviewRequest.filter({
        ai_service_id: service.id,
        user_email: user.email
      });
      return requests[0] || null;
    },
    enabled: !!user && !!service?.id,
  });

  const requestReviewMutation = useMutation({
    mutationFn: async () => {
      if (!proAccount || proAccount.credits < 3) {
        toast.error('Vous avez besoin de 3 crédits pour demander un avis Finder AI');
        return;
      }

      await base44.entities.FinderAIReviewRequest.create({
        ai_service_id: service.id,
        user_email: user.email,
        pro_account_id: proAccount.id,
        status: 'pending',
        credits_used: 3
      });

      await base44.entities.ProAccount.update(proAccount.id, {
        credits: proAccount.credits - 3
      });

      toast.success('Demande d\'avis Finder AI envoyée ! (3 crédits utilisés)');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewRequest'] });
      queryClient.invalidateQueries({ queryKey: ['proAccountForReview'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Veuillez vous connecter');
        base44.auth.redirectToLogin();
        return;
      }

      const existing = favorites.find(f => f.ai_service_id === serviceId);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
        toast.success('Retiré des favoris');
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          ai_service_id: serviceId
        });
        toast.success('Ajouté aux favoris ❤️');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const { data: existingClaim } = useQuery({
    queryKey: ['ownershipClaim', serviceId, user?.email],
    queryFn: async () => {
      const claims = await base44.entities.AIOwnershipClaim.filter({
        ai_service_id: serviceId,
        user_email: user.email
      });
      return claims[0] || null;
    },
    enabled: !!user && !!serviceId,
  });

  const submitClaimMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Veuillez vous connecter');
        base44.auth.redirectToLogin();
        return;
      }

      await base44.entities.AIOwnershipClaim.create({
        ai_service_id: serviceId,
        user_email: user.email,
        ...claimData,
        status: 'pending'
      });

      // Envoyer email à l'admin
      await base44.integrations.Core.SendEmail({
        to: 'admin@finderai.com',
        subject: `Nouvelle revendication IA: ${service.name}`,
        body: `
          <h2>Nouvelle revendication d'IA</h2>
          <p><strong>Service IA:</strong> ${service.name}</p>
          <p><strong>Demandeur:</strong> ${claimData.first_name} ${claimData.last_name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Société:</strong> ${claimData.company}</p>
          <p><strong>Site web de l'IA:</strong> ${claimData.ai_website}</p>
          <p><strong>Document d'identité:</strong> <a href="${claimData.id_document_url}">Voir le document</a></p>
          <p>Veuillez vérifier cette revendication dans l'admin.</p>
        `
      });

      toast.success('Revendication soumise avec succès !');
      setShowClaimForm(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownershipClaim'] });
    },
  });

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setClaimData({ ...claimData, id_document_url: file_url });
      toast.success('Document uploadé');
    } catch (error) {
      toast.error('Erreur upload');
    } finally {
      setUploadingDoc(false);
    }
  };

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Veuillez vous connecter pour laisser un avis');
        base44.auth.redirectToLogin();
        return;
      }
      if (rating === 0 || !comment.trim()) {
        toast.error('Veuillez donner une note et un commentaire');
        return;
      }

      await base44.entities.Review.create({
        ai_service_id: serviceId,
        user_email: user.email,
        user_name: user.full_name || user.email.split('@')[0],
        rating,
        comment
      });

      const allReviews = await base44.entities.Review.filter({ ai_service_id: serviceId });
      const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      
      await base44.entities.AIService.update(serviceId, {
        average_rating: avgRating
      });

      setRating(0);
      setComment('');
      toast.success('Avis publié avec succès !');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['aiService'] });
    },
  });

  if (isLoading || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getPricingColor = (pricing) => {
    const colors = {
      gratuit: 'bg-green-100 text-green-800',
      freemium: 'bg-blue-100 text-blue-800',
      payant: 'bg-orange-100 text-orange-800',
      abonnement: 'bg-purple-100 text-purple-800'
    };
    return colors[pricing] || colors.freemium;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 pt-24 pb-32 overflow-hidden">
        {service.cover_image_url && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${service.cover_image_url})` }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        {!service.cover_image_url && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        )}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {service.logo_url ? (
                <img
                  src={service.logo_url}
                  alt={service.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <DefaultAILogo size={100} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className={`${service.cover_image_url ? 'bg-black/40 backdrop-blur-sm' : ''} rounded-2xl p-6`}>
                {categories.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Badge key={cat.id} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-5xl font-bold text-white">
                    {service.name}
                  </h1>
                  {finderReview && <FinderAIReviewBadge rating={finderReview.rating} />}
                </div>

                <p className="text-2xl text-slate-300 mb-6">
                  {language === 'en' && service.tagline_en ? service.tagline_en : service.tagline}
                </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-semibold">
                    {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-slate-300">({reviews.length} avis)</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Eye className="w-5 h-5 text-slate-300" />
                  <span className="text-white">{service.views || 0} vues</span>
                </div>

                <Badge className={`${getPricingColor(service.pricing)} text-base px-4 py-2`}>
                  <DollarSign className="w-4 h-4 mr-1" />
                  {service.pricing}
                </Badge>
              </div>

              <div className="flex gap-3">
                {service.website_url && (
                  <a href={service.website_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                      Visiter le site
                      <ExternalLink className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-6 py-6"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Lien copié !');
                  }}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-6 py-6"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                
                {user && service.submitted_by !== user.email && !existingClaim && (
                  <Button
                    variant="outline"
                    onClick={() => setShowClaimForm(true)}
                    className="bg-yellow-500/20 backdrop-blur-sm border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30 px-6 py-6"
                  >
                    Revendiquer cette IA
                  </Button>
                )}

                {existingClaim && (
                  <Badge className="px-6 py-3 text-sm">
                    {existingClaim.status === 'pending' ? '⏳ En attente de validation' : 
                     existingClaim.status === 'approved' ? '✅ Revendication approuvée' : 
                     '❌ Revendication refusée'}
                  </Badge>
                )}
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>

      {/* Claim Form Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">Revendiquer cette IA</h2>
            <p className="text-slate-600 mb-6">Remplissez ce formulaire pour revendiquer la propriété de cette fiche IA</p>
            
            <form onSubmit={(e) => { e.preventDefault(); submitClaimMutation.mutate(); }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <Input
                    value={claimData.first_name}
                    onChange={(e) => setClaimData({...claimData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <Input
                    value={claimData.last_name}
                    onChange={(e) => setClaimData({...claimData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Société *</label>
                <Input
                  value={claimData.company}
                  onChange={(e) => setClaimData({...claimData, company: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Site web de l'IA *</label>
                <Input
                  type="url"
                  value={claimData.ai_website}
                  onChange={(e) => setClaimData({...claimData, ai_website: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pièce d'identité * (pour vérification)</label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDoc}
                  required={!claimData.id_document_url}
                />
                {claimData.id_document_url && (
                  <p className="text-sm text-green-600 mt-2">✓ Document uploadé</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitClaimMutation.isPending || uploadingDoc}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
                >
                  Soumettre la revendication
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClaimForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
                {language === 'en' && service.description_en ? service.description_en : service.description}
              </p>
            </div>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl p-8 shadow-xl border border-purple-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  {language === 'en' ? 'Key Features' : 'Fonctionnalités principales'}
                </h2>
                <ul className="space-y-3">
                  {(language === 'en' && service.features_en ? service.features_en : service.features).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Avis Finder AI */}
            {finderReview && <FinderAIReviewBlock review={finderReview} />}

            {/* Demander un avis Finder AI - seulement si propriétaire et pas d'avis existant */}
            {user && existingClaim?.status === 'approved' && !finderReview && !existingReviewRequest && proAccount && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-dashed border-purple-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">
                      {language === 'en' ? 'Request a Finder AI Review' : 'Demander un Avis Finder AI'}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {language === 'en' 
                        ? 'Get an official review from our team to boost your credibility (3 credits)'
                        : 'Obtenez un avis officiel de notre équipe pour renforcer votre crédibilité (3 crédits)'}
                    </p>
                  </div>
                  <Button
                    onClick={() => requestReviewMutation.mutate()}
                    disabled={requestReviewMutation.isPending || proAccount.credits < 3}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {requestReviewMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    3 crédits
                  </Button>
                </div>
                {proAccount.credits < 3 && (
                  <p className="text-sm text-red-600 mt-2">
                    {language === 'en' ? 'Insufficient credits' : 'Crédits insuffisants'} ({proAccount.credits}/3)
                  </p>
                )}
              </div>
            )}

            {/* Status de la demande d'avis */}
            {existingReviewRequest && !finderReview && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-800 font-medium">
                    {existingReviewRequest.status === 'pending' && (language === 'en' ? 'Review request pending...' : 'Demande d\'avis en attente...')}
                    {existingReviewRequest.status === 'in_progress' && (language === 'en' ? 'Review in progress...' : 'Avis en cours de rédaction...')}
                  </span>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                {t('reviews_title')} ({reviews.length})
              </h2>

              {/* Write review */}
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl">
                <h3 className="font-semibold text-lg mb-4">{t('reviews_write')}</h3>
                
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <Textarea
                  placeholder={t('reviews_placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4 min-h-32"
                />

                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {t('reviews_submit')}
                </Button>
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 border border-slate-200 rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-slate-900">{review.user_name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(review.created_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <p className="text-slate-700">{review.comment}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    {t('reviews_empty')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover image */}
            {service.cover_image_url && (
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={service.cover_image_url}
                  alt={service.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <h3 className="font-bold text-lg mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}