import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIServiceCard from '@/components/AIServiceCard';
import { Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: aiServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['favoriteServices', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      
      const serviceIds = favorites.map(f => f.ai_service_id);
      const services = await Promise.all(
        serviceIds.map(async (id) => {
          const results = await base44.entities.AIService.filter({ id });
          return results[0];
        })
      );
      
      return services.filter(s => s);
    },
    enabled: favorites.length > 0,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (serviceId) => {
      const existing = favorites.find(f => f.ai_service_id === serviceId);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
        toast.success('Retiré des favoris');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (!user || favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
            <Heart className="w-4 h-4" />
            <span>Mes Favoris</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Vos outils IA préférés
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Retrouvez tous les outils que vous avez ajoutés à vos favoris
          </p>
          
          <div className="mt-8 text-slate-400">
            {favorites.length} favori{favorites.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {aiServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiServices.map((service) => (
              <AIServiceCard
                key={service.id}
                service={service}
                isFavorite={true}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-20 h-20 mx-auto text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-slate-600 mb-8">
              Commencez à ajouter des outils à vos favoris pour les retrouver facilement ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}