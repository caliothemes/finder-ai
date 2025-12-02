import React from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function MemberInviteCard() {
  const { language } = useLanguage();

  const benefits = language === 'en' 
    ? ['Save your favorites', 'Rate AI tools', 'Access AI agent']
    : ['Sauvegarde tes favoris', 'Note les outils IA', 'Accès à l\'agent IA'];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4 text-purple-600" />
        <h3 className="font-semibold text-slate-900 text-sm">
          {language === 'en' ? 'Join us' : 'Rejoins-nous'}
        </h3>
      </div>
      
      <ul className="space-y-1.5 mb-3">
        {benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>

      <Button 
        onClick={() => base44.auth.redirectToLogin()}
        size="sm"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
      >
        {language === 'en' ? 'Sign up free' : 'Inscription gratuite'}
      </Button>
    </div>
  );
}