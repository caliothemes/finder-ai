import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ExternalLink, Star, Heart, Eye, Share2, 
  Check, DollarSign, Sparkles, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AIDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
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
    queryKey: ['aiService', serviceId],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter({ id: serviceId });
      if (services.length > 0) {
        await base44.entities.AIService.update(serviceId, {
          views: (services[0].views || 0) + 1
        });
        return services[0];
      }
      return null;
    },
    enabled: !!serviceId,
  });

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
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl shadow-2xl">
                  🤖
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

                <h1 className="text-5xl font-bold text-white mb-4">
                  {service.name}
                </h1>

                <p className="text-2xl text-slate-300 mb-6">
                  {service.tagline}
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
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Fonctionnalités principales
                </h2>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                Avis des utilisateurs ({reviews.length})
              </h2>

              {/* Write review */}
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl">
                <h3 className="font-semibold text-lg mb-4">Laisser un avis</h3>
                
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
                  placeholder="Partagez votre expérience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4 min-h-32"
                />

                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Publier l'avis
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
                    Aucun avis pour le moment. Soyez le premier à donner votre avis !
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