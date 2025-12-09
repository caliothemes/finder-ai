import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { aiToolsCategories } from '@/components/agent/aiToolsData';
import AIServiceModal from '@/components/agent/AIServiceModal';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { createPageUrl } from '@/utils';
import { 
  Image, Scale, FileText, Code, 
  TrendingUp, Briefcase, GraduationCap, Video,
  Sparkles, MessageSquare, ArrowRight,
  Wand2, CheckCircle, Languages, Minimize2,
  RefreshCw, Palette, Edit, FileCheck, Search,
  PenTool, BarChart, Receipt, HelpCircle,
  Layers, BookOpen, Users, Mic, Film, Music,
  Captions, Shield, Bug, Target, Share2, Hash,
  CheckSquare, FileSearch, MessageCircle,
  Presentation
} from 'lucide-react';

const iconMap = {
  Image, Scale, FileText, Code, TrendingUp, Briefcase, GraduationCap, Video,
  Sparkles, MessageSquare, Wand2, CheckCircle, Languages, Minimize2,
  RefreshCw, Palette, Edit, FileCheck, Search, PenTool, BarChart, Receipt,
  HelpCircle, Layers, BookOpen, Users, Mic, Film, Music, Captions, Shield,
  Bug, Target, Share2, Hash, CheckSquare, FileSearch, MessageCircle,
  Presentation
};

export default function AIToolsCategory() {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const urlParams = new URLSearchParams(location.search);
  const categorySlug = urlParams.get('category');
  
  const category = aiToolsCategories.find(cat => cat.slug === categorySlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Catégorie non trouvée' : 'Category not found'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {language === 'fr' ? 'Cette catégorie n\'existe pas.' : 'This category does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  const CategoryIcon = iconMap[category.icon] || Sparkles;

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-xl`}>
                <CategoryIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {category.name[language]}
            </h1>
            
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {language === 'fr' 
                ? `Découvrez ${category.services.length} services IA pour ${category.name.fr.toLowerCase()}` 
                : `Discover ${category.services.length} AI services for ${category.name.en.toLowerCase()}`
              }
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.services.map((service) => {
              const ServiceIcon = iconMap[service.icon] || Sparkles;
              
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="group text-left rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <ServiceIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {service.name[language]}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {service.description[language]}
                  </p>

                  <div className="mt-4 flex items-center text-sm font-medium text-purple-600 group-hover:gap-2 transition-all">
                    <span>{language === 'fr' ? 'En savoir plus' : 'Learn more'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div 
            className="mt-16 rounded-3xl p-8 text-center"
            style={{
              background: isDark 
                ? 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))' 
                : 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {language === 'fr' 
                ? 'Besoin de recommandations personnalisées ?' 
                : 'Need personalized recommendations?'
              }
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {language === 'fr'
                ? 'Agent FinderAI peut vous aider à trouver les meilleurs outils pour vos besoins spécifiques.'
                : 'Agent FinderAI can help you find the best tools for your specific needs.'
              }
            </p>
            <Link 
              to={createPageUrl('FinderGPT')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all shadow-lg"
            >
              <MessageSquare className="w-5 h-5" />
              {language === 'fr' ? 'Discuter avec l\'agent' : 'Chat with agent'}
            </Link>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <AIServiceModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}