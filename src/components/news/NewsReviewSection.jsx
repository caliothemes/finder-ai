import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function NewsReviewSection({ newsId }) {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: reviews = [] } = useQuery({
    queryKey: ['newsReviews', newsId],
    queryFn: () => base44.entities.NewsReview.filter({ news_id: newsId, status: 'published' }, '-created_date'),
    enabled: !!newsId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.NewsReview.create({
        news_id: newsId,
        user_email: user.email,
        user_name: user.full_name || user.email.split('@')[0],
        rating,
        comment,
        status: 'published'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsReviews', newsId] });
      setRating(0);
      setComment('');
      toast.success(language === 'en' ? 'Review submitted!' : 'Avis publié !');
    },
    onError: () => {
      toast.error(language === 'en' ? 'Error submitting review' : 'Erreur lors de la publication');
    }
  });

  const handleSubmit = () => {
    if (!user) {
      toast.error(language === 'en' ? 'Please log in' : 'Veuillez vous connecter');
      base44.auth.redirectToLogin();
      return;
    }
    if (rating === 0) {
      toast.error(language === 'en' ? 'Please select a rating' : 'Veuillez sélectionner une note');
      return;
    }
    if (!comment.trim()) {
      toast.error(language === 'en' ? 'Please write a comment' : 'Veuillez écrire un commentaire');
      return;
    }
    submitReviewMutation.mutate();
  };

  const userHasReviewed = user && reviews.some(r => r.user_email === user.email);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-slate-900">
            {language === 'en' ? 'Member Reviews' : 'Avis des membres'}
          </h3>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <span className="font-semibold text-slate-900">{averageRating}</span>
            <span className="text-slate-500">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {user && !userHasReviewed && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-6">
          <h4 className="font-semibold text-slate-900 mb-3">
            {language === 'en' ? 'Share your opinion' : 'Partagez votre avis'}
          </h4>
          
          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-slate-600">
                {rating === 1 && (language === 'en' ? 'Poor' : 'Mauvais')}
                {rating === 2 && (language === 'en' ? 'Fair' : 'Passable')}
                {rating === 3 && (language === 'en' ? 'Good' : 'Bien')}
                {rating === 4 && (language === 'en' ? 'Very Good' : 'Très bien')}
                {rating === 5 && (language === 'en' ? 'Excellent' : 'Excellent')}
              </span>
            )}
          </div>

          <Textarea
            placeholder={language === 'en' ? 'What did you think of this article?' : 'Qu\'avez-vous pensé de cet article ?'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4 bg-white"
            rows={3}
          />

          <Button 
            onClick={handleSubmit} 
            disabled={submitReviewMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitReviewMutation.isPending 
              ? (language === 'en' ? 'Sending...' : 'Envoi...') 
              : (language === 'en' ? 'Submit Review' : 'Publier mon avis')}
          </Button>
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div className="bg-slate-50 rounded-xl p-5 mb-6 text-center">
          <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-3">
            {language === 'en' 
              ? 'Log in to share your opinion on this article' 
              : 'Connectez-vous pour partager votre avis sur cet article'}
          </p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-purple-600 hover:bg-purple-700">
            {language === 'en' ? 'Log in' : 'Se connecter'}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {(review.user_name || review.user_email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{review.user_name || review.user_email.split('@')[0]}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(review.created_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 ml-13">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p>{language === 'en' ? 'No reviews yet. Be the first!' : 'Aucun avis pour le moment. Soyez le premier !'}</p>
        </div>
      )}
    </div>
  );
}