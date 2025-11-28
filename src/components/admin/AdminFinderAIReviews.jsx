import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Plus, Pencil, Trash2, Check, X, ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminFinderAIReviews() {
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    ai_service_id: '',
    rating: 4,
    title: '',
    title_en: '',
    content: '',
    content_en: '',
    pros: [],
    pros_en: [],
    cons: [],
    cons_en: [],
    verdict: '',
    verdict_en: '',
    reviewer_name: 'Équipe Finder AI',
    active: true
  });
  const [newPro, setNewPro] = useState('');
  const [newProEn, setNewProEn] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newConEn, setNewConEn] = useState('');

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['finderAIReviews'],
    queryFn: () => base44.entities.FinderAIReview.list('-created_date'),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['finderAIReviewRequests'],
    queryFn: () => base44.entities.FinderAIReviewRequest.list('-created_date'),
  });

  const { data: aiServices = [] } = useQuery({
    queryKey: ['aiServicesForReview'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FinderAIReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finderAIReviews'] });
      toast.success('Avis Finder AI créé !');
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FinderAIReview.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finderAIReviews'] });
      toast.success('Avis mis à jour !');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FinderAIReview.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finderAIReviews'] });
      toast.success('Avis supprimé');
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FinderAIReviewRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finderAIReviewRequests'] });
      toast.success('Demande mise à jour');
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingReview(null);
    setFormData({
      ai_service_id: '',
      rating: 4,
      title: '',
      title_en: '',
      content: '',
      content_en: '',
      pros: [],
      pros_en: [],
      cons: [],
      cons_en: [],
      verdict: '',
      verdict_en: '',
      reviewer_name: 'Équipe Finder AI',
      active: true
    });
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      ai_service_id: review.ai_service_id,
      rating: review.rating,
      title: review.title || '',
      title_en: review.title_en || '',
      content: review.content || '',
      content_en: review.content_en || '',
      pros: review.pros || [],
      pros_en: review.pros_en || [],
      cons: review.cons || [],
      cons_en: review.cons_en || [],
      verdict: review.verdict || '',
      verdict_en: review.verdict_en || '',
      reviewer_name: review.reviewer_name || 'Équipe Finder AI',
      active: review.active !== false
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.ai_service_id || !formData.content) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    if (editingReview) {
      updateMutation.mutate({ id: editingReview.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addPro = () => {
    if (newPro.trim()) {
      setFormData({ ...formData, pros: [...formData.pros, newPro.trim()] });
      setNewPro('');
    }
  };

  const addProEn = () => {
    if (newProEn.trim()) {
      setFormData({ ...formData, pros_en: [...formData.pros_en, newProEn.trim()] });
      setNewProEn('');
    }
  };

  const addCon = () => {
    if (newCon.trim()) {
      setFormData({ ...formData, cons: [...formData.cons, newCon.trim()] });
      setNewCon('');
    }
  };

  const addConEn = () => {
    if (newConEn.trim()) {
      setFormData({ ...formData, cons_en: [...formData.cons_en, newConEn.trim()] });
      setNewConEn('');
    }
  };

  const getServiceName = (id) => {
    const service = aiServices.find(s => s.id === id);
    return service?.name || 'Service inconnu';
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Avis Finder AI</h2>
          <p className="text-slate-600">Gérez les avis officiels de Finder AI sur les services</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel avis
        </Button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <MessageSquare className="w-5 h-5" />
              Demandes d'avis en attente ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                  <div>
                    <div className="font-medium">{getServiceName(request.ai_service_id)}</div>
                    <div className="text-sm text-slate-500">Demandé par {request.user_email}</div>
                    {request.message && (
                      <div className="text-sm text-slate-600 mt-1">"{request.message}"</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData({ ...formData, ai_service_id: request.ai_service_id });
                        updateRequestMutation.mutate({ id: request.id, data: { status: 'in_progress' } });
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Rédiger
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => updateRequestMutation.mutate({ id: request.id, data: { status: 'rejected' } })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>{editingReview ? 'Modifier l\'avis' : 'Nouvel avis Finder AI'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Selection */}
            <div>
              <Label>Service IA *</Label>
              <Select
                value={formData.ai_service_id}
                onValueChange={(value) => setFormData({ ...formData, ai_service_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
                <SelectContent>
                  {aiServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div>
              <Label>Note</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= formData.rating
                          ? 'fill-purple-500 text-purple-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title FR/EN */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titre (FR)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notre avis sur..."
                />
              </div>
              <div>
                <Label>Title (EN)</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Our review of..."
                />
              </div>
            </div>

            {/* Content FR/EN */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Contenu (FR) *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Notre expérience avec ce service..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Content (EN)</Label>
                <Textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  placeholder="Our experience with this service..."
                  rows={5}
                />
              </div>
            </div>

            {/* Pros FR/EN */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Points positifs (FR)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newPro}
                    onChange={(e) => setNewPro(e.target.value)}
                    placeholder="Ajouter un point positif"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                  />
                  <Button type="button" onClick={addPro} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.pros.map((pro, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {pro}
                      <button onClick={() => setFormData({ ...formData, pros: formData.pros.filter((_, idx) => idx !== i) })} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Pros (EN)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newProEn}
                    onChange={(e) => setNewProEn(e.target.value)}
                    placeholder="Add a pro"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProEn())}
                  />
                  <Button type="button" onClick={addProEn} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.pros_en.map((pro, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {pro}
                      <button onClick={() => setFormData({ ...formData, pros_en: formData.pros_en.filter((_, idx) => idx !== i) })} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Cons FR/EN */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Points négatifs (FR)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCon}
                    onChange={(e) => setNewCon(e.target.value)}
                    placeholder="Ajouter un point négatif"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                  />
                  <Button type="button" onClick={addCon} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cons.map((con, i) => (
                    <Badge key={i} variant="secondary" className="bg-red-100 text-red-700">
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      {con}
                      <button onClick={() => setFormData({ ...formData, cons: formData.cons.filter((_, idx) => idx !== i) })} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Cons (EN)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newConEn}
                    onChange={(e) => setNewConEn(e.target.value)}
                    placeholder="Add a con"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConEn())}
                  />
                  <Button type="button" onClick={addConEn} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cons_en.map((con, i) => (
                    <Badge key={i} variant="secondary" className="bg-red-100 text-red-700">
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      {con}
                      <button onClick={() => setFormData({ ...formData, cons_en: formData.cons_en.filter((_, idx) => idx !== i) })} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Verdict FR/EN */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Verdict (FR)</Label>
                <Textarea
                  value={formData.verdict}
                  onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                  placeholder="En résumé..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Verdict (EN)</Label>
                <Textarea
                  value={formData.verdict_en}
                  onChange={(e) => setFormData({ ...formData, verdict_en: e.target.value })}
                  placeholder="In summary..."
                  rows={3}
                />
              </div>
            </div>

            {/* Reviewer & Active */}
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <Label>Nom du reviewer</Label>
                <Input
                  value={formData.reviewer_name}
                  onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>Actif</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={resetForm}>Annuler</Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingReview ? 'Mettre à jour' : 'Créer l\'avis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
            Aucun avis Finder AI pour le moment
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id} className={`${!review.active ? 'opacity-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {getServiceName(review.ai_service_id)}
                      </h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-purple-500 text-purple-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      {!review.active && <Badge variant="secondary">Inactif</Badge>}
                    </div>
                    {review.title && (
                      <div className="font-medium text-purple-700 mb-2">{review.title}</div>
                    )}
                    <p className="text-slate-600 line-clamp-2">{review.content}</p>
                    <div className="text-sm text-slate-500 mt-2">Par {review.reviewer_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(review)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => deleteMutation.mutate(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}