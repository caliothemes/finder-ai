import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Crédits par jour selon la position
const CREDITS_PER_DAY = {
  homepage_hero: 3,
  homepage_sidebar: 2,
  explore_top: 2,
  explore_sidebar: 1
};

export default function BannerCalendar({ bannerId, position, onReserve }) {
  const creditsPerDay = CREDITS_PER_DAY[position] || 1;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);

  // Récupérer toutes les réservations pour cet emplacement
  const { data: allReservations = [] } = useQuery({
    queryKey: ['bannerReservations', position],
    queryFn: async () => {
      const reservations = await base44.entities.BannerReservation.filter({ 
        position: position,
        validated: true
      });
      return reservations;
    },
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateReserved = (dateStr) => {
    return allReservations.some(reservation => 
      (reservation.reserved_dates || []).includes(dateStr)
    );
  };

  const isDateSelected = (dateStr) => {
    return selectedDates.includes(dateStr);
  };

  const formatDateStr = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const toggleDate = (dateStr) => {
    if (isDateReserved(dateStr)) return;
    
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleReserve = () => {
    if (selectedDates.length === 0) return;
    onReserve(selectedDates);
    setSelectedDates([]);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const totalCredits = selectedDates.length * creditsPerDay;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Réserver des dates
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold min-w-[150px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Légende */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded" />
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded" />
            <span>Sélectionné</span>
          </div>
        </div>

        {/* Calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {/* Noms des jours */}
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-slate-600 py-2">
              {day}
            </div>
          ))}

          {/* Jours vides avant le début du mois */}
          {[...Array(startingDayOfWeek)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Jours du mois */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = formatDateStr(year, month, day);
            const reserved = isDateReserved(dateStr);
            const selected = isDateSelected(dateStr);
            const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <button
                key={day}
                onClick={() => !isPast && toggleDate(dateStr)}
                disabled={reserved || isPast}
                className={`
                  aspect-square rounded-lg font-semibold text-sm transition-all
                  ${reserved ? 'bg-red-100 text-red-400 cursor-not-allowed' : ''}
                  ${selected ? 'bg-purple-600 text-white shadow-lg scale-105' : ''}
                  ${!reserved && !selected && !isPast ? 'bg-slate-100 hover:bg-slate-200 text-slate-900' : ''}
                  ${isPast && !reserved ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Résumé et bouton de réservation */}
        {selectedDates.length > 0 && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedDates.length} jour{selectedDates.length > 1 ? 's' : ''} sélectionné{selectedDates.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-600">
                  Coût total: <span className="font-bold text-purple-600">{totalCredits} crédits</span>
                </p>
              </div>
              <Button
                onClick={handleReserve}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Réserver maintenant
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedDates.sort().map(date => (
                <Badge key={date} variant="outline" className="bg-white">
                  {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>💡 Tarif: {creditsPerDay} crédit{creditsPerDay > 1 ? 's' : ''} par jour • Les dates grisées sont déjà réservées</p>
        </div>
      </CardContent>
    </Card>
  );
}