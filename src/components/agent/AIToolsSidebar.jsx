
import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, ChevronDown, // Added ChevronDown
  Image, Scale, FileText, Code, 
  TrendingUp, Briefcase, GraduationCap,
  Wand2, ShoppingCart, Video, Mail,
  FileCheck, UserSearch, Palette,
  Languages, Bug, Search, Lightbulb
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// Added Accordion components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AIToolsSidebar({ onToolSelect, onExpandChange }) { // Added onExpandChange prop
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Modified handleToggle to call onExpandChange
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpandChange) {
      onExpandChange(newState);
    }
  };

  const categories = [
    {
      id: 'image',
      icon: Image,
      name: { fr: 'Génération Image', en: 'Image Generation' },
      color: 'from-purple-500 to-pink-500',
      tools: [
        { 
          icon: Wand2, 
          name: { fr: 'Générer une image', en: 'Generate image' },
          prompt: { fr: 'Génère une image de ', en: 'Generate an image of ' }
        },
        { 
          icon: Palette, 
          name: { fr: 'Modifier une image', en: 'Edit image' },
          prompt: { fr: 'Quels outils pour modifier des images ? ', en: 'Which tools to edit images? ' }
        },
        { 
          icon: Image, 
          name: { fr: 'Image to Image', en: 'Image to Image' },
          prompt: { fr: 'Outils pour transformer une image en une autre', en: 'Tools to transform an image to another' }
        }
      ]
    },
    {
      id: 'legal',
      icon: Scale,
      name: { fr: 'Juridique & Legal', en: 'Legal & Law' },
      color: 'from-blue-500 to-cyan-500',
      tools: [
        { 
          icon: FileCheck, 
          name: { fr: 'Générer un contrat', en: 'Generate contract' },
          prompt: { fr: 'Aide-moi à générer un contrat de ', en: 'Help me generate a contract for ' }
        },
        { 
          icon: FileText, 
          name: { fr: 'Analyser un document', en: 'Analyze document' },
          prompt: { fr: 'Quels outils pour analyser des documents juridiques ?', en: 'Which tools to analyze legal documents?' }
        },
        { 
          icon: UserSearch, 
          name: { fr: 'Recherche avocat', en: 'Find lawyer' },
          prompt: { fr: 'Comment trouver un avocat spécialisé en ', en: 'How to find a lawyer specialized in ' }
        }
      ]
    },
    {
      id: 'text',
      icon: FileText,
      name: { fr: 'Rédaction & Texte', en: 'Writing & Text' },
      color: 'from-green-500 to-emerald-500',
      tools: [
        { 
          icon: FileText, 
          name: { fr: 'Rédiger un texte', en: 'Write text' },
          prompt: { fr: 'Aide-moi à rédiger ', en: 'Help me write ' }
        },
        { 
          icon: Languages, 
          name: { fr: 'Traduire du texte', en: 'Translate text' },
          prompt: { fr: 'Quels outils pour traduire du texte ?', en: 'Which tools to translate text?' }
        },
        { 
          icon: FileCheck, 
          name: { fr: 'Corriger orthographe', en: 'Fix spelling' },
          prompt: { fr: 'Outils pour corriger l\'orthographe et la grammaire', en: 'Tools to fix spelling and grammar' }
        }
      ]
    },
    {
      id: 'code',
      icon: Code,
      name: { fr: 'Code & Dev', en: 'Code & Dev' },
      color: 'from-orange-500 to-red-500',
      tools: [
        { 
          icon: Code, 
          name: { fr: 'Générer du code', en: 'Generate code' },
          prompt: { fr: 'Aide-moi à coder ', en: 'Help me code ' }
        },
        { 
          icon: Bug, 
          name: { fr: 'Débugger mon code', en: 'Debug my code' },
          prompt: { fr: 'Quels outils pour débugger mon code ?', en: 'Which tools to debug my code?' }
        },
        { 
          icon: Search, 
          name: { fr: 'Expliquer du code', en: 'Explain code' },
          prompt: { fr: 'Outils pour comprendre et expliquer du code', en: 'Tools to understand and explain code' }
        }
      ]
    },
    {
      id: 'marketing',
      icon: TrendingUp,
      name: { fr: 'Marketing & SEO', en: 'Marketing & SEO' },
      color: 'from-pink-500 to-rose-500',
      tools: [
        { 
          icon: Search, 
          name: { fr: 'Optimiser SEO', en: 'Optimize SEO' },
          prompt: { fr: 'Outils pour optimiser le SEO de mon site', en: 'Tools to optimize my website SEO' }
        },
        { 
          icon: FileText, 
          name: { fr: 'Créer des publicités', en: 'Create ads' },
          prompt: { fr: 'Aide-moi à créer des publicités pour ', en: 'Help me create ads for ' }
        },
        { 
          icon: Mail, 
          name: { fr: 'Email marketing', en: 'Email marketing' },
          prompt: { fr: 'Quels outils pour l\'email marketing ?', en: 'Which tools for email marketing?' }
        }
      ]
    },
    {
      id: 'business',
      icon: Briefcase,
      name: { fr: 'Business & Finance', en: 'Business & Finance' },
      color: 'from-indigo-500 to-purple-500',
      tools: [
        { 
          icon: Briefcase, 
          name: { fr: 'Plan d\'affaires', en: 'Business plan' },
          prompt: { fr: 'Aide-moi à créer un business plan pour ', en: 'Help me create a business plan for ' }
        },
        { 
          icon: TrendingUp, 
          name: { fr: 'Analyse de marché', en: 'Market analysis' },
          prompt: { fr: 'Outils pour analyser un marché', en: 'Tools to analyze a market' }
        },
        { 
          icon: FileCheck, 
          name: { fr: 'Gestion finances', en: 'Finance management' },
          prompt: { fr: 'Quels outils pour gérer mes finances ?', en: 'Which tools to manage my finances?' }
        }
      ]
    },
    {
      id: 'education',
      icon: GraduationCap,
      name: { fr: 'Éducation & Formation', en: 'Education & Training' },
      color: 'from-yellow-500 to-amber-500',
      tools: [
        { 
          icon: Lightbulb, 
          name: { fr: 'Créer des quiz', en: 'Create quizzes' },
          prompt: { fr: 'Aide-moi à créer un quiz sur ', en: 'Help me create a quiz about ' }
        },
        { 
          icon: FileText, 
          name: { fr: 'Résumer un cours', en: 'Summarize course' },
          prompt: { fr: 'Outils pour résumer des cours', en: 'Tools to summarize courses' }
        },
        { 
          icon: Languages, 
          name: { fr: 'Apprendre une langue', en: 'Learn language' },
          prompt: { fr: 'Quels outils pour apprendre ', en: 'Which tools to learn ' }
        }
      ]
    },
    {
      id: 'video',
      icon: Video,
      name: { fr: 'Vidéo & Audio', en: 'Video & Audio' },
      color: 'from-red-500 to-pink-500',
      tools: [
        { 
          icon: Video, 
          name: { fr: 'Créer une vidéo', en: 'Create video' },
          prompt: { fr: 'Aide-moi à créer une vidéo de ', en: 'Help me create a video of ' }
        },
        { 
          icon: Wand2, 
          name: { fr: 'Éditer une vidéo', en: 'Edit video' },
          prompt: { fr: 'Quels outils pour éditer des vidéos ?', en: 'Which tools to edit videos?' }
        },
        { 
          icon: Languages, 
          name: { fr: 'Sous-titres auto', en: 'Auto subtitles' },
          prompt: { fr: 'Outils pour générer des sous-titres automatiquement', en: 'Tools to generate subtitles automatically' }
        }
      ]
    }
  ];

  const handleToolClick = (tool) => {
    const promptText = tool.prompt[language];
    if (onToolSelect) {
      onToolSelect(promptText);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className={`fixed left-0 lg:left-72 top-[72px] md:top-[80px] h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] transition-all duration-300 z-40 flex flex-col ${ // Added flex-col
          isExpanded ? 'w-64' : 'w-16'
        }`}
        style={{
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 1)'}`
        }}
      >
        {/* Toggle Button - Moved to the top and outside the scrollable content */}
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center py-3 transition-colors"
          style={{ 
            color: isDark ? '#94a3b8' : '#64748b',
            borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 1)'}` // Added borderBottom
          }}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Content - This div is now flex-1 and scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Title when expanded */}
          {isExpanded && (
            <div className="px-4 mb-4">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {language === 'fr' ? '⚡ Outils IA Rapides' : '⚡ Quick AI Tools'}
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'fr' ? 'Cliquez pour utiliser' : 'Click to use'}
              </p>
            </div>
          )}

          {/* Categories - Conditional rendering based on isExpanded */}
          {!isExpanded ? (
            // Collapsed state: Show icons with tooltips
            <div className="space-y-2 px-2">
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <Tooltip key={category.id}>
                    <TooltipTrigger asChild>
                      <div 
                        className="flex items-center justify-center px-2 py-2 rounded-lg cursor-pointer transition-all"
                        style={{
                          backgroundColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 1)',
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {category.name[language]}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ) : (
            // Expanded state: Show categories as accordions
            <Accordion type="multiple" className="px-2">
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <AccordionItem 
                    key={category.id} 
                    value={category.id}
                    className="border-b-0" // Remove default border-b from AccordionItem
                  >
                    <AccordionTrigger 
                      className="flex items-center justify-between gap-3 px-2 py-2 hover:no-underline rounded-lg transition-all [&[data-state=open]>svg]:rotate-180" // Tailwind classes for rotation
                      style={{
                        backgroundColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 1)',
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {category.name[language]}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" /> {/* Accordion indicator */}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0"> {/* Adjusted padding */}
                      <div className="space-y-1 pl-2">
                        {category.tools.map((tool, idx) => {
                          const ToolIcon = tool.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleToolClick(tool)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left group"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <ToolIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                              <span className="text-xs truncate group-hover:text-purple-600 transition-colors">
                                {tool.name[language]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        {/* Bottom Info */}
        {isExpanded && (
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
              {language === 'fr' ? 'Services IA instantanés' : 'Instant AI services'}
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
