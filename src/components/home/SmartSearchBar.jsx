import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';

export default function SmartSearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesWithCount'],
    queryFn: async () => {
      const cats = await base44.entities.Category.list();
      const services = await base44.entities.AIService.filter({ status: 'approved' });
      
      return cats.map(cat => ({
        ...cat,
        count: services.filter(s => s.categories?.includes(cat.id)).length
      })).sort((a, b) => b.count - a.count).slice(0, 8);
    },
  });

  const { data: allServices = [] } = useQuery({
    queryKey: ['allServicesSearch'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }, '-views', 100),
  });

  const filteredServices = query.length >= 2
    ? allServices.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase()) ||
        s.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  const trendingServices = allServices
    .filter(s => s.cover_image_url || s.logo_url)
    .slice(0, 4);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 transition-all duration-300 ${
          isFocused ? 'border-purple-400 shadow-purple-500/20' : 'border-white/50'
        }`}>
          <Search className="absolute left-5 w-6 h-6 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            placeholder={t('home_hero_search_placeholder')}
            className="w-full py-5 pl-14 pr-32 text-lg text-slate-900 placeholder-slate-400 bg-transparent rounded-2xl focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-28 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {t('home_hero_search_btn')}
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100]"
        >
          {/* Search Results */}
          {filteredServices.length > 0 && (
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-3">
                <Search className="w-4 h-4" />
                Résultats
              </div>
              <div className="space-y-2">
                {filteredServices.map((service) => (
                  <Link
                    key={service.id}
                    to={createPageUrl(`AIDetail?slug=${service.slug}`)}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {service.logo_url ? (
                      <img src={service.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{service.name}</div>
                      <div className="text-sm text-slate-500 truncate">{service.tagline}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {query.length < 2 && (
            <>
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-3">
                  <Sparkles className="w-4 h-4" />
                  Catégories populaires
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={createPageUrl(`Category?slug=${cat.slug}`)}
                      onClick={() => setShowDropdown(false)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      {cat.name}
                      <span className="text-xs text-purple-500 bg-white px-2 py-0.5 rounded-full">
                        {cat.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  Tendances
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {trendingServices.map((service) => (
                    <Link
                      key={service.id}
                      to={createPageUrl(`AIDetail?slug=${service.slug}`)}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      {service.logo_url ? (
                        <img src={service.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                      <span className="font-medium text-slate-900 text-sm truncate">{service.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* No results */}
          {query.length >= 2 && filteredServices.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucun résultat pour "{query}"</p>
              <Link
                to={createPageUrl(`Explore?search=${encodeURIComponent(query)}`)}
                onClick={() => setShowDropdown(false)}
                className="inline-block mt-3 text-purple-600 hover:text-purple-700 font-medium"
              >
                Recherche avancée →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}