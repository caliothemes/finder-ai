import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Calendar, Heart, PlusCircle, Edit, Clock, Camera, Loader2, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';
import EditAIServiceModal from '@/components/profile/EditAIServiceModal';
import ServiceStatsAccordion from '@/components/admin/ServiceStatsAccordion';
import { toast } from 'sonner';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const { t } = useLanguage();

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      setUser({ ...user, avatar_url: file_url });
      toast.success('Photo de profil mise à jour !');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleNameEdit = () => {
    setNewName(user.full_name || '');
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    
    setSavingName(true);
    try {
      await base44.auth.updateMe({ full_name: newName.trim() });
      setUser({ ...user, full_name: newName.trim() });
      setEditingName(false);
      toast.success('Nom mis à jour !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingName(false);
    }
  };

  const handleNameCancel = () => {
    setEditingName(false);
    setNewName('');
  };

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
            <div className="relative group">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-3xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center text-4xl font-bold">
                  {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-3 mb-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-2xl font-bold bg-white/10 border-white/30 text-white placeholder:text-white/50 max-w-md"
                    placeholder="Votre nom"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleNameSave}
                    disabled={savingName}
                    className="text-white hover:bg-white/20"
                  >
                    {savingName ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleNameCancel}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2 group">
                  <h1 className="text-4xl font-bold">
                    {user.full_name || t('profile_user')}
                  </h1>
                  <button
                    onClick={handleNameEdit}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all"
                    title="Modifier le nom"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t('profile_member_since')} {new Date(user.created_date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <Badge className="mt-3 bg-yellow-500 text-white">
                  {t('profile_admin')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to={createPageUrl('Favorites')}>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Heart className="w-5 h-5" />
                  {t('profile_favorites')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">
                  {favorites.length}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {t('profile_favorite_tools')}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <PlusCircle className="w-5 h-5" />
                {t('profile_contributions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {mySubmissions.length}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {t('profile_tools_submitted')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <User className="w-5 h-5" />
                {t('profile_reviews')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {myReviews.length}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {t('profile_reviews_published')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Submissions */}
        {mySubmissions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('profile_my_tools')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mySubmissions.map((service) => (
                  <div key={service.id} className="mb-4">
                    <div
                      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                        service.pending_revision 
                          ? 'bg-amber-50 border border-amber-200' 
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
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
                          {service.pending_revision && (
                            <div className="flex items-center gap-1 text-xs text-amber-700 mt-1">
                              <Clock className="w-3 h-3" />
                              Révision en attente de validation
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {service.status === 'approved' && !service.pending_revision && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingService(service)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Modifier
                          </Button>
                        )}
                        <Badge
                          className={
                            service.pending_revision
                              ? 'bg-amber-100 text-amber-800'
                              : service.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : service.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {service.pending_revision
                            ? 'Révision en attente'
                            : service.status === 'approved' ? t('profile_status_approved') : 
                            service.status === 'pending' ? t('profile_status_pending') : t('profile_status_rejected')}
                        </Badge>
                      </div>
                    </div>
                    {/* Stats Accordion pour les services approuvés */}
                    {service.status === 'approved' && (
                      <ServiceStatsAccordion service={service} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Modal */}
        {editingService && (
          <EditAIServiceModal
            service={editingService}
            onClose={() => setEditingService(null)}
          />
        )}

        {/* My Reviews */}
        {myReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_my_reviews')}</CardTitle>
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