import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Award, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function FinderAIReviewBlock({ review }) {
  const { language } = useLanguage();

  if (!review || !review.active) return null;

  const title = language === 'en' && review.title_en ? review.title_en : review.title;
  const content = language === 'en' && review.content_en ? review.content_en : review.content;
  const pros = language === 'en' && review.pros_en?.length > 0 ? review.pros_en : review.pros;
  const cons = language === 'en' && review.cons_en?.length > 0 ? review.cons_en : review.cons;
  const verdict = language === 'en' && review.verdict_en ? review.verdict_en : review.verdict;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl border-2 border-purple-200 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                {language === 'en' ? 'Finder AI Review' : 'Avis Finder AI'}
              </h3>
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? 'fill-purple-500 text-purple-500'
                        : 'text-purple-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {review.rating}/5 - {review.reviewer_name}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        {title && (
          <h4 className="text-lg font-semibold text-slate-900 mb-4">{title}</h4>
        )}

        {/* Content */}
        <p className="text-slate-700 leading-relaxed mb-6">{content}</p>

        {/* Pros & Cons */}
        {((pros && pros.length > 0) || (cons && cons.length > 0)) && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Pros */}
            {pros && pros.length > 0 && (
              <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">
                    {language === 'en' ? 'Pros' : 'Points forts'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {cons && cons.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-700">
                    {language === 'en' ? 'Cons' : 'Points faibles'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-700">
                      <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center">•</span>
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Verdict */}
        {verdict && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-700">
                {language === 'en' ? 'Our Verdict' : 'Notre Verdict'}
              </span>
            </div>
            <p className="text-slate-700">{verdict}</p>
          </div>
        )}
      </div>
    </div>
  );
}