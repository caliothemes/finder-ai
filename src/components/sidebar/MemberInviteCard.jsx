import React from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, Star, MessageSquare, Sparkles, ArrowRight, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function MemberInviteCard() {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-yellow-300" />
        <h3 className="font-bold text-lg">
          {language === 'en' ? 'Join the community!' : 'Rejoins la communauté !'}
        </h3>
      </div>
      
      <p className="text-purple-100 text-sm mb-4">
        {language === 'en' 
          ? 'Create your free account and unlock all features' 
          : 'Crée ton compte gratuit et débloque toutes les fonctionnalités'}
      </p>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-pink-300" />
          </div>
          <span className="text-purple-100">
            {language === 'en' ? 'Save your favorite AI tools' : 'Sauvegarde tes IA favorites'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-yellow-300" />
          </div>
          <span className="text-purple-100">
            {language === 'en' ? 'Rate and review AI tools' : 'Note et donne ton avis'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <span className="text-purple-100">
            {language === 'en' ? 'Comment on AI news' : 'Commente les actualités IA'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-green-300" />
          </div>
          <span className="text-purple-100">
            {language === 'en' ? 'Use our AI agent' : 'Profite de notre agent IA'}
          </span>
        </div>
      </div>

      <Button 
        onClick={() => base44.auth.redirectToLogin()}
        className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold"
      >
        {language === 'en' ? 'Sign up for free' : 'S\'inscrire gratuitement'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}