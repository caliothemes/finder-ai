import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedAI from '@/components/home/FeaturedAI';
import NewsletterSection from '@/components/home/NewsletterSection';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ActiveBanner from '@/components/banners/ActiveBanner';

export default function Home() {
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

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: aiServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['aiServices'],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter(
        { status: 'approved' },
        '-created_date',
        12
      );
      return services;
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => user ? base44.entities.Favorite.filter({ user_email: user.email }) : [],
    enabled: !!user,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (serviceId) => {
      if (!user) {
        toast.error('Veuillez vous connecter pour ajouter aux favoris');
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

  const handleSearch = (query) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  if (categoriesLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection onSearch={handleSearch} />

      {/* Bannière Hero */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ActiveBanner position="homepage_hero" />
      </div>

      <FeaturedAI
        aiServices={aiServices}
        favorites={favorites}
        onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
      />

      {/* CTA Button */}
      <div className="py-12 px-6 flex justify-center">
        <Link to={createPageUrl('Explore')}>
          <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <Sparkles className="w-6 h-6 mr-3" />
            Continuer l'exploration des IA
            <ChevronRight className="w-6 h-6 ml-3" />
          </Button>
        </Link>
      </div>

      <CategoryGrid categories={categories} aiServices={aiServices} />
      <NewsletterSection />
    </div>
  );
  }