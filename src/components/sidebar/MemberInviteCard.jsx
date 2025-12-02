import React from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function MemberInviteCard() {
  const { language } = useLanguage();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="w-4 h-4 text-purple-600" />
        <h3 className="font-semibold text-slate-900 text-sm">
          {language === 'en' ? 'Join us' : 'Rejoins-nous'}
        </h3>
      </div>
      
      <p className="text-slate-600 text-xs mb-3">
        {language === 'en' 
          ? 'Create your free account to save favorites and access all features.' 
          : 'Crée ton compte gratuit pour sauvegarder tes favoris et accéder à toutes les fonctionnalités.'}
      </p>

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