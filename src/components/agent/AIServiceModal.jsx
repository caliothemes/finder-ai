import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIServiceModal({ service, isOpen, onClose }) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  if (!service) return null;

  const handleAskAgent = () => {
    onClose();
    navigate(createPageUrl('FinderGPT') + '?prompt=' + encodeURIComponent(service.prompt[language]));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px]"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            {service.name[language]}
          </DialogTitle>
          <DialogDescription className="text-base mt-3" style={{ color: 'var(--text-secondary)' }}>
            {service.description[language]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Info Section */}
          <div className="rounded-xl p-4" style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              💡 {language === 'fr' 
                ? 'Ce service utilise des technologies IA avancées pour vous aider dans vos tâches quotidiennes. Agent FinderAI peut vous recommander les meilleurs outils disponibles.' 
                : 'This service uses advanced AI technologies to help with your daily tasks. Agent FinderAI can recommend the best available tools.'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleAskAgent}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-base"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              {language === 'fr' 
                ? 'Demander à Agent FinderAI des recommandations' 
                : 'Ask Agent FinderAI for recommendations'
              }
            </Button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              {language === 'fr'
                ? '✨ Agent FinderAI vous recommandera les meilleurs outils disponibles pour cette tâche'
                : '✨ Agent FinderAI will recommend the best available tools for this task'
              }
            </p>
          </div>

          {/* Additional Info */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {language === 'fr' ? 'À propos de ce service' : 'About this service'}
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  {language === 'fr' 
                    ? 'Technologie IA de pointe pour des résultats optimaux' 
                    : 'Cutting-edge AI technology for optimal results'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  {language === 'fr' 
                    ? 'Interface simple et intuitive' 
                    : 'Simple and intuitive interface'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  {language === 'fr' 
                    ? 'Résultats rapides et précis' 
                    : 'Fast and accurate results'
                  }
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}