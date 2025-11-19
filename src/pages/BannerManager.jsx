import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Image as ImageIcon, Plus, CheckCircle, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BannerCalendar from '@/components/banners/BannerCalendar';

export default function BannerManager() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ai_service_id: '', title: '', image_url: '', target_url: '', position: 'homepage_hero'
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reservingBanner, setReservingBanner] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: proAccount } = useQuery({
    queryKey: ['proAccount', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.ProAccount.filter({ user_email: user.email });
      return accounts[0] || null;
    },
    enabled: !!user,
  });

  const { data: myServices = [] } = useQuery({
    queryKey: ['myServices', user?.email],
    queryFn: () => base44.entities.AIService.filter({ submitted_by: user.email }),
    enabled: !!user,
  });

  const { data: myBanners = [] } = useQuery({
    queryKey: ['myBanners', proAccount?.id],
    queryFn: () => base44.entities.BannerReservation.filter({ pro_account_id: proAccount.id }),
    enabled: !!proAccount,
  });

  const createBannerMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.BannerReservation.create({
        ...data,
        pro_account_id: proAccount.id,
        reserved_dates: selectedDates,
        validated: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBanners'] });
      setShowForm(false);
      setFormData({ ai_service_id: '', title: '', image_url: '', target_url: '', position: 'homepage_hero' });
      setSelectedDates([]);
      toast.success('Bannière soumise pour validation');
    },
  });

  const reserveDatesMutation = useMutation({
    mutationFn: async ({ bannerId, dates }) => {
      const banner = myBanners.find(b => b.id === bannerId);
      const newDates = [...(banner.reserved_dates || []), ...dates];
      const creditsNeeded = dates.length * 5;
      
      if (proAccount.credits < creditsNeeded) {
        throw new Error('Crédits insuffisants');
      }

      await base44.entities.BannerReservation.update(bannerId, {
        reserved_dates: newDates,
        credits_used: (banner.credits_used || 0) + creditsNeeded
      });

      await base44.entities.ProAccount.update(proAccount.id, {
        credits: proAccount.credits - creditsNeeded
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBanners'] });
      queryClient.invalidateQueries({ queryKey: ['proAccount'] });
      queryClient.invalidateQueries({ queryKey: ['bannerReservations'] });
      setReservingBanner(null);
      toast.success('Dates réservées avec succès ! 🎉');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur upload');
    } finally {
      setUploadingImage(false);
    }
  };

  const positions = [
    { value: 'homepage_hero', label: 'Page d\'accueil - Hero' },
    { value: 'homepage_sidebar', label: 'Page d\'accueil - Sidebar' },
    { value: 'category_top', label: 'Catégories - En haut' },
    { value: 'service_detail', label: 'Détail service' }
  ];

  if (!user || !proAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Compte Pro requis</h2>
          <p className="text-slate-600 mb-4">Vous devez avoir un compte Pro pour gérer vos bannières</p>
          <Button onClick={() => window.location.href = '/ProAccount'}>
            Découvrir les plans Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestion des bannières</h1>
          <p className="text-slate-600">
            Crédits disponibles: <span className="font-bold text-purple-600">{proAccount.credits}</span>
          </p>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Créer une bannière</CardTitle>
              <CardDescription>Votre bannière sera soumise pour validation admin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createBannerMutation.mutate(formData); }} className="space-y-4">
                <Select value={formData.ai_service_id} onValueChange={(v) => setFormData({...formData, ai_service_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service IA" />
                  </SelectTrigger>
                  <SelectContent>
                    {myServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Titre de la bannière"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Image de la bannière</label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                  )}
                </div>

                <Input
                  placeholder="URL de destination"
                  value={formData.target_url}
                  onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                  required
                />

                <Select value={formData.position} onValueChange={(v) => setFormData({...formData, position: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createBannerMutation.isPending}>Créer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes bannières</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une bannière
          </Button>
        </div>

        <div className="grid gap-6">
          {myBanners.map((banner) => (
            <div key={banner.id}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">{banner.title}</h3>
                        {banner.validated ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validée
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente de validation
                          </Badge>
                        )}
                      </div>
                      {banner.image_url && (
                        <img src={banner.image_url} alt={banner.title} className="w-full h-48 object-cover rounded-lg mb-3" />
                      )}
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                        <p>📍 Position: {positions.find(p => p.value === banner.position)?.label}</p>
                        <p>💳 Crédits utilisés: {banner.credits_used || 0}</p>
                        <p>📅 Dates réservées: {(banner.reserved_dates || []).length}</p>
                        <p>🔗 URL: <a href={banner.target_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">{banner.target_url}</a></p>
                      </div>

                      {banner.validated && (
                        <Button
                          onClick={() => setReservingBanner(reservingBanner === banner.id ? null : banner.id)}
                          variant={reservingBanner === banner.id ? "outline" : "default"}
                          className={reservingBanner === banner.id ? "" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"}
                        >
                          {reservingBanner === banner.id ? (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Fermer le calendrier
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              Réserver des dates
                            </>
                          )}
                        </Button>
                      )}

                      {!banner.validated && (
                        <p className="text-sm text-orange-600 mt-2">
                          ⏳ Votre bannière est en cours de validation. Vous pourrez réserver des dates une fois validée.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendrier de réservation */}
              {reservingBanner === banner.id && banner.validated && (
                <div className="mt-4">
                  <BannerCalendar
                    bannerId={banner.id}
                    position={banner.position}
                    onReserve={(dates) => reserveDatesMutation.mutate({ bannerId: banner.id, dates })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}