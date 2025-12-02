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
import { useTheme } from '@/components/ThemeProvider';

export default function CategoryGrid({ categories, aiServices = [] }) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
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
    'ShoppingCart': ShoppingCart,
    'Cpu': Cpu,
    'Box': Box,
    'Brain': Brain,
    'Mic': Mic,
    'Bot': Bot,
    'Palette': Palette,
    'Camera': Camera,
    'PenTool': PenTool,
    'Zap': Zap,
    'Database': Database,
    'Globe': Globe,
    'Search': Search,
    'Mail': Mail,
    'Calendar': Calendar,
    'Star': Star,
    'Lightbulb': Lightbulb,
    'Rocket': Rocket,
    'Target': Target,
    'Users': Users,
    'Gamepad2': Gamepad2,
    'Film': Film,
    'Headphones': Headphones,
    'BookOpen': BookOpen
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || Box;
  };

  return (
    <div className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('home_category_title')}
          </h2>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
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
                className="group relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                  style={{ background: theme === 'dark' ? 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))' : 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))' }}
                />

                <div className="relative">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: category.color }} />
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {categoryName}
                  </h3>

                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {categoryDesc}
                  </p>

                  <div className="mb-3">
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)', color: '#a855f7' }}
                    >
                      {categoryCount} {categoryCount > 1 ? t('home_category_tools_plural') : t('home_category_tools')}
                    </span>
                  </div>

                  <div className="flex items-center text-purple-500 font-medium text-sm group-hover:gap-2 transition-all">
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