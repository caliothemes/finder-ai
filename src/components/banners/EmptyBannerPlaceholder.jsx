import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyBannerPlaceholder({ variant = 'banner' }) {
  // Card format (comme les cards de services)
  if (variant === 'card') {
    return (
      <div className="group bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all duration-300 hover:shadow-xl flex items-center justify-center p-8 min-h-[300px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Votre Service IA ici
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Augmentez votre visibilité avec un compte pro
          </p>
          <Link to={createPageUrl('ProAccount')}>
            <Button className="bg-purple-950 hover:bg-purple-900 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Devenir Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Banner format (horizontal)
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all duration-300 h-[150px] md:h-[200px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold text-slate-900">
                Votre bannière ici
              </h3>
              <p className="text-sm text-slate-600">
                Atteignez des milliers d'utilisateurs
              </p>
            </div>
          </div>
          <Link to={createPageUrl('ProAccount')}>
            <Button className="bg-purple-950 hover:bg-purple-900 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Devenir Pro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}