import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Sparkles, Heart, Eye, Star, MessageSquare, FileText, Crown, Image, Activity, Calendar, Clock, UserCheck } from 'lucide-react';

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

  const { data: pageViews = [] } = useQuery({
    queryKey: ['allPageViews'],
    queryFn: () => base44.entities.PageView.list('-created_date', 10000),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  // Calculs des visiteurs par période
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const lastWeekStart = new Date(todayStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);
  const lastMonthStart = new Date(todayStart);
  lastMonthStart.setDate(lastMonthStart.getDate() - 60);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

  // Visiteurs uniques par période
  const getUniqueVisitors = (views, since) => {
    const filtered = views.filter(v => new Date(v.created_date) >= since);
    return new Set(filtered.map(v => v.visitor_id)).size;
  };

  const visitorsToday = getUniqueVisitors(pageViews, todayStart);
  const visitorsYesterday = pageViews.filter(v => {
    const date = new Date(v.created_date);
    return date >= yesterdayStart && date < todayStart;
  });
  const uniqueVisitorsYesterday = new Set(visitorsYesterday.map(v => v.visitor_id)).size;
  const visitorsWeek = getUniqueVisitors(pageViews, weekStart);
  const visitorsLastWeek = pageViews.filter(v => {
    const date = new Date(v.created_date);
    return date >= lastWeekStart && date < weekStart;
  });
  const uniqueVisitorsLastWeek = new Set(visitorsLastWeek.map(v => v.visitor_id)).size;
  const visitorsMonth = getUniqueVisitors(pageViews, monthStart);
  const visitorsLastMonth = pageViews.filter(v => {
    const date = new Date(v.created_date);
    return date >= lastMonthStart && date < monthStart;
  });
  const uniqueVisitorsLastMonth = new Set(visitorsLastMonth.map(v => v.visitor_id)).size;
  const visitorsYear = getUniqueVisitors(pageViews, yearStart);
  const visitorsNow = getUniqueVisitors(pageViews, last5Minutes);

  // Pages vues par période
  const viewsToday = pageViews.filter(v => new Date(v.created_date) >= todayStart).length;
  const viewsYesterday = visitorsYesterday.length;
  const viewsWeek = pageViews.filter(v => new Date(v.created_date) >= weekStart).length;
  const viewsLastWeek = visitorsLastWeek.length;
  const viewsMonth = pageViews.filter(v => new Date(v.created_date) >= monthStart).length;
  const viewsLastMonth = visitorsLastMonth.length;
  const viewsYear = pageViews.filter(v => new Date(v.created_date) >= yearStart).length;

  // Top pages visitées aujourd'hui
  const todayViews = pageViews.filter(v => new Date(v.created_date) >= todayStart);
  const pageCountMap = {};
  todayViews.forEach(v => {
    pageCountMap[v.page] = (pageCountMap[v.page] || 0) + 1;
  });
  const topPages = Object.entries(pageCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Répartition des appareils
  const deviceStats = {
    desktop: pageViews.filter(v => v.device === 'desktop').length,
    mobile: pageViews.filter(v => v.device === 'mobile').length,
    tablet: pageViews.filter(v => v.device === 'tablet').length,
  };
  const totalDevices = deviceStats.desktop + deviceStats.mobile + deviceStats.tablet || 1;

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
      {/* Visiteurs en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              En ce moment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-3xl font-bold text-green-600">{visitorsNow}</span>
              <span className="text-sm text-slate-500">visiteurs actifs</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Dernières 5 minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Hier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-600">{uniqueVisitorsYesterday}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsYesterday} pages vues</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">{visitorsToday}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsToday} pages vues</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Semaine dernière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-600">{uniqueVisitorsLastWeek}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsLastWeek} pages vues</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-purple-600">{visitorsWeek}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsWeek} pages vues</p>
          </CardContent>
        </Card>
      </div>

      {/* Mois et Année */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-stone-50 to-neutral-100 border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              Mois dernier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-stone-600">{uniqueVisitorsLastMonth}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsLastMonth} pages vues</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-600">{visitorsMonth}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsMonth} pages vues</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Cette année
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-cyan-600">{visitorsYear}</span>
              <span className="text-sm text-slate-500">visiteurs uniques</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{viewsYear} pages vues</p>
          </CardContent>
        </Card>
      </div>

      {/* Pages populaires et Appareils */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pages populaires aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-3">
                {topPages.map(([page, count], idx) => (
                  <div key={page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-sm font-medium text-slate-700">{page}</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">{count} vues</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucune donnée aujourd'hui</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition des appareils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>🖥️ Desktop</span>
                  <span className="font-semibold">{Math.round((deviceStats.desktop / totalDevices) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(deviceStats.desktop / totalDevices) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>📱 Mobile</span>
                  <span className="font-semibold">{Math.round((deviceStats.mobile / totalDevices) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(deviceStats.mobile / totalDevices) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>📟 Tablet</span>
                  <span className="font-semibold">{Math.round((deviceStats.tablet / totalDevices) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(deviceStats.tablet / totalDevices) * 100}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilisateurs inscrits */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-500" />
            Utilisateurs inscrits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-3xl font-bold text-cyan-600">{users.length}</span>
              <p className="text-xs text-slate-500">Total</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-600">
                {users.filter(u => new Date(u.created_date) >= todayStart).length}
              </span>
              <p className="text-xs text-slate-500">Aujourd'hui</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-600">
                {users.filter(u => new Date(u.created_date) >= weekStart).length}
              </span>
              <p className="text-xs text-slate-500">Cette semaine</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-600">
                {users.filter(u => new Date(u.created_date) >= monthStart).length}
              </span>
              <p className="text-xs text-slate-500">Ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Services IA (Total)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <div>
                <span className="text-3xl font-bold">{services.length}</span>
                <p className="text-xs text-slate-500">{approvedServices} approuvés • {pendingServices} en attente</p>
              </div>
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
            <CardTitle className="text-sm font-medium text-slate-600">Avis publiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-cyan-500" />
              <span className="text-3xl font-bold">{reviews.length}</span>
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
            <CardTitle className="text-sm font-medium text-slate-600">Total Favoris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              <span className="text-3xl font-bold">{favorites.length}</span>
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
              <span className="text-3xl font-bold">{avgRating}/5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Comptes Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-500" />
              <div>
                <span className="text-3xl font-bold">{proAccounts.length}</span>
                <p className="text-xs text-slate-500">{activeProAccounts} payants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Bannières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Image className="w-8 h-8 text-orange-500" />
              <div>
                <span className="text-3xl font-bold">{banners.length}</span>
                <p className="text-xs text-slate-500">{validatedBanners} validées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-fuchsia-500" />
              <div>
                <span className="text-3xl font-bold">{stories.length}</span>
                <p className="text-xs text-slate-500">{activeStories} actives</p>
              </div>
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