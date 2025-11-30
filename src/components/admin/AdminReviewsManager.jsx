import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Eye, EyeOff, Trash2, MessageSquare, Newspaper, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminReviewsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch AI Service Reviews
  const { data: serviceReviews = [], isLoading: loadingServices } = useQuery({
    queryKey: ['adminServiceReviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 500),
  });

  // Fetch News Reviews
  const { data: newsReviews = [], isLoading: loadingNews } = useQuery({
    queryKey: ['adminNewsReviews'],
    queryFn: () => base44.entities.NewsReview.list('-created_date', 500),
  });

  // Fetch AI Services for names
  const { data: services = [] } = useQuery({
    queryKey: ['allServicesForReviews'],
    queryFn: () => base44.entities.AIService.list('-created_date', 1000),
  });

  // Fetch News articles for names
  const { data: newsArticles = [] } = useQuery({
    queryKey: ['allNewsForReviews'],
    queryFn: () => base44.entities.AINews.list('-created_date', 500),
  });

  // Update service review status
  const updateServiceReviewMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Review.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceReviews'] });
      toast.success('Statut mis à jour');
    },
  });

  // Update news review status
  const updateNewsReviewMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.NewsReview.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsReviews'] });
      toast.success('Statut mis à jour');
    },
  });

  // Delete service review
  const deleteServiceReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceReviews'] });
      toast.success('Avis supprimé');
    },
  });

  // Delete news review
  const deleteNewsReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsReview.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNewsReviews'] });
      toast.success('Avis supprimé');
    },
  });

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Service inconnu';
  };

  const getNewsTitle = (newsId) => {
    const article = newsArticles.find(a => a.id === newsId);
    return article?.title || 'Article inconnu';
  };

  const filterReviews = (reviews, type) => {
    return reviews.filter(review => {
      const matchesSearch = searchQuery === '' || 
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && (review.status === 'published' || !review.status)) ||
        (statusFilter === 'unpublished' && review.status === 'unpublished');
      
      return matchesSearch && matchesStatus;
    });
  };

  const ReviewCard = ({ review, type, onToggleStatus, onDelete }) => {
    const isPublished = review.status === 'published' || !review.status;
    
    return (
      <div className={`bg-white rounded-xl border p-4 ${!isPublished ? 'opacity-60 border-red-200' : 'border-slate-200'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(review.user_name || review.user_email)?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium text-slate-900">{review.user_name || review.user_email?.split('@')[0]}</p>
              <p className="text-xs text-slate-500">{review.user_email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPublished ? 'default' : 'destructive'}>
              {isPublished ? 'Publié' : 'Dépublié'}
            </Badge>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1">
            {type === 'service' ? 'Service IA:' : 'Article:'}
          </p>
          <p className="text-sm font-medium text-purple-600">
            {type === 'service' ? getServiceName(review.ai_service_id) : getNewsTitle(review.news_id)}
          </p>
        </div>

        <p className="text-slate-700 text-sm mb-4 bg-slate-50 rounded-lg p-3">
          "{review.comment}"
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {new Date(review.created_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPublished ? 'outline' : 'default'}
              onClick={() => onToggleStatus(review.id, isPublished ? 'unpublished' : 'published')}
            >
              {isPublished ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Dépublier
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Publier
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm('Supprimer définitivement cet avis ?')) {
                  onDelete(review.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const filteredServiceReviews = filterReviews(serviceReviews, 'service');
  const filteredNewsReviews = filterReviews(newsReviews, 'news');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Avis Services</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{serviceReviews.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-pink-600 mb-2">
            <Newspaper className="w-5 h-5" />
            <span className="font-medium">Avis Articles</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{newsReviews.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Eye className="w-5 h-5" />
            <span className="font-medium">Publiés</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {serviceReviews.filter(r => r.status !== 'unpublished').length + 
             newsReviews.filter(r => r.status !== 'unpublished').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <EyeOff className="w-5 h-5" />
            <span className="font-medium">Dépubliés</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {serviceReviews.filter(r => r.status === 'unpublished').length + 
             newsReviews.filter(r => r.status === 'unpublished').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par email, nom ou contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les avis</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="unpublished">Dépubliés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Avis Services IA ({filteredServiceReviews.length})
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            Avis Articles ({filteredNewsReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          {loadingServices ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredServiceReviews.length > 0 ? (
            <div className="grid gap-4">
              {filteredServiceReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  type="service"
                  onToggleStatus={(id, status) => updateServiceReviewMutation.mutate({ id, status })}
                  onDelete={(id) => deleteServiceReviewMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun avis trouvé</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="news">
          {loadingNews ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredNewsReviews.length > 0 ? (
            <div className="grid gap-4">
              {filteredNewsReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  type="news"
                  onToggleStatus={(id, status) => updateNewsReviewMutation.mutate({ id, status })}
                  onDelete={(id) => deleteNewsReviewMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun avis trouvé</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}