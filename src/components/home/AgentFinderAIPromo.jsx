import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bot, Sparkles, MessageCircle, Search, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function AgentFinderAIPromo() {
  const { language } = useLanguage();

  return (
    <div className="py-16 px-6 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{language === 'en' ? 'NEW - AI Assistant' : 'NOUVEAU - Assistant IA'}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {language === 'en' ? (
                <>Meet our <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Agent FinderAI</span></>
              ) : (
                <>Découvrez notre <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Agent FinderAI</span></>
              )}
            </h2>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              {language === 'en' 
                ? 'Your personal AI expert to find the perfect tool or answer all your questions about artificial intelligence.'
                : 'Ton expert IA personnel pour trouver l\'outil parfait ou répondre à toutes tes questions sur l\'intelligence artificielle.'}
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm font-medium">
                  {language === 'en' ? 'Smart Search' : 'Recherche intelligente'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-sm font-medium">
                  {language === 'en' ? 'Natural Conversation' : 'Conversation naturelle'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-sm font-medium">
                  {language === 'en' ? 'Instant Answers' : 'Réponses instantanées'}
                </span>
              </div>
            </div>

            <Link to={createPageUrl('FinderGPT')}>
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 text-lg px-8 py-6 rounded-2xl shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 group">
                <Bot className="w-6 h-6 mr-3" />
                {language === 'en' ? 'Chat with Agent FinderAI' : 'Discuter avec Agent FinderAI'}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Right - Visual */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              {/* Main bot icon */}
              <div className="w-64 h-64 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-[3rem] border border-white/20 flex items-center justify-center shadow-2xl">
                <div className="w-40 h-40 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center animate-pulse">
                  <Bot className="w-20 h-20 text-white" />
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1.5s' }}>
                <Search className="w-6 h-6 text-white" />
              </div>

              {/* Chat bubbles */}
              <div className="absolute -left-20 top-8 bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-none px-4 py-2 border border-white/20">
                <p className="text-white/90 text-sm">{language === 'en' ? 'Find me an AI for...' : 'Trouve-moi une IA pour...'}</p>
              </div>
              <div className="absolute -right-16 bottom-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl rounded-br-none px-4 py-2 border border-white/20">
                <p className="text-white/90 text-sm">{language === 'en' ? 'Here are the best tools!' : 'Voici les meilleurs outils !'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}