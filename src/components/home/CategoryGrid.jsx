import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowRight, Box, Sparkles, Image, MessageSquare, 
  Video, Music, Code, FileText, Briefcase, 
  GraduationCap, Heart, ShoppingBag, Cpu, Brain, Mic, Bot,
  Palette, Camera, PenTool, Zap, Database, Globe, Search,
  Mail, Calendar, ShoppingCart, Star, Lightbulb, Rocket,
  Target, Users, Gamepad2, Film, Headphones, BookOpen
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function CategoryGrid({ categories, aiServices = [] }) {
  const { t, language } = useLanguage();
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
            {t('home_category_title')}
          </h2>
          <p className="text-xl text-slate-600">
            {t('home_category_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const categoryCount = aiServices.filter(service => 
              service.categories && service.categories.includes(category.id)
            ).length;
            
            const categoryName = language === 'en' && category.name_en ? category.name_en : category.name;
            const categoryDesc = language === 'en' && category.description_en ? category.description_en : category.description;

            return (
              <Link
                key={category.id}
                to={createPageUrl(`Category?slug=${category.slug}`)}
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
                    {categoryName}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {categoryDesc}
                  </p>

                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      {categoryCount} {categoryCount > 1 ? t('home_category_tools_plural') : t('home_category_tools')}
                    </span>
                  </div>

                  <div className="flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                    <span>{t('home_category_explore')}</span>
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