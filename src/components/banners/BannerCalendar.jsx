import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerCalendar({ bannerId, position, onReserve }) {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState([]);

  // Charger les dates réservées
  const { data: reserved = [] } = useQuery({
    queryKey: ['reserved', position],
    queryFn: async () => {
      const banners = await base44.entities.BannerReservation.filter({ position, validated: true });
      const dates = [];
      banners.forEach(b => { if (b.reserved_dates) dates.push(...b.reserved_dates); });
      return dates;
    },
  });

  const y = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const lastDate = new Date(y, m + 1, 0).getDate();

  const handleClick = (day) => {
    const d = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (reserved.includes(d)) return;
    if (selected.includes(d)) {
      setSelected(selected.filter(x => x !== d));
    } else {
      setSelected([...selected, d]);
    }
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`e${i}`} />);
  for (let d = 1; d <= lastDate; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isRes = reserved.includes(ds);
    const isSel = selected.includes(ds);
    days.push(
      <button
        key={d}
        onClick={() => handleClick(d)}
        disabled={isRes}
        className={`h-10 rounded text-sm font-medium ${
          isRes ? 'bg-red-200 cursor-not-allowed' :
          isSel ? 'bg-purple-600 text-white' :
          'bg-slate-100 hover:bg-slate-200'
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Réserver des dates</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setMonth(new Date(y, m - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 text-sm font-medium">
            {month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <Button size="sm" variant="outline" onClick={() => setMonth(new Date(y, m + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 text-xs mb-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-slate-100 rounded" /> Disponible
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 rounded" /> Réservé
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-600 rounded" /> Sélectionné
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-600">{d}</div>
        ))}
        {days}
      </div>

      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">{selected.length} jour(s)</span>
            <Button
              onClick={() => {
                console.log('CLICK RÉSERVER', selected);
                onReserve(selected);
                setSelected([]);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Réserver
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selected.sort().map(d => (
              <Badge key={d} variant="outline" className="text-xs">
                {new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}