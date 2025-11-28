import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, FileText, Mail, Image, 
  BarChart3, Users, Sparkles, Shield, Search,
  ChevronRight, Newspaper
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLogo from '@/components/admin/AdminLogo';
import AdminServices from '@/components/admin/AdminServices';
import AdminNewsletter from '@/components/admin/AdminNewsletter';
import AdminStats from '@/components/admin/AdminStats';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminReviews from '@/components/admin/AdminReviews';
import AdminBanners from '@/components/admin/AdminBanners';
import AdminEmailTemplates from '@/components/admin/AdminEmailTemplates';
import AdminStories from '@/components/admin/AdminStories';
import AdminAISearchScan from '@/components/admin/AdminAISearchScan';
import AdminOwnershipClaims from '@/components/admin/AdminOwnershipClaims';
import AdminLegalSections from '@/components/admin/AdminLegalSections';
import AdminNews from '@/components/admin/AdminNews';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Compter les bannières en attente de validation
  const { data: pendingBannersCount = 0 } = useQuery({
    queryKey: ['pendingBannersCount'],
    queryFn: async () => {
      const banners = await base44.entities.BannerReservation.list();
      return banners.filter(b => !b.validated && b.active).length;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!user) return null;

  const adminSections = [
    { id: 'ai-scan', label: 'AI Search Scan', icon: Search, description: 'Scanner automatique de services IA', color: 'from-purple-600 to-pink-600' },
    { id: 'services', label: 'Services IA', icon: Sparkles, description: 'Gérer les services IA', color: 'from-purple-600 to-indigo-600' },
    { id: 'ownership', label: 'Revendications IA', icon: Shield, description: 'Valider les revendications', color: 'from-amber-600 to-yellow-600' },
    { id: 'stats', label: 'Statistiques', icon: BarChart3, description: 'Vue d\'ensemble des métriques', color: 'from-blue-600 to-cyan-600' },
    { id: 'news', label: 'Actualités IA', icon: Newspaper, description: 'Gérer les actualités IA', color: 'from-rose-600 to-orange-600' },
    { id: 'categories', label: 'Catégories', icon: FileText, description: 'Gérer les catégories', color: 'from-orange-600 to-amber-600' },
    { id: 'stories', label: 'Stories', icon: Image, description: 'Gérer les stories', color: 'from-pink-600 to-rose-600' },
    { id: 'reviews', label: 'Avis', icon: Users, description: 'Modérer les avis', color: 'from-green-600 to-emerald-600' },
    { id: 'banners', label: 'Bannières', icon: Image, description: 'Gérer les publicités', color: 'from-violet-600 to-purple-600', badge: pendingBannersCount },
    { id: 'emails', label: 'Templates Email', icon: Mail, description: 'Gérer les emails', color: 'from-red-600 to-pink-600' },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Envoyer des newsletters', color: 'from-teal-600 to-cyan-600' },
    { id: 'logo', label: 'Logo', icon: Image, description: 'Personnaliser le logo', color: 'from-slate-600 to-gray-600' },
    { id: 'legal', label: 'Mentions Légales', icon: FileText, description: 'Gérer les mentions légales', color: 'from-slate-600 to-zinc-600' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'ai-scan': return <AdminAISearchScan />;
      case 'news': return <AdminNews />;
      case 'stats': return <AdminStats />;
      case 'services': return <AdminServices />;
      case 'stories': return <AdminStories />;
      case 'categories': return <AdminCategories />;
      case 'reviews': return <AdminReviews />;
      case 'banners': return <AdminBanners />;
      case 'emails': return <AdminEmailTemplates />;
      case 'newsletter': return <AdminNewsletter />;
      case 'logo': return <AdminLogo />;
      case 'ownership': return <AdminOwnershipClaims />;
      case 'legal': return <AdminLegalSections />;
      default: return <AdminAISearchScan />;
    }
  };

  return (
    <div className="min-h-screen bg-[#ffeeee] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">Administration</h1>
          </div>
          <p className="text-slate-600">Gérez Finder AI - Tableau de bord administrateur</p>
        </div>

        {activeSection ? (
          <div>
            <button
              onClick={() => setActiveSection(null)}
              className="mb-6 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              ← Retour au menu
            </button>
            {renderSection()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 hover:border-purple-300 relative"
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse z-10">
                      {section.badge}
                    </span>
                  )}
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {section.label}
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}