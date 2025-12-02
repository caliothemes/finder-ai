import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedAI from '@/components/home/FeaturedAI';
import HomeFeaturedAI from '@/components/home/HomeFeaturedAI';
import NewsletterSection from '@/components/home/NewsletterSection';
import LatestNews from '@/components/home/LatestNews';
import AgentFinderAIPromo from '@/components/home/AgentFinderAIPromo';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ActiveBanner from '@/components/banners/ActiveBanner';
import { useLanguage } from '@/components/LanguageProvider';

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

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

  const { data: rawAIServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['aiServices'],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter(
        { status: 'approved' },
        '-created_date',
        50
      );
      return services;
    },
  });

  const aiServices = [...rawAIServices]
    .filter(s => s.cover_image_url)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 15);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => user ? base44.entities.Favorite.filter({ user_email: user.email }) : [],
    enabled: !!user,
  });

  const { data: finderReviews = [] } = useQuery({
    queryKey: ['finderReviewsHome'],
    queryFn: () => base44.entities.FinderAIReview.filter({ active: true }),
  });

  const { data: homeFeaturedServices = [] } = useQuery({
    queryKey: ['homeFeaturedServices'],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter({
        status: 'approved',
        home_featured: true
      });
      return services.slice(0, 6);
    },
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
        toast.success(t('toast_favorite_removed'));
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          ai_service_id: serviceId
        });
        toast.success(t('toast_favorite_added'));
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

      {/* Bannière Hero Homepage */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <ActiveBanner position="homepage_hero" />
      </div>

      {/* 1. Nouveautés IA */}
      <FeaturedAI
        aiServices={aiServices}
        favorites={favorites}
        finderReviews={finderReviews}
        onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
      />

      {/* 2. Outils IA en Vedette - sélection manuelle admin */}
      {homeFeaturedServices.length > 0 && (
        <HomeFeaturedAI
          aiServices={homeFeaturedServices}
          favorites={favorites}
          finderReviews={finderReviews}
          onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
        />
      )}

      {/* 3. Latest AI News */}
      <LatestNews />

      {/* 4. Agent FinderAI Promo */}
      <AgentFinderAIPromo />

      {/* 5. Categories */}
      <CategoryGrid categories={categories} aiServices={aiServices} />

      {/* Bannière entre catégories et bouton Explorer */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ActiveBanner position="homepage_category_bottom" />
      </div>

      {/* CTA Button vers Explorer */}
      <div className="pb-12 px-6 flex justify-center">
        <Link to={createPageUrl('Explore')}>
          <Button className="bg-purple-950 hover:bg-purple-900 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <Sparkles className="w-6 h-6 mr-3" />
            {t('explore_continue')}
            <ChevronRight className="w-6 h-6 ml-3" />
          </Button>
        </Link>
      </div>

      <NewsletterSection />
    </div>
  );
  }