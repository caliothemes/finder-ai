import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowRight, Box, Sparkles, Image, MessageSquare, 
  Video, Music, Code, FileText, Briefcase, 
  GraduationCap, Heart, ShoppingBag, Cpu 
} from 'lucide-react';

export default function CategoryGrid({ categories, aiServices = [] }) {
  const iconMap = {
    'Sparkles': Sparkles,
    'Image': Image,
    'MessageSquare': MessageSquare,
    'Video': Video,
    'Music': Music,
    'Code': Code,
    'FileText': FileText,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Heart': Heart,
    'ShoppingBag': ShoppingBag,
    'Cpu': Cpu,
    'Box': Box
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || Box;
  };

  return (
    <div className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Explorez par Catégorie
          </h2>
          <p className="text-xl text-slate-600">
            Trouvez l'outil IA parfait pour votre besoin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <Link
                key={category.id}
                to={createPageUrl(`Category?id=${category.id}`)}
                className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: category.color }} />
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
            );
          })}
        </div>
      </div>
    </div>
  );
}