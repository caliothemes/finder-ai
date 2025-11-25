import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIServiceCard from '@/components/AIServiceCard';
import { Search, Filter, SlidersHorizontal, Sparkles, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ActiveBanner from '@/components/banners/ActiveBanner';
import { useLanguage } from '@/components/LanguageProvider';

export default function Explore() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';
  
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
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

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: allServices = [], isLoading } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }, '-created_date', 200),
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

  const filteredServices = allServices.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.tags && service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'all' || (service.categories && service.categories.includes(selectedCategory));
    const matchesPricing = selectedPricing === 'all' || service.pricing === selectedPricing;

    return matchesSearch && matchesCategory && matchesPricing;
  }).sort((a, b) => {
    // Prioriser les IA avec image de couverture ou logo
    const aHasImage = a.cover_image_url || a.logo_url;
    const bHasImage = b.cover_image_url || b.logo_url;
    
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    
    // Si même statut d'image, trier selon critère sélectionné
    if (sortBy === '-created_date') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === '-views') return (b.views || 0) - (a.views || 0);
    if (sortBy === '-average_rating') return (b.average_rating || 0) - (a.average_rating || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('explore_title')}
          </h1>
          <p className="text-xl text-slate-600">
            {t('explore_subtitle')} {allServices.length} {t('explore_subtitle_suffix')}
          </p>
        </div>

        {/* Bannière Explorer - Haut de page */}
        <div className="mb-8">
          <ActiveBanner position="explore_top" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">{t('explore_filters_title')}</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t('explore_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('explore_all_categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('explore_all_categories')}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Filter */}
            <div>
              <Select value={selectedPricing} onValueChange={setSelectedPricing}>
                <SelectTrigger>
                  <SelectValue placeholder={t('explore_all_pricing')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('explore_all_pricing')}</SelectItem>
                  <SelectItem value="gratuit">{t('explore_pricing_free')}</SelectItem>
                  <SelectItem value="freemium">{t('explore_pricing_freemium')}</SelectItem>
                  <SelectItem value="payant">{t('explore_pricing_paid')}</SelectItem>
                  <SelectItem value="abonnement">{t('explore_pricing_subscription')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 mt-4">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">{t('explore_sort_by')}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('-created_date')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === '-created_date'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('explore_sort_recent')}
              </button>
              <button
                onClick={() => setSortBy('-views')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === '-views'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('explore_sort_views')}
              </button>
              <button
                onClick={() => setSortBy('-average_rating')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === '-average_rating'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('explore_sort_rating')}
              </button>
            </div>
          </div>
        </div>

        {/* Bannière Explorer - Sidebar */}
        <div className="mb-6">
          <ActiveBanner position="explore_sidebar" />
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{filteredServices.length}</span> {filteredServices.length > 1 ? t('explore_results_plural') : t('explore_results')}
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.slice(0, 5).map((service) => (
              <AIServiceCard
                key={service.id}
                service={service}
                isFavorite={favorites.some(f => f.ai_service_id === service.id)}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
              />
            ))}

            {/* Promo Card */}
            <div className="group bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all duration-300 hover:shadow-xl flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t('promo_your_service')}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {t('promo_increase_visibility')}
                </p>
                <Link to={createPageUrl('ProAccount')}>
                  <Button className="bg-purple-950 hover:bg-purple-900 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    {t('promo_become_pro')}
                  </Button>
                </Link>
              </div>
            </div>

            {filteredServices.slice(5).map((service) => (
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
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t('explore_no_results')}
            </h2>
            <p className="text-slate-600">
              {t('explore_no_results_subtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}