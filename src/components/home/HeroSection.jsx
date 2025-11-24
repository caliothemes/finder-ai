import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { useLanguage } from '@/components/LanguageProvider';
import SmartSearchBar from '@/components/home/SmartSearchBar';

export default function HeroSection({ onSearch }) {
  const [floatingElements, setFloatingElements] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const elements = Array(15).fill(0).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full blur-sm"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              animation: `float ${el.duration}s infinite ease-in-out ${el.delay}s`
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        {/* Rocket image bottom right */}
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691d22f0734aabcae8c2dd9d/304f1aa01_fusee.png"
          alt="Rocket"
          className="absolute bottom-0 right-0 w-96 md:w-[600px] lg:w-[700px] opacity-20 pointer-events-none"
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>{t('home_hero_badge')}</span>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
            {t('home_hero_title')}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('home_hero_subtitle')}
        </p>

        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Logo size={180} animated={true} />
        </div>
        
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
          {t('home_hero_description')}
        </p>

        {/* Smart Search bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <SmartSearchBar onSearch={(query) => navigate(createPageUrl(`Explore?search=${encodeURIComponent(query)}`))} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto px-6 pb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div className="text-3xl font-bold text-white">500+</div>
            </div>
            <div className="text-sm text-slate-400">{t('home_hero_tools')}</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <div className="text-3xl font-bold text-white">50+</div>
            </div>
            <div className="text-sm text-slate-400">{t('home_hero_categories')}</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all col-span-2 md:col-span-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div className="text-3xl font-bold text-white">10K+</div>
            </div>
            <div className="text-sm text-slate-400">{t('home_hero_users')}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-float {
          animation: logoFloat 6s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}