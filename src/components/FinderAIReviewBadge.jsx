import React from 'react';
import { Award, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function FinderAIReviewBadge({ rating, size = 'default' }) {
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-[10px]',
    default: 'px-2 py-1 text-xs'
  };

  const iconSize = size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg ${sizeClasses[size]}`}>
            <Award className={iconSize} />
            <span>Finder AI</span>
            {rating && (
              <span className="flex items-center gap-0.5">
                <Star className={`${iconSize} fill-white`} />
                {rating}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-slate-800 border shadow-lg">
          <p className="text-sm font-medium">Testé et évalué par l'équipe Finder AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}