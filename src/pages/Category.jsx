import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIServiceCard from '../components/AIServiceCard';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Category() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('id');
  const [user, setUser] = useState(null);
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

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const cats = await base44.entities.Category.filter({ id: categoryId });
      return cats[0] || null;
    },
    enabled: !!categoryId,
  });

  const { data: aiServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['categoryServices', categoryId],
    queryFn: () => base44.entities.AIService.filter(
      { category_id: categoryId, status: 'approved' },
      '-created_date'
    ),
    enabled: !!categoryId,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (serviceId) => {
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

  if (categoryLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Catégorie introuvable</h1>
          <p className="text-slate-600">Cette catégorie n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Catégorie</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            {category.name}
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {category.description}
          </p>
          
          <div className="mt-8 text-slate-400">
            {aiServices.length} outil{aiServices.length > 1 ? 's' : ''} disponible{aiServices.length > 1 ? 's' : ''}
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
                isFavorite={favorites.some(f => f.ai_service_id === service.id)}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Aucun outil disponible
            </h2>
            <p className="text-slate-600">
              Aucun outil n'a encore été ajouté dans cette catégorie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}