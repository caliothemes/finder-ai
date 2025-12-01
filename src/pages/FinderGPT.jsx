import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Send, Bot, User, Sparkles, Loader2, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';
import ReactMarkdown from 'react-markdown';

export default function FinderGPT() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { language } = useLanguage();

  // Fetch AI Services and News for context
  const { data: services = [] } = useQuery({
    queryKey: ['gptServices'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }, '-views', 500),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['gptCategories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const { data: news = [] } = useQuery({
    queryKey: ['gptNews'],
    queryFn: () => base44.entities.AINews.filter({ status: 'published' }, '-created_date', 50),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContext = () => {
    const servicesContext = services.slice(0, 100).map(s => ({
      name: s.name,
      slug: s.slug,
      description: language === 'en' && s.description_en ? s.description_en : s.description,
      tagline: language === 'en' && s.tagline_en ? s.tagline_en : s.tagline,
      categories: s.categories?.map(cid => categories.find(c => c.id === cid)?.name).filter(Boolean),
      pricing: s.pricing,
      rating: s.average_rating,
      tags: s.tags,
      website: s.website_url
    }));

    const newsContext = news.slice(0, 20).map(n => ({
      title: language === 'en' && n.title_en ? n.title_en : n.title,
      slug: n.slug,
      summary: language === 'en' && n.summary_en ? n.summary_en : n.summary,
      tags: n.tags
    }));

    return { services: servicesContext, news: newsContext, categories: categories.map(c => c.name) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const context = buildContext();
    
    const systemPrompt = `Tu es FinderAI-GPT, l'assistant IA expert de FinderAI, le répertoire ultime des outils d'intelligence artificielle.

CONTEXTE - Tu as accès à la base de données FinderAI:
- ${context.services.length} outils IA référencés
- Catégories: ${context.categories.join(', ')}
- ${context.news.length} actualités IA récentes

BASE DE DONNÉES DES OUTILS IA:
${JSON.stringify(context.services.slice(0, 50), null, 0)}

ACTUALITÉS IA RÉCENTES:
${JSON.stringify(context.news.slice(0, 10), null, 0)}

RÈGLES IMPORTANTES:
1. Recommande TOUJOURS des outils de la base FinderAI en priorité
2. Quand tu recommandes un outil, mentionne son nom exact et ajoute le lien: [NomOutil](AIDetail?slug=SLUG)
3. Pour les actualités, ajoute le lien: [Titre](AINewsDetail?slug=SLUG)
4. Sois précis, concis et utile
5. Réponds en ${language === 'en' ? 'anglais' : 'français'}
6. Si tu ne trouves pas d'outil adapté dans la base, dis-le honnêtement
7. Mets en avant les points forts de chaque outil (prix, fonctionnalités, note)
8. Tu peux comparer plusieurs outils si pertinent

FORMAT DE RÉPONSE:
- Utilise des listes à puces pour les recommandations
- Mets en **gras** les noms d'outils
- Sois structuré et facile à lire`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nQuestion de l'utilisateur: ${userMessage}`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: language === 'en' 
          ? 'Sorry, an error occurred. Please try again.' 
          : 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = language === 'en' ? [
    "What AI for generating images?",
    "Best free AI tools for writing?",
    "Which AI for creating videos?",
    "Latest AI news?"
  ] : [
    "Quelle IA pour générer des images ?",
    "Les meilleurs outils IA gratuits pour écrire ?",
    "Quelle IA pour créer des vidéos ?",
    "Quelles sont les dernières actualités IA ?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              FinderAI-GPT
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h1>
            <p className="text-sm text-slate-600">
              {language === 'en' 
                ? 'Your AI expert to find the perfect tool' 
                : 'Ton expert IA pour trouver l\'outil parfait'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {language === 'en' ? 'Welcome to FinderAI-GPT!' : 'Bienvenue sur FinderAI-GPT !'}
              </h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {language === 'en' 
                  ? 'Ask me anything about AI tools. I know all the tools in the FinderAI database and can help you find the perfect one for your needs.'
                  : 'Pose-moi n\'importe quelle question sur les outils IA. Je connais tous les outils de la base FinderAI et peux t\'aider à trouver celui qu\'il te faut.'}
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-left px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-sm text-slate-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p>{message.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="prose prose-sm max-w-none prose-slate"
                      components={{
                        a: ({ href, children }) => {
                          // Check if it's an internal link
                          if (href?.includes('AIDetail?slug=') || href?.includes('AINewsDetail?slug=')) {
                            return (
                              <Link 
                                to={createPageUrl(href)} 
                                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
                              >
                                {children}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            );
                          }
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                              {children}
                            </a>
                          );
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-purple-700">{children}</strong>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'en' ? 'Thinking...' : 'Réflexion...'}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'en' 
                ? 'Ask me about AI tools...' 
                : 'Pose-moi une question sur les outils IA...'}
              className="flex-1 resize-none min-h-[50px] max-h-[150px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {language === 'en' 
              ? 'FinderAI-GPT knows all AI tools in our database and recent AI news' 
              : 'FinderAI-GPT connaît tous les outils IA de notre base et les actualités IA récentes'}
          </p>
        </form>
      </div>
    </div>
  );
}