import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Sparkles, Heart, Eye, Star } from 'lucide-react';

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

  const totalViews = services.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = services.reduce((sum, s) => sum + (s.likes || 0), 0);
  const avgRating = services.length > 0 
    ? (services.reduce((sum, s) => sum + (s.average_rating || 0), 0) / services.length).toFixed(1)
    : 0;

  const topServices = [...services]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
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