import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Toutes les catégories</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Explorez par Catégorie
          </h1>
          <p className="text-xl text-slate-600">
            Découvrez les meilleurs outils IA classés par usage
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={createPageUrl(`Category?id=${category.id}`)}
              className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 text-3xl"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  {category.icon === 'Sparkles' && '✨'}
                  {category.icon === 'Image' && '🖼️'}
                  {category.icon === 'MessageSquare' && '💬'}
                  {category.icon === 'Video' && '🎬'}
                  {category.icon === 'Music' && '🎵'}
                  {category.icon === 'Code' && '💻'}
                  {category.icon === 'FileText' && '📄'}
                  {category.icon === 'Briefcase' && '💼'}
                  {category.icon === 'GraduationCap' && '🎓'}
                  {category.icon === 'Heart' && '❤️'}
                  {category.icon === 'ShoppingBag' && '🛍️'}
                  {category.icon === 'Cpu' && '🤖'}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                <div className="flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Explorer</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}