import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBanners() {
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: () => base44.entities.BannerReservation.list('-created_date'),
  });

  const validateBannerMutation = useMutation({
    mutationFn: (bannerId) => base44.entities.BannerReservation.update(bannerId, { validated: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success('Bannière validée');
    },
  });

  const rejectBannerMutation = useMutation({
    mutationFn: (bannerId) => base44.entities.BannerReservation.update(bannerId, { validated: false, active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success('Bannière rejetée');
    },
  });

  const pendingBanners = banners.filter(b => !b.validated && b.active);
  const validatedBanners = banners.filter(b => b.validated);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingBanners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Validées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{validatedBanners.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Banners */}
      {pendingBanners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bannières en attente de validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBanners.map((banner) => (
                <div key={banner.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{banner.title}</h3>
                      <p className="text-sm text-slate-600">Position: {banner.position}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      En attente
                    </Badge>
                  </div>
                  
                  {banner.image_url && (
                    <img src={banner.image_url} alt={banner.title} className="w-full h-48 object-cover rounded-lg" />
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => validateBannerMutation.mutate(banner.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectBannerMutation.mutate(banner.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validated Banners */}
      <Card>
        <CardHeader>
          <CardTitle>Bannières validées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validatedBanners.map((banner) => (
              <div key={banner.id} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{banner.title}</h3>
                  <p className="text-sm text-slate-600">
                    {banner.position} • {(banner.reserved_dates || []).length} dates réservées
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Validée
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}