import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Bot, User, Sparkles, Loader2, ExternalLink, Star, Plus, MessageSquare, Trash2, Mic, MicOff, Zap, Heart, Clock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import ReactMarkdown from 'react-markdown';
import AIToolsSidebar from '@/components/agent/AIToolsSidebar';

export default function FinderGPT() {
  // TOUS LES HOOKS EN PREMIER - AVANT TOUTE LOGIQUE
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [toolsSidebarExpanded, setToolsSidebarExpanded] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const lastAssistantRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

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
      } finally {
        setAuthChecked(true);
      }
    };
    loadUser();
  }, []);

  const scrollToLastAssistant = () => {
    if (lastAssistantRef.current && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const element = lastAssistantRef.current;
      const elementTop = element.offsetTop - container.offsetTop;
      container.scrollTo({ top: elementTop - 20, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Scroll to last assistant message when messages change
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      setTimeout(() => scrollToLastAssistant(), 150);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const context = buildContext();
    
    const systemPrompt = `Tu es Agent FinderAI, l'assistant IA EXCLUSIF du site FinderAI - le répertoire ultime des outils d'intelligence artificielle.

🎯 MISSION PRINCIPALE: Recommander des outils IA de la base FinderAI pour TOUTES les demandes créatives ou productives.

📊 BASE DE DONNÉES FINDERAI (${context.services.length} outils) - CHERCHE ICI EN PRIORITÉ:
${JSON.stringify(context.services, null, 0)}

📰 ACTUALITÉS IA FINDERAI:
${JSON.stringify(context.news, null, 0)}

📂 CATÉGORIES: ${context.categories.join(', ')}

🔗 PAGES DU SITE:
- Explorer: [Explorer](Explore)
- Catégories: [Catégories](Categories)
- Actualités: [Actualités](AINews)
- Soumettre: [Proposer une IA](SubmitAI)

⚠️ INSTRUCTIONS CRITIQUES:

1. 🔍 POUR TOUTE DEMANDE "COMMENT FAIRE X" ou "CRÉER X":
   - CHERCHE TOUJOURS dans la base ci-dessus des outils qui peuvent aider
   - Analyse les descriptions, taglines, features et tags de chaque outil
   - Recommande 2-5 outils pertinents avec leurs liens
   - Exemples: "créer des stories" → cherche outils vidéo/design/social media
   - "générer des images" → cherche outils génération d'images
   - "écrire du contenu" → cherche outils rédaction/copywriting

2. QUAND ON DEMANDE UN OUTIL SPÉCIFIQUE PAR NOM:
   - Cherche dans la base ci-dessus (nom similaire OK)
   - Si trouvé: donne TOUTES les infos + lien [**Nom**](AIDetail?slug=SLUG)
   - Si pas dans la base: "Cet outil n'est pas encore référencé sur FinderAI. Tu peux le [proposer ici](SubmitAI) !" + suggère des alternatives similaires

3. FORMAT DES RECOMMANDATIONS:
   Pour chaque outil recommandé, donne:
   - **Nom** avec lien: [**NomOutil**](AIDetail?slug=SLUG)
   - Courte description de ce qu'il fait
   - Pourquoi il est pertinent pour la demande
   - Prix (gratuit/freemium/payant)

4. FORMAT DES LIENS:
   - Outil: [**NomOutil**](AIDetail?slug=SLUG)
   - Actualité: [Titre](AINewsDetail?slug=SLUG)

5. LANGUE: Réponds en ${language === 'en' ? 'anglais' : 'français'}

6. STYLE: Enthousiaste, emojis (🤖🚀✨💡⭐🎬🎨✍️), **gras** pour les noms, listes structurées

7. SI VRAIMENT AUCUN OUTIL NE CORRESPOND:
   - Dis que tu n'as pas trouvé d'outil spécifique mais suggère d'explorer les catégories proches
   - Propose de soumettre un nouvel outil si l'utilisateur en connaît un

8. TOUJOURS terminer par un lien FinderAI pertinent ou une invitation à explorer

9. ⚠️ LIENS EXTERNES INTERDITS:
   - Ne JAMAIS utiliser finderai.com ou tout autre domaine externe
   - Le SEUL site officiel est finder-ai.app
   - Utilise UNIQUEMENT les liens internes comme [Explorer](Explore), [Catégories](Categories), etc.
   - Pour les outils: [**Nom**](AIDetail?slug=SLUG) - PAS de liens externes`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nQuestion de l'utilisateur: ${userMessage}`,
        add_context_from_internet: false,
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

  // Handle interaction for non-logged users
  const handleInteraction = () => {
    if (!user) {
      setShowLoginPrompt(true);
    }
  };

  // Show loading during auth check
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // For non-authenticated users - show the page with overlay on interaction
  if (!user && !showLoginPrompt) {
    return (
      <>
        <AIToolsSidebar onExpandChange={setToolsSidebarExpanded} />
        
        <div 
          className="h-[calc(100vh-80px)] flex flex-col overflow-hidden transition-all duration-300" 
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            marginLeft: toolsSidebarExpanded ? '256px' : '64px',
            width: toolsSidebarExpanded ? 'calc(100% - 256px)' : 'calc(100% - 64px)'
          }}
        >
          {/* Header */}
          <div className="px-3 md:px-6 py-2 md:py-4 flex-shrink-0" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold flex items-center gap-1 md:gap-2" style={{ color: 'var(--text-primary)' }}>
                  Agent FinderAI
                  <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-yellow-500" />
                </h1>
                <p className="text-[10px] md:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                  {t('agent_subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Demo content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-4 md:py-12 px-2">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-6 shadow-lg">
                  <Bot className="w-7 h-7 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--text-primary)' }}>
                  {t('agent_welcome')}
                </h2>
                <p className="text-xs md:text-base mb-4 md:mb-8 max-w-md mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('agent_description')}
                </p>
                
                {/* Example suggestions - clickable but triggers login */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 max-w-2xl mx-auto">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={handleInteraction}
                      className="text-left px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl transition-all text-xs md:text-sm hover:border-purple-300"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Disabled Input - triggers login on click */}
          <div className="px-4 md:px-6 py-2 md:py-4 flex-shrink-0 w-full" style={{ background: theme === 'dark' ? 'linear-gradient(to right, rgba(88, 28, 135, 0.15), rgba(157, 23, 77, 0.15), rgba(88, 28, 135, 0.15))' : 'linear-gradient(to right, rgba(250, 245, 255, 1), rgba(252, 231, 243, 1), rgba(250, 245, 255, 1))', borderTop: '1px solid var(--border-color)' }}>
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex gap-2 w-full" onClick={handleInteraction}>
                <div className="flex-1 relative min-w-0 cursor-pointer">
                  <div className="w-full min-h-[40px] md:min-h-[50px] rounded-lg border px-3 py-2 flex items-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(192, 132, 252, 0.5)', color: 'var(--text-muted)', opacity: 0.6 }}>
                    <span className="text-sm md:text-base">{t('agent_placeholder')}</span>
                  </div>
                </div>
                <Button 
                  type="button"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-2.5 md:px-6 h-[40px] md:h-auto flex-shrink-0"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
              <p className="text-[9px] md:text-xs text-purple-500 mt-1 md:mt-2 text-center">
                {t('agent_login_prompt')}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show full login modal when trying to interact
  if (!user && showLoginPrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <div className="max-w-md w-full text-center p-8 rounded-3xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Bot className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Créez votre compte gratuit' : 'Create your free account'}
          </h2>
          
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {language === 'fr' 
              ? 'Pour utiliser Agent FinderAI et accéder aux services IA, créez votre compte gratuit en 20 secondes !'
              : 'To use Agent FinderAI and access AI services, create your free account in 20 seconds!'}
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 mb-8 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'Chat avec l\'agent IA' : 'Chat with AI agent'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'Services IA gratuits' : 'Free AI services'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {language === 'fr' ? 'Sauvegarde des favoris' : 'Save favorites'}
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg rounded-xl shadow-lg mb-3"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Créer mon compte gratuit' : 'Create my free account'}
          </Button>

          <button
            onClick={() => setShowLoginPrompt(false)}
            className="text-sm hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'fr' ? 'Retour' : 'Back'}
          </button>
          
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            ✨ 100% gratuit • Pas de carte bancaire • Accès en 20 secondes
          </p>
        </div>
      </div>
    );
  }

  // Check for prompt in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptFromUrl = urlParams.get('prompt');
    if (promptFromUrl && user) {
      setInput(promptFromUrl);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  return (
    <>
      {/* AI Tools Sidebar */}
      <AIToolsSidebar 
        onExpandChange={setToolsSidebarExpanded}
      />

      <div 
        className="h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] flex flex-col overflow-hidden transition-all duration-300" 
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          marginLeft: toolsSidebarExpanded ? '256px' : '64px',
          width: toolsSidebarExpanded ? 'calc(100% - 256px)' : 'calc(100% - 64px)'
        }}
      >
        {/* Header */}
        <div className="px-3 md:px-6 py-2 md:py-4 flex-shrink-0" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 md:w-7 md:h-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-xl font-bold flex items-center gap-1 md:gap-2" style={{ color: 'var(--text-primary)' }}>
              Agent FinderAI
              <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-yellow-500" />
            </h1>
            <p className="text-[10px] md:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {t('agent_subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-6">
        <div className="max-w-4xl mx-auto space-y-3 md:space-y-6">
            {messages.length === 0 ? (
            <div className="text-center py-4 md:py-12 px-2">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-6 shadow-lg">
                <Bot className="w-7 h-7 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--text-primary)' }}>
                {t('agent_welcome')}
              </h2>
              <p className="text-xs md:text-base mb-4 md:mb-8 max-w-md mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
                {t('agent_description')}
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 max-w-2xl mx-auto">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-left px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl transition-all text-xs md:text-sm hover:border-purple-300"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
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
                ref={message.role === 'assistant' && i === messages.length - 1 ? lastAssistantRef : null}
                className={`flex gap-1.5 md:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md md:rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] md:max-w-[80%] rounded-lg md:rounded-2xl px-2.5 md:px-5 py-2 md:py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white text-sm'
                      : ''
                  }`}
                  style={message.role !== 'user' ? { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' } : {}}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="prose prose-sm max-w-none prose-slate text-xs md:text-base [&>p]:mb-1.5 [&>ul]:mb-1.5 [&>ul]:space-y-0.5"
                      components={{
                        a: ({ href, children }) => {
                          // Liste des pages internes
                          const internalPages = ['Explore', 'Categories', 'AINews', 'SubmitAI', 'Home', 'Favorites', 'ProAccount', 'Profile', 'FinderGPT'];
                          
                          // Check if it's an internal page link or detail page
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
                          
                          // Check for simple internal page names
                          if (internalPages.includes(href)) {
                            return (
                              <Link 
                                to={createPageUrl(href)} 
                                className="text-purple-600 hover:text-purple-700 font-medium"
                              >
                                {children}
                              </Link>
                            );
                          }
                          
                          // External links
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                              {children}
                            </a>
                          );
                        },
                        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1.5">{children}</ul>,
                        li: ({ children }) => <li className="text-xs md:text-base">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-purple-700">{children}</strong>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-6 h-6 md:w-10 md:h-10 bg-slate-200 rounded-md md:rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-1.5 md:gap-4 justify-start">
              <div className="w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
              </div>
              <div className="rounded-lg md:rounded-2xl px-2.5 md:px-5 py-2 md:py-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                  {t('agent_thinking')}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 py-2 md:py-4 flex-shrink-0 w-full" style={{ background: theme === 'dark' ? 'linear-gradient(to right, rgba(88, 28, 135, 0.15), rgba(157, 23, 77, 0.15), rgba(88, 28, 135, 0.15))' : 'linear-gradient(to right, rgba(250, 245, 255, 1), rgba(252, 231, 243, 1), rgba(250, 245, 255, 1))', borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full">
          <div className="flex gap-2 w-full">
            <div className="flex-1 relative min-w-0">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('agent_placeholder')}
                className="w-full resize-none min-h-[40px] md:min-h-[50px] max-h-[80px] md:max-h-[150px] focus:border-purple-400 pr-8 md:pr-12 text-sm md:text-base py-2"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(192, 132, 252, 0.5)', color: 'var(--text-primary)' }}
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
                className={`absolute right-1 md:right-3 top-1/2 -translate-y-1/2 p-1 md:p-2 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'hover:bg-purple-100 text-purple-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-2.5 md:px-6 h-[40px] md:h-auto flex-shrink-0"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
          
          {/* Chat History - Horizontal under prompt */}
          {user && chatHistory.length > 0 && (
          <div className="mt-2 md:mt-4 flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
          <button
            onClick={startNewChat}
            className="flex-shrink-0 px-2 md:px-3 py-1 md:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-[10px] md:text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            {t('agent_new_chat')}
          </button>
          {chatHistory.slice(0, 3).map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat)}
              className={`flex-shrink-0 px-2 md:px-3 py-1 md:py-2 rounded-lg text-[10px] md:text-sm font-medium transition-all flex items-center gap-1 md:gap-2 max-w-[80px] md:max-w-[180px] group ${
                currentChatId === chat.id 
                  ? 'bg-purple-200 text-purple-800 border border-purple-400' 
                  : 'hover:border-purple-300 hover:bg-purple-500/10'
              }`}
              style={currentChatId !== chat.id ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' } : {}}
            >
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">{chat.title || 'Chat'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(language === 'en' ? 'Delete?' : 'Supprimer ?')) {
                        deleteChatMutation.mutate(chat.id);
                      }
                    }}
                    className="hidden md:block opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </button>
              ))}
            </div>
          )}
          
          <p className="text-[9px] md:text-xs text-purple-500 mt-1 md:mt-2 text-center">
            {user ? t('agent_saved') : t('agent_login_prompt')}
          </p>
        </form>
      </div>
      </div>
    </>
  );
}