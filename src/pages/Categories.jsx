import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowRight, Sparkles, MessageSquare, Video, Music, Code, 
  Palette, TrendingUp, FileText, Search, BarChart, Box,
  Camera, Mic, Terminal, Wand2, Mail, Calendar, Database,
  Globe, Shield, Zap, Brain, Image as ImageIcon, Bot, PenTool,
  Heart, Star, Lightbulb, Rocket, Target, Users, Briefcase,
  GraduationCap, Gamepad2, Film, Headphones, BookOpen, ShoppingCart
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function Categories() {
  const { t } = useLanguage();
  
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: aiServices = [] } = useQuery({
    queryKey: ['aiServices'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }),
  });

  const iconMap = {
    'Sparkles': Sparkles,
    'MessageSquare': MessageSquare,
    'Video': Video,
    'Music': Music,
    'Code': Code,
    'Palette': Palette,
    'TrendingUp': TrendingUp,
    'FileText': FileText,
    'Search': Search,
    'BarChart': BarChart,
    'Camera': Camera,
    'Mic': Mic,
    'Terminal': Terminal,
    'Wand2': Wand2,
    'Mail': Mail,
    'Calendar': Calendar,
    'Database': Database,
    'Globe': Globe,
    'Shield': Shield,
    'Zap': Zap,
    'Brain': Brain,
    'Image': ImageIcon,
    'Bot': Bot,
    'PenTool': PenTool,
    'Heart': Heart,
    'Star': Star,
    'Lightbulb': Lightbulb,
    'Rocket': Rocket,
    'Target': Target,
    'Users': Users,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Gamepad2': Gamepad2,
    'Film': Film,
    'Headphones': Headphones,
    'BookOpen': BookOpen,
    'ShoppingCart': ShoppingCart,
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Box;
  };

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
            <span>{t('categories_all')}</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t('categories_title')}
          </h1>
          <p className="text-xl text-slate-600">
            {t('categories_subtitle')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            const categoryCount = aiServices.filter(service => 
              service.categories && service.categories.includes(category.id)
            ).length;
            
            return (
              <Link
                key={category.id}
                to={createPageUrl(`Category?slug=${category.slug}`)}
                className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: category.color ? `${category.color}20` : '#f3e8ff' }}
                  >
                    <IconComponent className="w-7 h-7" style={{ color: category.color || '#9333ea' }} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      {categoryCount} {categoryCount > 1 ? t('categories_tools_plural') : t('categories_tools')}
                    </span>
                  </div>

                  <div className="flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                    <span>{t('categories_explore')}</span>
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