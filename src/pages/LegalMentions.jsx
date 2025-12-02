import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Scale, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function LegalMentions() {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['legalSections'],
    queryFn: async () => {
      const data = await base44.entities.LegalSection.filter({ active: true });
      return data.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm mb-6">
            <Scale className="w-4 h-4" />
            <span>Informations légales</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mentions Légales
          </h1>
          
          <p style={{ color: 'var(--text-secondary)' }}>
            Toutes les informations légales concernant l'utilisation de Finder AI
          </p>
        </div>

        {/* Accordions */}
        {sections.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-2xl px-6 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-purple-600 py-6" style={{ color: 'var(--text-primary)' }}>
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div 
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Scale className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Aucune mention légale
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Les mentions légales seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}