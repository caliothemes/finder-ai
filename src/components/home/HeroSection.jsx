import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

export default function HeroSection({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [floatingElements, setFloatingElements] = useState([]);
  const navigate = useNavigate();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl(`Explore?search=${encodeURIComponent(searchQuery)}`));
    }
  };

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
          <span>Découvrez l'univers de l'Intelligence Artificielle</span>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
            Finder AI
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Le répertoire ultime des outils d'IA
        </p>

        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Logo size={180} animated={true} />
        </div>
        
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
          Explorez, comparez et découvrez les meilleurs services d'intelligence artificielle pour tous vos besoins
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
              <Search className="absolute left-6 w-6 h-6 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher un outil IA... (ex: génération d'images, chatbot, vidéo)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-40 py-7 bg-transparent border-0 text-white placeholder:text-slate-400 text-lg focus-visible:ring-0"
              />
              <Button 
                type="submit"
                className="absolute right-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-5 rounded-xl font-medium transition-all shadow-lg hover:shadow-purple-500/50"
              >
                Rechercher
              </Button>
            </div>
          </div>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div className="text-3xl font-bold text-white">500+</div>
            </div>
            <div className="text-sm text-slate-400">Outils IA</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <div className="text-3xl font-bold text-white">50+</div>
            </div>
            <div className="text-sm text-slate-400">Catégories</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all col-span-2 md:col-span-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div className="text-3xl font-bold text-white">10K+</div>
            </div>
            <div className="text-sm text-slate-400">Utilisateurs</div>
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