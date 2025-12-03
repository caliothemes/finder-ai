import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Sparkles, Heart, Eye, Star, MessageSquare, FileText, Crown, Image, Activity, Calendar, Clock, UserCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminStats() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))' : 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)', borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#86efac' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <Activity className="w-4 h-4 text-green-500" />
              En ce moment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-3xl font-bold text-green-600">{visitorsNow}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs actifs</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>Dernières 5 minutes</p>
          </CardContent>
        </Card>

        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.1))' : 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)', borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : '#cbd5e1' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <Clock className="w-4 h-4" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }} />
              Hier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#475569' }}>{uniqueVisitorsYesterday}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsYesterday} pages vues</p>
          </CardContent>
        </Card>

        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))' : 'linear-gradient(to bottom right, #eff6ff, #eef2ff)', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#93c5fd' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <Clock className="w-4 h-4 text-blue-500" />
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">{visitorsToday}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsToday} pages vues</p>
          </CardContent>
        </Card>

        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(107, 114, 128, 0.15), rgba(100, 116, 139, 0.1))' : 'linear-gradient(to bottom right, #f9fafb, #f8fafc)', borderColor: isDark ? 'rgba(107, 114, 128, 0.3)' : '#d1d5db' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <Calendar className="w-4 h-4" style={{ color: isDark ? 'var(--text-muted)' : '#6b7280' }} />
              Semaine dernière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#4b5563' }}>{uniqueVisitorsLastWeek}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsLastWeek} pages vues</p>
          </CardContent>
        </Card>

        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.1))' : 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)', borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : '#c4b5fd' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <Calendar className="w-4 h-4 text-purple-500" />
              Cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-purple-600">{visitorsWeek}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsWeek} pages vues</p>
          </CardContent>
        </Card>
      </div>

      {/* Mois et Année */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(120, 113, 108, 0.15), rgba(115, 115, 115, 0.1))' : 'linear-gradient(to bottom right, #fafaf9, #f5f5f4)', borderColor: isDark ? 'rgba(120, 113, 108, 0.3)' : '#d6d3d1' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <Calendar className="w-4 h-4" style={{ color: isDark ? 'var(--text-muted)' : '#78716c' }} />
              Mois dernier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#57534e' }}>{uniqueVisitorsLastMonth}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsLastMonth} pages vues</p>
          </CardContent>
        </Card>

        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(249, 115, 22, 0.15), rgba(245, 158, 11, 0.1))' : 'linear-gradient(to bottom right, #fff7ed, #fffbeb)', borderColor: isDark ? 'rgba(249, 115, 22, 0.3)' : '#fdba74' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-600">{visitorsMonth}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsMonth} pages vues</p>
          </CardContent>
        </Card>

        <Card style={{ background: isDark ? 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.15), rgba(20, 184, 166, 0.1))' : 'linear-gradient(to bottom right, #ecfeff, #f0fdfa)', borderColor: isDark ? 'rgba(6, 182, 212, 0.3)' : '#67e8f9' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Cette année
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-cyan-600">{visitorsYear}</span>
              <span className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>visiteurs uniques</span>
            </div>
            <p className="text-xs mt-2" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>{viewsYear} pages vues</p>
          </CardContent>
        </Card>
      </div>

      {/* Pages populaires et Appareils */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: isDark ? 'var(--bg-card)' : undefined, borderColor: isDark ? 'var(--border-color)' : undefined }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: isDark ? 'var(--text-primary)' : undefined }}>Pages populaires aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-3">
                {topPages.map(([page, count], idx) => (
                  <div key={page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: isDark ? 'var(--text-muted)' : '#94a3b8' }}>#{idx + 1}</span>
                      <span className="text-sm font-medium" style={{ color: isDark ? 'var(--text-primary)' : '#334155' }}>{page}</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">{count} vues</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>Aucune donnée aujourd'hui</p>
            )}
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: isDark ? 'var(--bg-card)' : undefined, borderColor: isDark ? 'var(--border-color)' : undefined }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: isDark ? 'var(--text-primary)' : undefined }}>Répartition des appareils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1" style={{ color: isDark ? 'var(--text-primary)' : undefined }}>
                  <span>🖥️ Desktop</span>
                  <span className="font-semibold">{Math.round((deviceStats.desktop / totalDevices) * 100)}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(deviceStats.desktop / totalDevices) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1" style={{ color: isDark ? 'var(--text-primary)' : undefined }}>
                  <span>📱 Mobile</span>
                  <span className="font-semibold">{Math.round((deviceStats.mobile / totalDevices) * 100)}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(deviceStats.mobile / totalDevices) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1" style={{ color: isDark ? 'var(--text-primary)' : undefined }}>
                  <span>📟 Tablet</span>
                  <span className="font-semibold">{Math.round((deviceStats.tablet / totalDevices) * 100)}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(deviceStats.tablet / totalDevices) * 100}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilisateurs inscrits */}
      <Card 
        className="shadow-lg"
        style={{ 
          background: isDark ? 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.1), var(--bg-card), rgba(59, 130, 246, 0.1))' : 'linear-gradient(to bottom right, #ecfeff, #ffffff, #eff6ff)',
          borderColor: isDark ? 'rgba(6, 182, 212, 0.3)' : '#a5f3fc'
        }}
      >
        <CardHeader className="pb-4" style={{ borderBottom: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.2)' : '#a5f3fc'}` }}>
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: isDark ? 'var(--text-primary)' : '#1e293b' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            Utilisateurs inscrits
            <span className="ml-auto text-3xl font-bold text-cyan-600">{users.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}` }}>
              <span className="text-2xl font-bold text-blue-600">
                {users.filter(u => new Date(u.created_date) >= todayStart).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Aujourd'hui</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(100, 116, 139, 0.15)' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(100, 116, 139, 0.3)' : '#e2e8f0'}` }}>
              <span className="text-2xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#475569' }}>
                {users.filter(u => {
                  const date = new Date(u.created_date);
                  return date >= yesterdayStart && date < todayStart;
                }).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Hier</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : '#faf5ff', border: `1px solid ${isDark ? 'rgba(147, 51, 234, 0.3)' : '#e9d5ff'}` }}>
              <span className="text-2xl font-bold text-purple-600">
                {users.filter(u => new Date(u.created_date) >= weekStart).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Cette semaine</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(107, 114, 128, 0.15)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(107, 114, 128, 0.3)' : '#e5e7eb'}` }}>
              <span className="text-2xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#4b5563' }}>
                {users.filter(u => {
                  const date = new Date(u.created_date);
                  return date >= lastWeekStart && date < weekStart;
                }).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Sem. dernière</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed', border: `1px solid ${isDark ? 'rgba(249, 115, 22, 0.3)' : '#fed7aa'}` }}>
              <span className="text-2xl font-bold text-orange-600">
                {users.filter(u => new Date(u.created_date) >= monthStart).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Ce mois</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(120, 113, 108, 0.15)' : '#fafaf9', border: `1px solid ${isDark ? 'rgba(120, 113, 108, 0.3)' : '#e7e5e4'}` }}>
              <span className="text-2xl font-bold" style={{ color: isDark ? 'var(--text-primary)' : '#57534e' }}>
                {users.filter(u => {
                  const date = new Date(u.created_date);
                  return date >= lastMonthStart && date < monthStart;
                }).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Mois dernier</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : '#fdf2f8', border: `1px solid ${isDark ? 'rgba(236, 72, 153, 0.3)' : '#fbcfe8'}` }}>
              <span className="text-2xl font-bold text-pink-600">
                {users.filter(u => {
                  const threeMonthsAgo = new Date(todayStart);
                  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                  return new Date(u.created_date) >= threeMonthsAgo;
                }).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>3 derniers mois</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : '#ecfeff', border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.3)' : '#a5f3fc'}` }}>
              <span className="text-2xl font-bold text-cyan-600">
                {users.filter(u => new Date(u.created_date) >= yearStart).length}
              </span>
              <p className="text-xs mt-1 font-medium" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>Cette année</p>
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
      <Card style={{ backgroundColor: isDark ? 'var(--bg-card)' : undefined, borderColor: isDark ? 'var(--border-color)' : undefined }}>
        <CardHeader>
          <CardTitle style={{ color: isDark ? 'var(--text-primary)' : undefined }}>Top 5 Services</CardTitle>
          <CardDescription style={{ color: isDark ? 'var(--text-muted)' : undefined }}>Les services les plus vus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : undefined,
                  border: `1px solid ${isDark ? 'var(--border-color)' : '#e2e8f0'}` 
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold" style={{ color: isDark ? 'var(--text-muted)' : '#cbd5e1' }}>#{index + 1}</div>
                  {service.logo_url && (
                    <img
                      src={service.logo_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold" style={{ color: isDark ? 'var(--text-primary)' : '#0f172a' }}>{service.name}</h3>
                    <p className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#475569' }}>{service.tagline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{(service.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
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