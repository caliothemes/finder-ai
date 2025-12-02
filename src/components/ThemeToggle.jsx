import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      style={{
        backgroundColor: theme === 'dark' ? '#6366f1' : '#e2e8f0'
      }}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun className={`w-3.5 h-3.5 transition-opacity duration-200 ${theme === 'light' ? 'opacity-0' : 'opacity-50 text-yellow-300'}`} />
        <Moon className={`w-3.5 h-3.5 transition-opacity duration-200 ${theme === 'dark' ? 'opacity-0' : 'opacity-50 text-slate-500'}`} />
      </div>
      
      {/* Thumb */}
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${
          theme === 'dark' ? 'left-[calc(100%-26px)]' : 'left-0.5'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  );
}