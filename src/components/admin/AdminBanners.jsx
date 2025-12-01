import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Calendar, Power, PowerOff, Trash2, Pencil, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [editingBanner, setEditingBanner] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const [uploading, setUploading] = React.useState(false);

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

  const toggleActiveMutation = useMutation({
    mutationFn: ({ bannerId, active }) => base44.entities.BannerReservation.update(bannerId, { active }),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success(active ? 'Bannière activée' : 'Bannière désactivée');
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ bannerId, data }) => base44.entities.BannerReservation.update(bannerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success('Bannière mise à jour');
      setEditingBanner(null);
    },
  });

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setEditForm({
      title: banner.title || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      target_url: banner.target_url || '',
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditForm(prev => ({ ...prev, image_url: file_url }));
      toast.success('Image uploadée');
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = () => {
    updateBannerMutation.mutate({
      bannerId: editingBanner.id,
      data: editForm,
    });
  };

  const deleteBannerMutation = useMutation({
    mutationFn: async (banner) => {
      // Rembourser les crédits au compte pro si des dates étaient réservées
      if (banner.pro_account_id && banner.credits_used > 0) {
        const proAccounts = await base44.entities.ProAccount.filter({ id: banner.pro_account_id });
        if (proAccounts.length > 0) {
          const proAccount = proAccounts[0];
          await base44.entities.ProAccount.update(proAccount.id, {
            credits: (proAccount.credits || 0) + banner.credits_used
          });
        }
      }
      // Supprimer la bannière
      await base44.entities.BannerReservation.delete(banner.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      toast.success('Bannière supprimée et crédits remboursés');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
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
                <div className="flex items-center gap-2">
                  <Badge className={banner.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}>
                    {banner.active ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-3 h-3 mr-1" />
                        Désactivée
                      </>
                    )}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditBanner(banner)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={banner.active ? "outline" : "default"}
                    onClick={() => toggleActiveMutation.mutate({ bannerId: banner.id, active: !banner.active })}
                    className={banner.active ? "text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
                  >
                    {banner.active ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-1" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-1" />
                        Activer
                      </>
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette bannière ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera la bannière et libérera les dates réservées.
                          {banner.credits_used > 0 && (
                            <span className="block mt-2 font-medium text-green-600">
                              ✓ {banner.credits_used} crédits seront remboursés au compte pro.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBannerMutation.mutate(banner)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Modal d'édition */}
      <Dialog open={!!editingBanner} onOpenChange={() => setEditingBanner(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la bannière</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titre</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Titre de la bannière"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description (optionnel)"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL de destination</label>
              <Input
                value={editForm.target_url}
                onChange={(e) => setEditForm({ ...editForm, target_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Image</label>
              {editForm.image_url && (
                <img src={editForm.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
              )}
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                <Upload className="w-4 h-4" />
                {uploading ? 'Upload en cours...' : 'Changer l\'image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingBanner(null)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={updateBannerMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}