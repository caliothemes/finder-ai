import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function ActiveBanner({ position }) {
  const today = new Date().toISOString().split('T')[0];

  const { data: activeBanner, isLoading } = useQuery({
    queryKey: ['activeBanner', position, today],
    queryFn: async () => {
      try {
        const banners = await base44.entities.BannerReservation.filter({
          position: position,
          validated: true,
          active: true
        });
        
        // Trouver une bannière qui a réservé aujourd'hui
        const banner = banners.find(b => 
          (b.reserved_dates || []).includes(today)
        );
        
        return banner || null;
      } catch (error) {
        console.error('Error loading banner:', error);
        return null;
      }
    },
  });

  if (isLoading || !activeBanner) return null;

  // Hauteurs selon la position
  const heightClasses = {
    homepage_hero: 'h-[200px] md:h-[300px]',
    homepage_sidebar: 'h-[400px]',
    category_top: 'h-[150px] md:h-[200px]',
    service_detail: 'h-[250px]'
  };

  return (
    <div className={`relative group overflow-hidden rounded-2xl shadow-xl ${heightClasses[position] || 'h-[200px]'}`}>
      <a 
        href={activeBanner.target_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        <img 
          src={activeBanner.image_url} 
          alt={activeBanner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge "À l'affiche" */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            À l'affiche
          </Badge>
        </div>
      </a>
    </div>
  );
}