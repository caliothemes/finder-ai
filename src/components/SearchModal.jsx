import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Sparkles, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const { data: allServices = [] } = useQuery({
    queryKey: ['allAIServices'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }),
    enabled: isOpen,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allServices.filter(service => {
      const matchName = service.name?.toLowerCase().includes(query);
      const matchDescription = service.description?.toLowerCase().includes(query);
      const matchTagline = service.tagline?.toLowerCase().includes(query);
      const matchTags = service.tags?.some(tag => tag.toLowerCase().includes(query));
      const matchFeatures = service.features?.some(feature => feature.toLowerCase().includes(query));
      
      return matchName || matchDescription || matchTagline || matchTags || matchFeatures;
    });

    setSearchResults(filtered.slice(0, 8));
  }, [searchQuery, allServices]);

  const popularSearches = [
    'génération d\'images',
    'chatbot',
    'code',
    'vidéo',
    'rédaction',
    'marketing'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher un outil IA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {searchQuery.trim() ? (
            searchResults.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                </h3>
                {searchResults.map((service) => (
                  <Link
                    key={service.id}
                    to={createPageUrl(`AIDetail?id=${service.id}`)}
                    onClick={onClose}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-purple-200"
                  >
                    {service.logo_url && (
                      <img
                        src={service.logo_url}
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 mb-1">{service.name}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{service.tagline}</p>
                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {service.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Aucun résultat
                </h3>
                <p className="text-slate-600">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recherches populaires
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(search)}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Catégories populaires
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      to={createPageUrl(`Category?id=${category.id}`)}
                      onClick={onClose}
                      className="p-3 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium text-slate-700 hover:text-purple-700"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}