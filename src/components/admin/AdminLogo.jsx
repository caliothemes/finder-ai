import React from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

export default function AdminLogo() {
  const downloadLogo = (size, format, shape) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    // Render the Logo component
    const logoDiv = document.createElement('div');
    logoDiv.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#9333ea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="90" r="40" stroke="url(#grad${size})" stroke-width="8" fill="none"/>
        <circle cx="100" cy="90" r="8" fill="url(#grad${size})"/>
        <path d="M 130 110 L 155 135" stroke="url(#grad${size})" stroke-width="10" stroke-linecap="round"/>
        <line x1="100" y1="50" x2="100" y2="20" stroke="#9333ea" stroke-width="2" opacity="0.4" />
        <circle cx="100" cy="20" r="6" fill="#9333ea" />
        <line x1="125" y1="60" x2="155" y2="30" stroke="#06b6d4" stroke-width="2" opacity="0.4" />
        <circle cx="155" cy="30" r="6" fill="#06b6d4" />
        <line x1="140" y1="90" x2="180" y2="90" stroke="#ec4899" stroke-width="2" opacity="0.4" />
        <circle cx="180" cy="90" r="6" fill="#ec4899" />
        <line x1="125" y1="115" x2="145" y2="145" stroke="#9333ea" stroke-width="2" opacity="0.4" />
        <circle cx="145" cy="145" r="6" fill="#9333ea" />
        <line x1="60" y1="90" x2="20" y2="90" stroke="#06b6d4" stroke-width="2" opacity="0.4" />
        <circle cx="20" cy="90" r="6" fill="#06b6d4" />
        <line x1="75" y1="60" x2="45" y2="30" stroke="#ec4899" stroke-width="2" opacity="0.4" />
        <circle cx="45" cy="30" r="6" fill="#ec4899" />
        <line x1="75" y1="115" x2="50" y2="145" stroke="#9333ea" stroke-width="2" opacity="0.4" />
        <circle cx="50" cy="145" r="6" fill="#9333ea" />
        <line x1="100" y1="130" x2="100" y2="160" stroke="#06b6d4" stroke-width="2" opacity="0.4" />
        <circle cx="100" cy="160" r="6" fill="#06b6d4" />
      </svg>
    `;
    container.appendChild(logoDiv);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const padding = format === 'transparent' ? 20 : 40;
    
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;

    // Background
    if (format === 'white') {
      ctx.fillStyle = 'white';
      if (shape === 'round') {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else if (format === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(0.5, '#9333ea');
      gradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = gradient;
      if (shape === 'round') {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const svgElement = logoDiv.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      
      document.body.removeChild(container);
      
      const link = document.createElement('a');
      link.download = `finder-ai-logo-${size}x${size}-${shape}-${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  const sizes = [
    { name: 'Petit', size: 128, desc: 'Favicon, icônes' },
    { name: 'Moyen', size: 256, desc: 'Réseaux sociaux' },
    { name: 'Grand', size: 512, desc: 'Header, print' },
    { name: 'Extra Large', size: 1024, desc: 'HD, branding' }
  ];

  const formats = [
    { name: 'Transparent', value: 'transparent', desc: 'Fond transparent' },
    { name: 'Fond Blanc', value: 'white', desc: 'Fond blanc' },
    { name: 'Fond Gradient', value: 'gradient', desc: 'Fond dégradé Finder AI' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Télécharger le Logo</CardTitle>
          <CardDescription>
            Téléchargez le logo Finder AI en différentes tailles et formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Preview */}
          <div className="mb-8 p-8 bg-slate-100 rounded-2xl flex justify-center items-center">
            <Logo size={200} />
          </div>

          {/* Sizes */}
          {sizes.map((sizeConfig) => (
            <div key={sizeConfig.size} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {sizeConfig.name} - {sizeConfig.size}x{sizeConfig.size}px
              </h3>
              <p className="text-sm text-slate-600 mb-3">{sizeConfig.desc}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Square versions */}
                {formats.map((format) => (
                  <Button
                    key={`${sizeConfig.size}-square-${format.value}`}
                    onClick={() => downloadLogo(sizeConfig.size, format.value, 'square')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Carré - {format.name}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                {/* Round versions */}
                {formats.map((format) => (
                  <Button
                    key={`${sizeConfig.size}-round-${format.value}`}
                    onClick={() => downloadLogo(sizeConfig.size, format.value, 'round')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Rond - {format.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Info */}
          <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm text-purple-900">
              <strong>Note:</strong> Tous les logos sont téléchargés au format PNG avec transparence alpha.
              Les versions "Fond Blanc" et "Fond Gradient" incluent un fond pour des cas d'usage spécifiques.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}