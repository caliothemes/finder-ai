import React from 'react';
import { Check } from 'lucide-react';

const positions = [
  {
    value: 'homepage_hero',
    label: 'Page d\'accueil - Hero',
    description: 'Grande bannière visible en haut de la page d\'accueil',
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        {/* Header */}
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        {/* Hero Banner - Highlighted */}
        <div className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
          VOTRE BANNIÈRE ICI
        </div>
        {/* Content below */}
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
    label: 'Page d\'accueil - Sidebar',
    description: 'Bannière visible dans la barre latérale',
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden flex gap-2">
        {/* Main content */}
        <div className="flex-1">
          <div className="h-3 bg-slate-300 rounded w-full mb-2" />
          <div className="h-8 bg-slate-200 rounded mb-2" />
          <div className="flex gap-1">
            <div className="h-12 w-1/2 bg-slate-200 rounded" />
            <div className="h-12 w-1/2 bg-slate-200 rounded" />
          </div>
        </div>
        {/* Sidebar - Highlighted */}
        <div className="w-1/4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-[8px] font-bold text-center p-1 animate-pulse">
          VOTRE BANNIÈRE
        </div>
      </div>
    )
  },
  {
    value: 'category_top',
    label: 'Catégories - En haut',
    description: 'Bannière en haut des pages de catégories',
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        {/* Header */}
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        {/* Category title */}
        <div className="h-4 bg-slate-300 rounded w-1/3 mb-2" />
        {/* Banner - Highlighted */}
        <div className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
          VOTRE BANNIÈRE ICI
        </div>
        {/* Cards grid */}
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
        </div>
      </div>
    )
  },
  {
    value: 'service_detail',
    label: 'Détail service',
    description: 'Bannière sur les pages de détail d\'un outil IA',
    preview: (
      <div className="w-full h-32 bg-slate-100 rounded-lg p-2 relative overflow-hidden">
        {/* Header */}
        <div className="h-3 bg-slate-300 rounded w-full mb-2" />
        {/* Service header */}
        <div className="flex gap-2 mb-2">
          <div className="w-8 h-8 bg-slate-300 rounded-full" />
          <div className="flex-1">
            <div className="h-3 bg-slate-300 rounded w-1/2 mb-1" />
            <div className="h-2 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
        {/* Content */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-slate-200 rounded" />
          {/* Sidebar banner - Highlighted */}
          <div className="w-1/3 h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-[8px] font-bold text-center animate-pulse">
            VOTRE BANNIÈRE
          </div>
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
            <p className="text-xs text-slate-500">
              {position.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}