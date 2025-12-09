import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Home, Sparkles, Image, Scale, FileText, Code, TrendingUp, Briefcase, GraduationCap, Video } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { aiToolsCategories } from './aiToolsData';

const iconMap = {
  Image, Scale, FileText, Code, TrendingUp, Briefcase, GraduationCap, Video, Sparkles
};

export default function AIToolsSidebar({ onExpandChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        className={`fixed left-0 lg:left-72 top-[72px] md:top-[80px] bottom-0 transition-all duration-300 z-40 flex flex-col ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
        style={{
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 1)'}`
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center py-3 transition-colors"
          style={{ 
            color: isDark ? '#94a3b8' : '#64748b',
            borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 1)'}`
          }}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Home Link */}
          <div className={`${isExpanded ? 'px-4' : 'px-2'} mb-4`}>
            {!isExpanded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={createPageUrl('FinderGPT')}
                    className="flex items-center justify-center px-2 py-2 rounded-lg transition-all hover:bg-purple-500/10"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Home className="w-5 h-5 flex-shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Agent FinderAI
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                to={createPageUrl('FinderGPT')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-purple-500/10"
                style={{ color: 'var(--text-primary)' }}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Agent FinderAI
                </span>
              </Link>
            )}
          </div>

          {isExpanded && (
            <div className="px-4 mb-4 pb-4" style={{ borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 1)'}` }}>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {language === 'fr' ? '⚡ Services IA' : '⚡ AI Services'}
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'fr' ? 'Cliquez pour explorer' : 'Click to explore'}
              </p>
            </div>
          )}

          {/* Categories */}
          {!isExpanded ? (
            <div className="space-y-2 px-2">
              {aiToolsCategories.map((category) => {
                const CategoryIcon = iconMap[category.icon] || Sparkles;
                return (
                  <Tooltip key={category.id}>
                    <TooltipTrigger asChild>
                      <Link
                        to={createPageUrl('AIToolsCategory') + '?category=' + category.slug}
                        className="flex items-center justify-center px-2 py-2 rounded-lg cursor-pointer transition-all hover:scale-105"
                        style={{
                          backgroundColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 1)',
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {category.name[language]}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 px-2">
              {aiToolsCategories.map((category) => {
                const CategoryIcon = iconMap[category.icon] || Sparkles;
                return (
                  <Link
                    key={category.id}
                    to={createPageUrl('AIToolsCategory') + '?category=' + category.slug}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all group hover:bg-purple-500/10"
                    style={{
                      backgroundColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 1)',
                    }}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {category.name[language]}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {category.services.length} {language === 'fr' ? 'services' : 'services'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                  </Link>
                );
              })}
            </div>
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