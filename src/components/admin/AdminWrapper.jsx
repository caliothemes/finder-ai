import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminWrapper({ children }) {
  const { theme } = useTheme();

  return (
    <div 
      className="admin-wrapper"
      style={{ 
        '--admin-bg': theme === 'dark' ? 'var(--bg-secondary)' : '#ffffff',
        '--admin-card-bg': theme === 'dark' ? 'var(--bg-card)' : '#ffffff',
        '--admin-text': theme === 'dark' ? 'var(--text-primary)' : '#0f172a',
        '--admin-text-secondary': theme === 'dark' ? 'var(--text-secondary)' : '#475569',
        '--admin-text-muted': theme === 'dark' ? 'var(--text-muted)' : '#64748b',
        '--admin-border': theme === 'dark' ? 'var(--border-color)' : '#e2e8f0',
      }}
    >
      <style>{`
        .admin-wrapper .space-y-6 > div,
        .admin-wrapper [class*="Card"],
        .admin-wrapper .rounded-xl,
        .admin-wrapper .rounded-2xl,
        .admin-wrapper .rounded-lg {
          background-color: var(--admin-card-bg) !important;
          border-color: var(--admin-border) !important;
        }
        
        .admin-wrapper h1,
        .admin-wrapper h2,
        .admin-wrapper h3,
        .admin-wrapper h4,
        .admin-wrapper [class*="CardTitle"],
        .admin-wrapper .font-semibold,
        .admin-wrapper .font-bold {
          color: var(--admin-text) !important;
        }
        
        .admin-wrapper p,
        .admin-wrapper [class*="CardDescription"],
        .admin-wrapper .text-slate-600,
        .admin-wrapper .text-slate-500,
        .admin-wrapper .text-gray-600,
        .admin-wrapper .text-gray-500 {
          color: var(--admin-text-muted) !important;
        }
        
        .admin-wrapper .text-slate-700,
        .admin-wrapper .text-slate-800,
        .admin-wrapper .text-slate-900 {
          color: var(--admin-text) !important;
        }
        
        .admin-wrapper input,
        .admin-wrapper textarea,
        .admin-wrapper select,
        .admin-wrapper [class*="SelectTrigger"],
        .admin-wrapper [class*="Input"] {
          background-color: var(--admin-card-bg) !important;
          border-color: var(--admin-border) !important;
          color: var(--admin-text) !important;
        }
        
        .admin-wrapper input::placeholder,
        .admin-wrapper textarea::placeholder {
          color: var(--admin-text-muted) !important;
        }
        
        .admin-wrapper .border-slate-200,
        .admin-wrapper .border-slate-100,
        .admin-wrapper .border-gray-200 {
          border-color: var(--admin-border) !important;
        }
        
        .admin-wrapper .bg-slate-50,
        .admin-wrapper .bg-gray-50,
        .admin-wrapper .bg-white {
          background-color: var(--admin-card-bg) !important;
        }
        
        .admin-wrapper .hover\\:bg-slate-50:hover {
          background-color: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc'} !important;
        }
        
        /* Keep gradient backgrounds */
        .admin-wrapper [class*="bg-gradient"],
        .admin-wrapper [style*="background: linear-gradient"],
        .admin-wrapper [style*="background-color: rgb"] {
          /* Don't override gradient backgrounds */
        }
        
        /* Tabs styling */
        .admin-wrapper [class*="TabsList"] {
          background-color: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#f1f5f9'} !important;
        }
        
        .admin-wrapper [class*="TabsTrigger"][data-state="active"] {
          background-color: var(--admin-card-bg) !important;
          color: var(--admin-text) !important;
        }
        
        /* Modal backgrounds */
        .admin-wrapper .fixed.inset-0 .bg-white,
        .admin-wrapper .fixed.inset-0 [class*="bg-white"] {
          background-color: var(--admin-card-bg) !important;
        }
      `}</style>
      {children}
    </div>
  );
}