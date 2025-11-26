import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIServiceCard from '@/components/AIServiceCard';
import { 
  Sparkles, Zap, Image as ImageIcon, MessageSquare, Music, Video, 
  Brain, Code, FileText, Palette, Box, Search, Bot, Database, 
  Globe, Shield, Target, TrendingUp, Users, Mic, Camera, Mail, 
  Heart, PenTool, Crown, Star, Lightbulb, Rocket, Briefcase,
  GraduationCap, Gamepad2, Film, Headphones, BookOpen, ShoppingCart, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ActiveBanner from '@/components/banners/ActiveBanner';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function Category() {
  const urlParams = new URLSearchParams(window.location.search);
  const categorySlug = urlParams.get('slug');
  const categoryId = urlParams.get('id'); // Fallback pour compatibilité
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

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

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categorySlug || categoryId],
    queryFn: async () => {
      let cats;
      if (categorySlug) {
        cats = await base44.entities.Category.filter({ slug: categorySlug });
      } else {
        cats = await base44.entities.Category.filter({ id: categoryId });
      }
      return cats[0] || null;
    },
    enabled: !!(categorySlug || categoryId),
  });

  // Mise à jour des meta tags pour le SEO
  useEffect(() => {
    if (category) {
      const categoryName = language === 'en' && category.name_en ? category.name_en : category.name;
      document.title = `${categoryName} - Outils IA | Finder AI`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      const desc = language === 'en' && category.description_en ? category.description_en : category.description;
      metaDesc.content = desc || `Découvrez les meilleurs outils IA de la catégorie ${categoryName}`;
    }
  }, [category, language]);

  const { data: allServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['categoryServices', category?.id],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter({ status: 'approved' }, '-created_date');
      return services.filter(s => s.categories && s.categories.includes(category.id));
    },
    enabled: !!category?.id,
  });

  const aiServices = allServices.sort((a, b) => {
    // Prioriser les IA avec image de couverture ou logo
    const aHasImage = a.cover_image_url || a.logo_url;
    const bHasImage = b.cover_image_url || b.logo_url;
    
    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;
    
    // Si même statut d'image, trier par date
    return new Date(b.created_date) - new Date(a.created_date);
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
        toast.success(t('toast_favorite_removed'));
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          ai_service_id: serviceId
        });
        toast.success(t('toast_favorite_added'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (categoryLoading || servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{t('category_not_found')}</h1>
          <p className="text-slate-600">{t('category_not_found_subtitle')}</p>
        </div>
      </div>
    );
  }

  const categoryName = language === 'en' && category.name_en ? category.name_en : category.name;
  const categoryDesc = language === 'en' && category.description_en ? category.description_en : category.description;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
            {(() => {
              const iconMap = {
                Sparkles, Zap, Image: ImageIcon, MessageSquare, Music, Video, 
                Brain, Code, FileText, Palette, Box, Search, Bot, Database, 
                Globe, Shield, Target, TrendingUp, Users, Mic, Camera, Mail, 
                Heart, PenTool, Star, Lightbulb, Rocket, Briefcase,
                GraduationCap, Gamepad2, Film, Headphones, BookOpen, ShoppingCart, Calendar
              };
              const IconComponent = iconMap[category.icon] || Box;
              return <IconComponent className="w-4 h-4" />;
            })()}
            <span>{t('categories_all')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            {categoryName}
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {categoryDesc}
          </p>
          
          <div className="mt-8 text-slate-400">
            {aiServices.length} {aiServices.length > 1 ? t('categories_tools_plural') : t('categories_tools')} {aiServices.length > 1 ? t('category_available_plural') : t('category_available')}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Bannière catégorie */}
        <div className="mb-8">
          <ActiveBanner position="category_top" />
        </div>

        {aiServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiServices.slice(0, 5).map((service) => (
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
                  {t('promo_your_service')}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {t('promo_increase_visibility')}
                </p>
                <Link to={createPageUrl('ProAccount')}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    {t('promo_become_pro')}
                  </Button>
                </Link>
              </div>
            </div>

            {aiServices.slice(5).map((service) => (
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
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t('category_no_tools')}
            </h2>
            <p className="text-slate-600">
              {t('category_no_tools_subtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}