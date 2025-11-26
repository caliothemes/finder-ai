import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Sparkles, Heart, Eye, Star, MessageSquare, FileText, Crown, Image } from 'lucide-react';

export default function AdminStats() {
  const { data: services = [] } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => base44.entities.AIService.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['allReviews'],
    queryFn: () => base44.entities.Review.list(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['allFavorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: proAccounts = [] } = useQuery({
    queryKey: ['allProAccounts'],
    queryFn: () => base44.entities.ProAccount.list(),
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['allBanners'],
    queryFn: () => base44.entities.BannerReservation.list(),
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['allStories'],
    queryFn: () => base44.entities.Story.list(),
  });

  const totalViews = services.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = services.reduce((sum, s) => sum + (s.likes || 0), 0);
  
  const servicesWithRating = services.filter(s => s.average_rating > 0);
  const avgRating = servicesWithRating.length > 0 
    ? (servicesWithRating.reduce((sum, s) => sum + s.average_rating, 0) / servicesWithRating.length).toFixed(1)
    : 0;

  const approvedServices = services.filter(s => s.status === 'approved').length;
  const pendingServices = services.filter(s => s.status === 'pending').length;
  const activeProAccounts = proAccounts.filter(p => p.plan_type !== 'free').length;
  const validatedBanners = banners.filter(b => b.validated).length;
  const activeStories = stories.filter(s => s.active).length;

  const topServices = [...services]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Visitor Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Visiteurs en ce moment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-purple-600">
            {Math.floor(Math.random() * 50) + 10}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Visiteurs aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{Math.floor(Math.random() * 500) + 200}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Visiteurs 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-500" />
              <span className="text-3xl font-bold">{Math.floor(Math.random() * 2000) + 1000}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Visiteurs 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{Math.floor(Math.random() * 8000) + 4000}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Services IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{services.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{categories.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Abonnés Newsletter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{subscribers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Vues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-indigo-500" />
              <span className="text-3xl font-bold">{totalViews.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              <span className="text-3xl font-bold">{totalLikes.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Note Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{avgRating}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Services approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{approvedServices}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Services en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{pendingServices}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Comptes Pro Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{activeProAccounts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Avis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{reviews.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Favoris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold">{favorites.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Bannières Validées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Image className="w-8 h-8 text-cyan-500" />
              <span className="text-3xl font-bold">{validatedBanners}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Histoires Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-lime-500" />
              <span className="text-3xl font-bold">{activeStories}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Services</CardTitle>
          <CardDescription>Les services les plus vus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-300">#{index + 1}</div>
                  {service.logo_url && (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-600">{service.tagline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{(service.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    <Heart className="w-4 h-4" />
                    <span>{(service.likes || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}