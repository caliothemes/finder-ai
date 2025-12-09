import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, Wand2, Zap, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';

export default function NoBGModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleOpenNoBG = () => {
    window.open('https://nobg.me', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px]"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Supprimer l\'arrière-plan' : 'Remove Background'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Logo noBG.me */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-3xl overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 p-4 shadow-2xl">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691d22f0734aabcae8c2dd9d/8241b6ffc_Addaheading-min.png" 
                alt="noBG.me" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Presentation */}
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-white bg-clip-text text-transparent">
              noBG.me
            </h3>
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              {language === 'fr' 
                ? '✨ L\'outil ultime pour supprimer l\'arrière-plan de vos images !' 
                : '✨ The ultimate tool to remove image backgrounds!'
              }
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {language === 'fr'
                ? 'Supprimez instantanément l\'arrière-plan de n\'importe quelle image en quelques secondes grâce à l\'intelligence artificielle. Simple, rapide et professionnel.'
                : 'Instantly remove the background from any image in seconds using artificial intelligence. Simple, fast, and professional.'
              }
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'IA Avancée' : 'Advanced AI'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Précision maximale' : 'Maximum accuracy'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'Ultra Rapide' : 'Ultra Fast'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'En quelques secondes' : 'In seconds'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'Qualité Pro' : 'Pro Quality'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Résultats parfaits' : 'Perfect results'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'Gratuit' : 'Free'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Sans inscription' : 'No sign-up'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button 
              onClick={handleOpenNoBG}
              className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white py-6 text-lg font-bold shadow-xl"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {language === 'fr' ? 'Ouvrir noBG.me' : 'Open noBG.me'}
            </Button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              {language === 'fr'
                ? '🚀 Vous serez redirigé vers noBG.me dans un nouvel onglet'
                : '🚀 You will be redirected to noBG.me in a new tab'
              }
            </p>
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {language === 'fr'
                ? '💡 noBG.me est un service tiers recommandé par Finder AI pour sa qualité exceptionnelle'
                : '💡 noBG.me is a third-party service recommended by Finder AI for its exceptional quality'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}