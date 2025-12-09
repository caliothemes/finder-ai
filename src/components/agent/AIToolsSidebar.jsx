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