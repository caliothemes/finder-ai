import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronUp, Eye, MessageSquare, Loader2 } from 'lucide-react';

export default function ServiceStatsAccordion({ service }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: pageViews = [], isLoading } = useQuery({
    queryKey: ['servicePageViews', service.slug],
    queryFn: () => base44.entities.PageView.filter({ page: `AIDetail?slug=${service.slug}` }, '-created_date', 5000),
    enabled: isOpen,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['serviceReviews', service.id],
    queryFn: () => base44.entities.Review.filter({ ai_service_id: service.id }),
    enabled: isOpen,
  });

  // Calculs des périodes
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const totalViews = pageViews.length;
  const views7Days = pageViews.filter(v => new Date(v.created_date) >= weekStart).length;
  const views30Days = pageViews.filter(v => new Date(v.created_date) >= monthStart).length;
  const viewsYear = pageViews.filter(v => new Date(v.created_date) >= yearStart).length;

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-b-xl -mt-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-amber-100/50 transition-colors"
      >
        <span className="text-xs font-medium text-amber-800 flex items-center gap-2">
          📊 Statistiques du service IA
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-3 pt-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {/* Visites totales */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] text-slate-500 font-medium">Total</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{totalViews}</span>
              </div>

              {/* 7 derniers jours */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] text-slate-500 font-medium">7 jours</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{views7Days}</span>
              </div>

              {/* 30 derniers jours */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-slate-500 font-medium">30 jours</span>
                </div>
                <span className="text-lg font-bold text-green-600">{views30Days}</span>
              </div>

              {/* Cette année */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] text-slate-500 font-medium">Année</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{viewsYear}</span>
              </div>

              {/* Vues historiques (compteur legacy) */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ExternalLink className="w-3 h-3 text-cyan-500" />
                  <span className="text-[10px] text-slate-500 font-medium">Vues (legacy)</span>
                </div>
                <span className="text-lg font-bold text-cyan-600">{legacyViews}</span>
              </div>

              {/* Likes */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <LayoutGrid className="w-3 h-3 text-pink-500" />
                  <span className="text-[10px] text-slate-500 font-medium">Likes</span>
                </div>
                <span className="text-lg font-bold text-pink-600">{likes}</span>
              </div>

              {/* Avis */}
              <div className="bg-white rounded-lg p-2 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px] text-slate-500 font-medium">Avis</span>
                </div>
                <span className="text-lg font-bold text-indigo-600">{reviews.length}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}