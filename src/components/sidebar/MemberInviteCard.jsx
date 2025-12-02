import React from 'react';
import { base44 } from '@/api/base44Client';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function MemberInviteCard() {
  const { language } = useLanguage();

  const benefits = language === 'en' 
    ? ['Save AI tools to favorites', 'Rate and review AI tools', 'Access our FinderAI Agent']
    : ['Met des IA en favoris', 'Donne ton avis sur les outils IA', 'Accède à notre Agent FinderAI'];

  return (
    <div className="rounded-xl bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 p-4 border border-purple-200">
      {/* Header */}
      <h3 className="font-bold text-slate-900 text-sm mb-3">
        {language === 'en' ? 'Become a member' : 'Deviens membre'}
      </h3>
      
      {/* Benefits */}
      <ul className="space-y-2 mb-4">
        {benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
            <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button 
        onClick={() => base44.auth.redirectToLogin()}
        size="sm"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs"
      >
        {language === 'en' ? 'Sign up' : 'Inscription'}
      </Button>
    </div>
  );
}