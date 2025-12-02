import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIServiceCard from '@/components/AIServiceCard';
import { Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

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
        toast.success(t('toast_favorite_removed'));
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
            <Heart className="w-4 h-4" />
            <span>{t('favorites_my')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            {t('favorites_title')}
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t('favorites_subtitle')}
          </p>
          
          <div className="mt-8 text-slate-400">
            {favorites.length} {favorites.length > 1 ? t('favorites_count_plural') : t('favorites_count')}
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
            <Heart className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('favorites_none_title')}
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              {t('favorites_none_subtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}