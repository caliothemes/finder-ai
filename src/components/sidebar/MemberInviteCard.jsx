import React from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function MemberInviteCard() {
  const { language } = useLanguage();

  const benefits = language === 'en' 
    ? ['Save favorites', 'AI recommendations', 'Unlimited access']
    : ['Favoris illimités', 'Recommandations IA', 'Accès complet'];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Subtle glow effect */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-500/20 rounded-full blur-2xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-purple-300 uppercase tracking-wider font-medium">
              {language === 'en' ? '100% Free' : '100% Gratuit'}
            </p>
            <h3 className="font-bold text-white text-sm leading-tight">
              {language === 'en' ? 'Join Finder AI' : 'Rejoins Finder AI'}
            </h3>
          </div>
        </div>
        
        {/* Benefits */}
        <ul className="space-y-1.5 mb-4">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button 
          onClick={() => base44.auth.redirectToLogin()}
          size="sm"
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-lg"
        >
          {language === 'en' ? 'Get started →' : 'Commencer →'}
        </Button>
        
        <p className="text-[10px] text-slate-400 text-center mt-2">
          {language === 'en' ? 'No credit card required' : 'Sans carte bancaire'}
        </p>
      </div>
    </div>
  );
}