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
    <div className="relative rounded-xl bg-gradient-to-b from-purple-100 to-purple-200 p-4 border border-purple-200 overflow-hidden shadow-sm">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239333ea' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div className="relative">
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
        
        <p className="text-[10px] text-purple-600 font-medium text-center mt-2">
          {language === 'en' ? '100% Free' : '100% Gratuit'}
        </p>
      </div>
    </div>
  );
}