import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Image as ImageIcon, Plus, CheckCircle, Clock, X, Tag } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BannerCalendar from '@/components/banners/BannerCalendar';
import BannerPositionSelector from '@/components/banners/BannerPositionSelector';
import { getPositionByValue } from '@/components/banners/bannerPositions';
import { useLanguage } from '@/components/LanguageProvider';

export default function BannerManager() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ai_service_id: '', title: '', description: '', image_url: '', target_url: '', position: 'homepage_hero', badges: []
  });
  const [badgeInput, setBadgeInput] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reservingBanner, setReservingBanner] = useState(null);
  const queryClient = useQueryClient();
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

  const { data: proAccount } = useQuery({
    queryKey: ['proAccount', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.ProAccount.filter({ user_email: user.email });
      return accounts[0] || null;
    },
    enabled: !!user,
  });

  // Récupérer TOUS les services approuvés (l'utilisateur peut promouvoir n'importe quel service)
  const { data: myServices = [] } = useQuery({
    queryKey: ['allApprovedServices'],
    queryFn: async () => {
      const services = await base44.entities.AIService.filter({ status: 'approved' }, 'name', 1000);
      return services.sort((a, b) => a.name.localeCompare(b.name));
    },
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
      setFormData({ ai_service_id: '', title: '', description: '', image_url: '', target_url: '', position: 'homepage_hero', badges: [] });
      setSelectedDates([]);
      toast.success('Bannière soumise pour validation');
    },
  });

  const reserveDatesMutation = useMutation({
    mutationFn: async ({ bannerId, dates }) => {
      console.log('START', { bannerId, dates });
      const banner = myBanners.find(b => b.id === bannerId);
      const config = getPositionByValue(banner.position);
      const creditsNeeded = dates.length * config.creditsPerDay;
      
      if (proAccount.credits < creditsNeeded) throw new Error('Pas assez de crédits');

      const allDates = [...(banner.reserved_dates || []), ...dates];

      console.log('UPDATE banner', allDates);
      await base44.entities.BannerReservation.update(bannerId, {
        reserved_dates: allDates,
        credits_used: (banner.credits_used || 0) + creditsNeeded
      });

      console.log('UPDATE pro');
      await base44.entities.ProAccount.update(proAccount.id, {
        credits: proAccount.credits - creditsNeeded
      });

      console.log('DONE');
      return dates.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries();
      setReservingBanner(null);
      toast.success(`${count} dates réservées !`);
    },
    onError: (e) => {
      console.error('ERR', e);
      toast.error(e.message);
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
    { value: 'homepage_hero', label: t('banner_position_hero') },
    { value: 'homepage_sidebar', label: t('banner_position_sidebar') },
    { value: 'category_top', label: t('banner_position_category') },
    { value: 'service_detail', label: t('banner_position_detail') }
  ];

  if (!user || !proAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('banner_pro_required')}</h2>
          <p className="text-slate-600 mb-4">{t('banner_pro_required_desc')}</p>
          <Button onClick={() => window.location.href = '/ProAccount'}>
            {t('banner_discover_pro')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('banner_manager_title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('banner_credits')}: <span className="font-bold text-purple-600">{proAccount.credits}</span>
          </p>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('banner_create')}</CardTitle>
              <CardDescription>{t('banner_create_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createBannerMutation.mutate(formData); }} className="space-y-4">
                <Select value={formData.ai_service_id} onValueChange={(v) => setFormData({...formData, ai_service_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('banner_ai_service')} />
                  </SelectTrigger>
                  <SelectContent>
                    {myServices.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder={t('banner_title_label')}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />

                {/* Champ description pour les formats card (sidebar) et article (hero/explore_top) */}
                {(formData.position === 'homepage_sidebar' || formData.position === 'explore_sidebar' || formData.position === 'homepage_hero' || formData.position === 'explore_top') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {(formData.position === 'homepage_hero' || formData.position === 'explore_top') 
                        ? "Description de l'article (affiché à côté de l'image)" 
                        : "Description (affiché sous l'image)"}
                    </label>
                    <Textarea
                      placeholder={
                        (formData.position === 'homepage_hero' || formData.position === 'explore_top')
                          ? "Rédigez un texte accrocheur pour présenter votre service IA..."
                          : "Décrivez votre service en quelques lignes..."
                      }
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                )}

                {/* Badges pour les formats sidebar uniquement */}
                {(formData.position === 'homepage_sidebar' || formData.position === 'explore_sidebar') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Badges (max 2)
                    </label>
                    <p className="text-xs text-slate-500 mb-2">Ajoutez jusqu'à 2 badges courts pour mettre en avant des points forts (ex: "IA Française", "Gratuit", "Nouveau")</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.badges || []).map((badge, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-700 flex items-center gap-1">
                          {badge}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData, 
                              badges: formData.badges.filter((_, i) => i !== idx)
                            })}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {(formData.badges || []).length < 2 && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: IA Française"
                          value={badgeInput}
                          onChange={(e) => setBadgeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && badgeInput.trim()) {
                              e.preventDefault();
                              setFormData({
                                ...formData,
                                badges: [...(formData.badges || []), badgeInput.trim()]
                              });
                              setBadgeInput('');
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (badgeInput.trim()) {
                              setFormData({
                                ...formData,
                                badges: [...(formData.badges || []), badgeInput.trim()]
                              });
                              setBadgeInput('');
                            }
                          }}
                        >
                          Ajouter
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('banner_image_label')}</label>
                  {(() => {
                    const posConfig = getPositionByValue(formData.position);
                    return (
                      <p className="text-xs text-slate-500 mb-2">
                        📐 Taille recommandée : <span className="font-semibold text-purple-600">{posConfig?.recommendedSize || '1200 x 200 px'}</span>
                      </p>
                    );
                  })()}
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  {formData.image_url && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2">Aperçu :</p>
                      {(formData.position === 'homepage_sidebar' || formData.position === 'explore_sidebar') ? (
                        <div className="w-full max-w-sm rounded-lg overflow-hidden border">
                          <img src={formData.image_url} alt="Preview" className="w-full aspect-[4/3] object-cover" />
                        </div>
                      ) : (formData.position === 'homepage_hero' || formData.position === 'explore_top') ? (
                        <div className="w-full max-w-md rounded-lg overflow-hidden border">
                          <img src={formData.image_url} alt="Preview" className="w-full aspect-[3/2] object-cover" />
                        </div>
                      ) : (
                        <div className="w-full rounded-lg overflow-hidden border">
                          <img src={formData.image_url} alt="Preview" className="w-full aspect-[6/1] object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Input
                  placeholder={t('banner_url_label')}
                  value={formData.target_url}
                  onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                  required
                />

                <BannerPositionSelector 
                  value={formData.position} 
                  onChange={(v) => setFormData({...formData, position: v})} 
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={createBannerMutation.isPending}>{t('banner_create_btn')}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('banner_cancel')}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('banner_my_banners')}</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('banner_create')}
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
                            {t('banner_validated')}
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('banner_pending')}
                          </Badge>
                        )}
                      </div>
                      {banner.image_url && (
                        <img src={banner.image_url} alt={banner.title} className="w-full h-48 object-cover rounded-lg mb-3" />
                      )}
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                        <p>📍 {t('banner_position')}: {positions.find(p => p.value === banner.position)?.label}</p>
                        <p>💳 {t('banner_credits_used')}: {banner.credits_used || 0}</p>
                        <p>📅 {t('banner_dates_reserved')}: {(banner.reserved_dates || []).length}</p>
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
                              {t('banner_close_calendar')}
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              {t('banner_reserve_dates')}
                            </>
                          )}
                        </Button>
                      )}

                      {!banner.validated && (
                        <p className="text-sm text-orange-600 mt-2">
                          ⏳ {t('banner_validation_pending')}
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