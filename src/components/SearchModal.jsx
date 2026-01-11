import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, X, Sparkles, TrendingUp, Clock, Star, Zap, 
  Image, MessageSquare, Code, Video, PenTool, Mic, 
  BarChart3, Brain, Globe, Filter, ArrowRight, Eye
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const quickFilters = [
  { label: 'Images', icon: Image, query: 'images', color: 'from-pink-500 to-rose-500' },
  { label: 'Chatbots', icon: MessageSquare, query: 'chatbot', color: 'from-blue-500 to-cyan-500' },
  { label: 'Code', icon: Code, query: 'code', color: 'from-green-500 to-emerald-500' },
  { label: 'Vidéo', icon: Video, query: 'vidéo', color: 'from-purple-500 to-violet-500' },
  { label: 'Rédaction', icon: PenTool, query: 'rédaction', color: 'from-orange-500 to-amber-500' },
  { label: 'Audio', icon: Mic, query: 'audio', color: 'from-red-500 to-pink-500' },
  { label: 'Analytics', icon: BarChart3, query: 'analytics', color: 'from-indigo-500 to-blue-500' },
  { label: 'Productivité', icon: Brain, query: 'productivité', color: 'from-teal-500 to-cyan-500' },
];

const pricingFilters = [
  { label: 'Gratuit', value: 'gratuit', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { label: 'Freemium', value: 'freemium', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'Payant', value: 'payant', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
];

export default function SearchModal({ isOpen, onClose }) {
  // TOUS les hooks doivent être appelés AVANT toute logique ou return
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Hooks TOUJOURS appelés - pas de enabled conditionnel
  const { data: allServices = [] } = useQuery({
    queryKey: ['allAIServices'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }),
    staleTime: 300000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
    staleTime: 300000,
  });

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, [isOpen]);

  // Trending services (most viewed)
  const trendingServices = useMemo(() => {
    return [...allServices]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
  }, [allServices]);

  // New services (last 7 days)
  const newServices = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return allServices
      .filter(s => new Date(s.created_date) > weekAgo)
      .slice(0, 4);
  }, [allServices]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && !selectedPricing && !selectedCategory) {
      return [];
    }

    let filtered = allServices;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => {
        const matchName = service.name?.toLowerCase().includes(query);
        const matchDescription = service.description?.toLowerCase().includes(query);
        const matchTagline = service.tagline?.toLowerCase().includes(query);
        const matchTags = service.tags?.some(tag => tag.toLowerCase().includes(query));
        const matchFeatures = service.features?.some(feature => feature.toLowerCase().includes(query));
        
        return matchName || matchDescription || matchTagline || matchTags || matchFeatures;
      });
    }

    if (selectedPricing) {
      filtered = filtered.filter(s => s.pricing === selectedPricing);
    }

    if (selectedCategory) {
      filtered = filtered.filter(s => s.categories?.includes(selectedCategory));
    }

    return filtered.slice(0, 10);
  }, [searchQuery, allServices, selectedPricing, selectedCategory]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const newRecent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  };

  const clearFilters = () => {
    setSelectedPricing(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedPricing || selectedCategory || searchQuery.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0 gap-0">
        {/* Header avec recherche */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 via-white to-pink-50 border-b p-6 z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                type="text"
                placeholder="Rechercher parmi 500+ outils IA..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-purple-200 focus:border-purple-400 rounded-2xl bg-white shadow-sm"
                autoFocus
              />
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, idx) => {
              const Icon = filter.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSearch(filter.query)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-purple-700`}
                >
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${filter.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Filtres avancés */}
          <div className="px-6 py-4 bg-slate-50 border-b flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtres:</span>
            </div>
            
            {/* Prix */}
            <div className="flex gap-2">
              {pricingFilters.map(pf => (
                <button
                  key={pf.value}
                  onClick={() => setSelectedPricing(selectedPricing === pf.value ? null : pf.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedPricing === pf.value 
                      ? 'ring-2 ring-purple-400 ring-offset-1 ' + pf.color
                      : pf.color
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>

            {/* Catégories populaires */}
            <div className="flex gap-2 flex-wrap">
              {categories.slice(0, 4).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-purple-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Effacer tout
              </button>
            )}
          </div>

          <div className="p-6">
            {hasActiveFilters ? (
              searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                    </h3>
                    <Link 
                      to={createPageUrl(`Explore?search=${encodeURIComponent(searchQuery)}`)}
                      onClick={onClose}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      Voir tous les résultats
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid gap-3">
                    {searchResults.map((service) => (
                      <Link
                        key={service.id}
                        to={createPageUrl(`AIDetail?id=${service.id}`)}
                        onClick={onClose}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all group"
                      >
                        {service.logo_url ? (
                          <img
                            src={service.logo_url}
                            alt={service.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-purple-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                              {service.name}
                            </h4>
                            {service.featured && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-1">{service.tagline}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {service.pricing && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {service.pricing}
                              </Badge>
                            )}
                            {service.views > 0 && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {service.views} vues
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Essayez avec d'autres mots-clés ou filtres
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-8">
                {/* Recherches récentes */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recherches récentes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(search)}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Tendances du moment
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {trendingServices.map((service, idx) => (
                      <Link
                        key={service.id}
                        to={createPageUrl(`AIDetail?id=${service.id}`)}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl hover:shadow-md transition-all border border-orange-100 hover:border-orange-200"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        {service.logo_url ? (
                          <img src={service.logo_url} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{service.name}</div>
                          <div className="text-xs text-slate-500">{service.views || 0} vues</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Nouveautés */}
                {newServices.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Nouveautés cette semaine
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {newServices.map((service) => (
                        <Link
                          key={service.id}
                          to={createPageUrl(`AIDetail?id=${service.id}`)}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all border border-purple-100 hover:border-purple-200"
                        >
                          {service.logo_url ? (
                            <img src={service.logo_url} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">{service.name}</div>
                            <Badge className="bg-green-100 text-green-700 text-xs mt-1">Nouveau</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Catégories */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Explorer par catégorie
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.slice(0, 9).map((category) => (
                      <Link
                        key={category.id}
                        to={createPageUrl(`Category?id=${category.id}`)}
                        onClick={onClose}
                        className="p-4 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all text-center group"
                      >
                        <div className="font-medium text-slate-700 group-hover:text-purple-700">
                          {category.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 px-6 py-3 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-white border rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-0.5 bg-white border rounded text-xs">K</kbd>
              <span className="ml-1">pour ouvrir</span>
            </span>
          </div>
          <Link 
            to={createPageUrl('Explore')}
            onClick={onClose}
            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            Explorer tout le catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}