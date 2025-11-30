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
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Vérifier s'il y a une bannière sidebar active
  const { data: hasSidebarBanner = false } = useQuery({
    queryKey: ['exploreSidebarBanner'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const banners = await base44.entities.BannerReservation.filter({
        position: 'explore_sidebar',
        active: true,
        validated: true
      });
      return banners.some(b => b.reserved_dates?.includes(today));
    },
    staleTime: 60000,
  });

  // Sur la page 1: promo card (1) + bannière sidebar si active (1) + services IA
  // Total doit être multiple de 3 = 24 items
  // Donc: 24 - 1 (promo) - 1 (bannière si présente) = 22 ou 23 services
  const itemsPerPage = currentPage === 1 ? (hasSidebarBanner ? 22 : 23) : 24;

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
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }, '-created_date', 5000),
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedPricing, sortBy]);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: finderReviews = [] } = useQuery({
    queryKey: ['finderReviewsExplore'],
    queryFn: () => base44.entities.FinderAIReview.filter({ active: true }),
  });

  const getFinderReview = (serviceId) => {
    return finderReviews.find(r => r.ai_service_id === serviceId);
  };

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
    // Trier par date de création (plus récents d'abord)
    return new Date(b.created_date) - new Date(a.created_date);
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('explore_title')}
          </h1>
          <p className="text-xl text-slate-600">
            {t('explore_subtitle')} <span className="font-semibold text-purple-600">{allServices.length}</span> {t('explore_subtitle_suffix')}
          </p>
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

          {/* Bannière Explorer - Haut de page */}
          <div className="mb-8">
          <ActiveBanner position="explore_top" showPlaceholder={true} />
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPage === 1 && paginatedServices.slice(0, 3).map((service) => (
                                    <AIServiceCard
                                      key={service.id}
                                      service={service}
                                      isFavorite={favorites.some(f => f.ai_service_id === service.id)}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                      hasFinderReview={!!getFinderReview(service.id)}
                                      finderReviewRating={getFinderReview(service.id)?.rating}
                                    />
                                  ))}

              {/* Bannière Explorer Sidebar en format card - seulement page 1 et si active */}
              {currentPage === 1 && hasSidebarBanner && <ActiveBanner position="explore_sidebar" />}

              {currentPage === 1 && paginatedServices.slice(3, 5).map((service) => (
                                    <AIServiceCard
                                      key={service.id}
                                      service={service}
                                      isFavorite={favorites.some(f => f.ai_service_id === service.id)}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                      hasFinderReview={!!getFinderReview(service.id)}
                                      finderReviewRating={getFinderReview(service.id)?.rating}
                                    />
                                  ))}

              {/* Promo Card - seulement page 1 */}
              {currentPage === 1 && (
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
              )}

              {currentPage === 1 ? paginatedServices.slice(5).map((service) => (
                                    <AIServiceCard
                                      key={service.id}
                                      service={service}
                                      isFavorite={favorites.some(f => f.ai_service_id === service.id)}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                      hasFinderReview={!!getFinderReview(service.id)}
                                      finderReviewRating={getFinderReview(service.id)?.rating}
                                    />
                                  )) : paginatedServices.map((service) => (
                                    <AIServiceCard
                                      key={service.id}
                                      service={service}
                                      isFavorite={favorites.some(f => f.ai_service_id === service.id)}
                                      onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                                      hasFinderReview={!!getFinderReview(service.id)}
                                      finderReviewRating={getFinderReview(service.id)?.rating}
                                    />
                                  ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCurrentPage(1); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                >
                  ‹
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setCurrentPage(pageNum); window.scrollTo(0, 0); }}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === totalPages}
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCurrentPage(totalPages); window.scrollTo(0, 0); }}
                  disabled={currentPage === totalPages}
                >
                  »
                </Button>

                <span className="text-sm text-slate-500 ml-4">
                  Page {currentPage} sur {totalPages}
                </span>
              </div>
            )}

            {/* Bannière bas de page Explorer */}
            <div className="mt-12">
              <ActiveBanner position="explore_bottom" showPlaceholder={true} />
            </div>
          </>
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