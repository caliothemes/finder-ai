import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Bot, User, Sparkles, Loader2, ExternalLink, Star, Plus, MessageSquare, Trash2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';
import ReactMarkdown from 'react-markdown';

export default function FinderGPT() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Fetch chat history for logged in users
  const { data: chatHistory = [] } = useQuery({
    queryKey: ['gptChatHistory', user?.email],
    queryFn: () => base44.entities.GPTChat.filter({ user_email: user.email }, '-updated_date', 50),
    enabled: !!user?.email,
  });

  // Save chat mutation
  const saveChatMutation = useMutation({
    mutationFn: async ({ chatId, messages, title }) => {
      if (chatId) {
        await base44.entities.GPTChat.update(chatId, { messages, title });
        return chatId;
      } else {
        const newChat = await base44.entities.GPTChat.create({
          user_email: user.email,
          messages,
          title: title || messages[0]?.content?.slice(0, 50) + '...'
        });
        return newChat.id;
      }
    },
    onSuccess: (id) => {
      setCurrentChatId(id);
      queryClient.invalidateQueries({ queryKey: ['gptChatHistory'] });
    }
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: (id) => base44.entities.GPTChat.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gptChatHistory'] });
      if (currentChatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
  });

  // Load a chat from history
  const loadChat = (chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages || []);
  };

  // Start new chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // Voice input
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'en' ? 'Speech recognition not supported in this browser' : 'La reconnaissance vocale n\'est pas supportée par ce navigateur');
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

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
    // Inclure TOUS les services pour une meilleure recherche
    const servicesContext = services.map(s => ({
      name: s.name,
      slug: s.slug,
      description: language === 'en' && s.description_en ? s.description_en : s.description,
      tagline: language === 'en' && s.tagline_en ? s.tagline_en : s.tagline,
      categories: s.categories?.map(cid => categories.find(c => c.id === cid)?.name).filter(Boolean),
      pricing: s.pricing,
      rating: s.average_rating,
      tags: s.tags,
      website: s.website_url,
      features: language === 'en' && s.features_en ? s.features_en : s.features
    }));

    const newsContext = news.slice(0, 30).map(n => ({
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
    
    const systemPrompt = `Tu es Agent FinderAI, l'assistant IA expert de FinderAI, le répertoire ultime des outils d'intelligence artificielle.

CONTEXTE - Tu as accès à la BASE DE DONNÉES COMPLÈTE de FinderAI:
- ${context.services.length} outils IA référencés
- Catégories disponibles: ${context.categories.join(', ')}
- ${context.news.length} actualités IA récentes sur FinderAI

🔍 BASE DE DONNÉES COMPLÈTE DES OUTILS IA FINDERAI (CHERCHE DEDANS EN PRIORITÉ):
${JSON.stringify(context.services, null, 0)}

📰 ACTUALITÉS IA RÉCENTES SUR FINDERAI:
${JSON.stringify(context.news, null, 0)}

PAGES DU SITE FINDERAI:
- Page Explorer: [Explorer les outils IA](Explore)
- Page Catégories: [Voir toutes les catégories](Categories)
- Page Actualités: [Voir toutes les actualités](AINews)
- Page Favoris: [Mes favoris](Favorites)
- Proposer un outil: [Soumettre une IA](SubmitAI)

⚠️ RÈGLES CRITIQUES À SUIVRE ABSOLUMENT:

1. QUAND ON TE DEMANDE SI TU CONNAIS UN OUTIL:
   - Cherche d'abord dans la BASE DE DONNÉES FINDERAI ci-dessus
   - Si l'outil existe (même avec un nom légèrement différent), dis "Oui, je connais !" et donne TOUTES ses infos
   - Affiche: nom, description, tagline, catégories, pricing, note, fonctionnalités, site web
   - Ajoute TOUJOURS le lien: [**Voir la fiche complète de NomOutil**](AIDetail?slug=SLUG)
   - Puis propose des outils SIMILAIRES de FinderAI dans la même catégorie

2. PRIORITÉ ABSOLUE AUX CONTENUS FINDERAI:
   - Pour les actualités: utilise UNIQUEMENT celles de la base FinderAI
   - Pour les outils: recommande d'abord ceux de FinderAI avec leurs liens
   - Ne dis JAMAIS "je ne connais pas" si l'outil est dans la base !

3. FORMAT DES LIENS (OBLIGATOIRE):
   - Outil FinderAI: [**NomOutil**](AIDetail?slug=SLUG)
   - Actualité FinderAI: [Titre](AINewsDetail?slug=SLUG)
   - Page du site: [Texte](NomPage)

4. STRUCTURE DE RÉPONSE QUAND ON DEMANDE UN OUTIL SPÉCIFIQUE:
   ✅ "Oui, je connais **NomOutil** ! Voici tout ce que je sais:"
   📋 Description complète
   💰 Pricing
   ⭐ Note
   🔗 Lien vers la fiche
   
   💡 "Tu pourrais aussi aimer ces outils similaires sur FinderAI:"
   - [**Outil1**](AIDetail?slug=xxx)
   - [**Outil2**](AIDetail?slug=xxx)

5. Réponds en ${language === 'en' ? 'anglais' : 'français'}
6. Sois enthousiaste et engageant
7. Termine TOUJOURS par un lien de navigation FinderAI

FORMAT DE RÉPONSE:
- Utilise des emojis (🤖 🚀 ✨ 📰 💡 ⭐ etc.)
- Mets en **gras** les noms d'outils
- Utilise des listes structurées
- Ajoute des sections claires avec des titres`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nQuestion de l'utilisateur: ${userMessage}`,
        add_context_from_internet: true,
      });

      const newMessages = [...messages, { role: 'user', content: userMessage }, { role: 'assistant', content: response }];
      setMessages(newMessages);
      
      // Save chat for logged in users
      if (user) {
        saveChatMutation.mutate({
          chatId: currentChatId,
          messages: newMessages,
          title: newMessages[0]?.content?.slice(0, 50)
        });
      }
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
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              Agent FinderAI
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            </h1>
            <p className="text-xs md:text-sm text-slate-600 truncate">
              {language === 'en' 
                ? 'Your AI expert to find the perfect tool' 
                : 'Ton expert IA pour trouver l\'outil parfait'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {messages.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-2">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">
                {language === 'en' ? 'Welcome to Agent FinderAI!' : 'Bienvenue sur Agent FinderAI !'}
              </h2>
              <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 max-w-md mx-auto">
                {language === 'en' 
                  ? 'I\'m your AI expert! Ask me anything: find the perfect AI tool, get the latest AI news, or ask any question about artificial intelligence.'
                  : 'Je suis ton expert IA ! Pose-moi n\'importe quelle question : trouver l\'outil IA parfait, connaître les dernières actualités IA, ou poser une question sur l\'intelligence artificielle.'}
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-left px-3 md:px-4 py-2.5 md:py-3 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-xs md:text-sm text-slate-700"
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
                className={`flex gap-2 md:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl px-3 md:px-5 py-2.5 md:py-3 ${
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
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-2 md:gap-4 justify-start">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-5 py-2.5 md:py-3">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
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
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-t border-purple-200 px-6 py-5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' 
                  ? 'Ask me about AI tools...' 
                  : 'Pose-moi une question sur les outils IA...'}
                className="w-full resize-none min-h-[50px] max-h-[150px] bg-white border-purple-200 focus:border-purple-400 pr-12"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'hover:bg-purple-100 text-purple-600'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Chat History - Horizontal under prompt */}
          {user && chatHistory.length > 0 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={startNewChat}
                className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'New' : 'Nouveau'}
              </button>
              {chatHistory.slice(0, 8).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 max-w-[180px] group ${
                    currentChatId === chat.id 
                      ? 'bg-purple-200 text-purple-800 border border-purple-400' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{chat.title || 'Chat'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(language === 'en' ? 'Delete?' : 'Supprimer ?')) {
                        deleteChatMutation.mutate(chat.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </button>
              ))}
            </div>
          )}
          
          <p className="text-xs text-purple-600 mt-2 text-center">
            {user 
              ? (language === 'en' 
                  ? '✨ Your conversations are saved automatically' 
                  : '✨ Tes conversations sont sauvegardées automatiquement')
              : (language === 'en' 
                  ? 'Log in to save your chat history' 
                  : 'Connecte-toi pour sauvegarder ton historique')}
          </p>
        </form>
      </div>
    </div>
  );
}