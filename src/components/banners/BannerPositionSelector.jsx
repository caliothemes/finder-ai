import React from 'react';
import { Check } from 'lucide-react';

const positions = [
  {
    value: 'homepage_hero',
    label: 'Accueil - Hero',
    description: 'Grande bannière visible en haut de la page d\'accueil',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 3,
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        <div className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
          VOTRE BANNIÈRE ICI
        </div>
        <div className="mt-2 flex gap-1">
          <div className="h-6 w-1/3 bg-slate-200 rounded" />
          <div className="h-6 w-1/3 bg-slate-200 rounded" />
          <div className="h-6 w-1/3 bg-slate-200 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'homepage_sidebar',
    label: 'Accueil - Sidebar (Card)',
    description: 'Bannière format card parmi les outils IA en vedette',
    recommendedSize: '400 x 300 px',
    creditsPerDay: 2,
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
        <div className="flex gap-1">
          <div className="w-1/3 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex flex-col items-center justify-center text-white text-[8px] font-bold animate-pulse border-2 border-purple-400">
            <div className="w-6 h-4 bg-white/30 rounded mb-1" />
            CARD
          </div>
          <div className="w-1/3 h-16 bg-slate-200 rounded-lg" />
          <div className="w-1/3 h-16 bg-slate-200 rounded-lg" />
        </div>
      </div>
    )
  },
  {
    value: 'explore_top',
    label: 'Explorer - Haut de page',
    description: 'Bannière sous le bloc de recherche dans Explorer',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        <div className="h-6 bg-slate-200 rounded w-full mb-2" />
        <div className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
          VOTRE BANNIÈRE ICI
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'explore_sidebar',
    label: 'Explorer - Sidebar (Card)',
    description: 'Bannière format card parmi les outils IA',
    recommendedSize: '400 x 300 px',
    creditsPerDay: 1,
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
        <div className="flex gap-1">
          <div className="w-1/3 h-16 bg-slate-200 rounded-lg" />
          <div className="w-1/3 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex flex-col items-center justify-center text-white text-[8px] font-bold animate-pulse border-2 border-purple-400">
            <div className="w-6 h-4 bg-white/30 rounded mb-1" />
            CARD
          </div>
          <div className="w-1/3 h-16 bg-slate-200 rounded-lg" />
        </div>
      </div>
    )
  },
  {
    value: 'homepage_category_bottom',
    label: 'Accueil - Sous Catégories',
    description: 'Bannière entre les catégories et le bouton Explorer',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 1,
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        <div className="grid grid-cols-4 gap-1 mb-2">
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
        </div>
        <div className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
          VOTRE BANNIÈRE ICI
        </div>
        <div className="mt-2 flex justify-center">
          <div className="h-4 w-24 bg-slate-300 rounded" />
        </div>
      </div>
    )
  }
];

export default function BannerPositionSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">
        Choisissez l'emplacement de votre bannière
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positions.map((position) => (
          <button
            key={position.value}
            type="button"
            onClick={() => onChange(position.value)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              value === position.value
                ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            {/* Selected indicator */}
            {value === position.value && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* Preview */}
            <div className="mb-3">
              {position.preview}
            </div>
            
            {/* Label */}
            <h4 className={`font-semibold mb-1 ${
              value === position.value ? 'text-purple-700' : 'text-slate-900'
            }`}>
              {position.label}
            </h4>
            <p className="text-xs text-slate-500 mb-2">
              {position.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                📐 {position.recommendedSize}
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                💰 {position.creditsPerDay} crédit{position.creditsPerDay > 1 ? 's' : ''}/jour
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}