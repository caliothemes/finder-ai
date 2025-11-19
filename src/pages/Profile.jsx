import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Calendar, Heart, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['myReviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['mySubmissions', user?.email],
    queryFn: () => base44.entities.AIService.filter({ submitted_by: user.email }),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 rounded-3xl p-12 mb-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center text-4xl font-bold">
              {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {user.full_name || 'Utilisateur'}
              </h1>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {new Date(user.created_date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <Badge className="mt-3 bg-yellow-500 text-white">
                  Administrateur
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Heart className="w-5 h-5" />
                Favoris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {favorites.length}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Outils favoris
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <PlusCircle className="w-5 h-5" />
                Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {mySubmissions.length}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Outils proposés
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <User className="w-5 h-5" />
                Avis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {myReviews.length}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Avis publiés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Submissions */}
        {mySubmissions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mes outils IA proposés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mySubmissions.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {service.logo_url && (
                        <img
                          src={service.logo_url}
                          alt={service.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <Link
                          to={createPageUrl(`AIDetail?id=${service.id}`)}
                          className="font-semibold text-slate-900 hover:text-purple-600"
                        >
                          {service.name}
                        </Link>
                        <div className="text-sm text-slate-600">{service.tagline}</div>
                      </div>
                    </div>
                    
                    <Badge
                      className={
                        service.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : service.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {service.status === 'approved' ? 'Approuvé' : 
                       service.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Reviews */}
        {myReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mes derniers avis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myReviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? 'text-yellow-400' : 'text-slate-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">
                        {new Date(review.created_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-slate-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}