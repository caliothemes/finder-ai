import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPositionByValue } from './bannerPositions';

export default function BannerCalendar({ bannerId, position, onReserve }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState([]);

  const positionConfig = getPositionByValue(position);
  const creditsPerDay = positionConfig?.creditsPerDay || 1;

  // Charger toutes les dates réservées pour cette position
  const { data: reservedDates = [] } = useQuery({
    queryKey: ['reserved-dates', position],
    queryFn: async () => {
      const banners = await base44.entities.BannerReservation.filter({ 
        position,
        validated: true 
      });
      const dates = [];
      banners.forEach(b => {
        if (b.reserved_dates) dates.push(...b.reserved_dates);
      });
      return dates;
    },
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Si réservé, ne rien faire
    if (reservedDates.includes(dateStr)) return;
    
    // Toggle selection
    if (selected.includes(dateStr)) {
      setSelected(selected.filter(d => d !== dateStr));
    } else {
      setSelected([...selected, dateStr]);
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    onReserve(selected);
    setSelected([]);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isReserved = reservedDates.includes(dateStr);
    const isSelected = selected.includes(dateStr);
    const isPast = new Date(dateStr) < new Date(new Date().toDateString());

    days.push(
      <button
        key={day}
        onClick={() => !isPast && !isReserved && handleDateClick(day)}
        disabled={isPast || isReserved}
        className={`
          h-10 rounded
          ${isReserved ? 'bg-red-200 cursor-not-allowed' : ''}
          ${isSelected ? 'bg-purple-600 text-white font-bold' : ''}
          ${!isReserved && !isSelected && !isPast ? 'bg-slate-100 hover:bg-slate-200' : ''}
          ${isPast && !isReserved ? 'bg-slate-50 text-slate-300' : ''}
        `}
      >
        {day}
      </button>
    );
  }

  const totalCredits = selected.length * creditsPerDay;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Réserver des dates</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date(year, month + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 rounded" />
            Disponible
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded" />
            Réservé
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded" />
            Sélectionné
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
            <div key={d} className="text-center text-sm font-semibold text-slate-600">
              {d}
            </div>
          ))}
          {days}
        </div>

        {selected.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-bold">{selected.length} jour(s) sélectionné(s)</p>
                <p className="text-sm text-slate-600">Total: {totalCredits} crédits</p>
              </div>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                Réserver
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selected.sort().map(date => (
                <Badge key={date} variant="outline">
                  {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}