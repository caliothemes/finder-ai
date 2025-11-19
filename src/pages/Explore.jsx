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

export default function Explore() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';
  
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
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

  const filteredServices = allServices.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.tags && service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'all' || (service.categories && service.categories.includes(selectedCategory));
    const matchesPricing = selectedPricing === 'all' || service.pricing === selectedPricing;

    return matchesSearch && matchesCategory && matchesPricing;
  }).sort((a, b) => {
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
            Explorer tous les outils IA
          </h1>
          <p className="text-xl text-slate-600">
            Découvrez {allServices.length} outils d'intelligence artificielle
          </p>
        </div>

        {/* Bannière */}
        <div className="mb-8">
          <ActiveBanner position="homepage_sidebar" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Filtres et Recherche</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un outil, tag..."
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
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
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
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prix</SelectItem>
                  <SelectItem value="gratuit">Gratuit</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="payant">Payant</SelectItem>
                  <SelectItem value="abonnement">Abonnement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 mt-4">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Trier par:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('-created_date')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === '-created_date'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Plus récents
              </button>
              <button
                onClick={() => setSortBy('-views')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === '-views'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Plus vus
              </button>
              <button
                onClick={() => setSortBy('-average_rating')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === '-average_rating'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Mieux notés
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{filteredServices.length}</span> résultat{filteredServices.length > 1 ? 's' : ''}
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
                  Votre Service IA ici
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Augmentez votre visibilité avec un compte pro
                </p>
                <Link to={createPageUrl('ProAccount')}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Devenir Pro
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
              Aucun résultat
            </h2>
            <p className="text-slate-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}