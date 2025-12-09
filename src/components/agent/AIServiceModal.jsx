import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, CheckCircle, Image as ImageIcon, Wand2, Languages, FileText, Code, PenTool, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import NoBGModal from './NoBGModal';

export default function AIServiceModal({ service, isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [language2, setLanguage2] = useState('');
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!service) return null;

  // Service spécial pour noBG.me
  if (service.id === 'remove-bg') {
    return <NoBGModal isOpen={isOpen} onClose={onClose} />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success(language === 'fr' ? 'Copié !' : 'Copied!');
  };

  const handleProcess = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    setImageUrl('');

    try {
      let result;
      
      switch(service.id) {
        case 'grammar':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Corrige toutes les fautes d'orthographe et de grammaire dans ce texte. Retourne UNIQUEMENT le texte corrigé sans explications:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'translate':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Traduis ce texte en ${targetLang === 'en' ? 'anglais' : targetLang === 'fr' ? 'français' : targetLang === 'es' ? 'espagnol' : targetLang === 'de' ? 'allemand' : 'italien'}. Retourne UNIQUEMENT la traduction:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'summarize':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Résume ce texte de manière concise et claire:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'paraphrase':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Reformule ce texte en gardant le même sens mais avec d'autres mots:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'write':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Rédige un texte professionnel sur ce sujet: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'generate':
          const imgResult = await base44.integrations.Core.GenerateImage({
            prompt: input
          });
          setImageUrl(imgResult.url);
          break;

        case 'code-gen':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Génère du code ${language2 || 'JavaScript'} pour: ${input}\n\nRéponds UNIQUEMENT avec le code, sans explications.`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'debug':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyse ce code et trouve les bugs. Explique les problèmes et propose des corrections:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'explain':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Explique ce code de manière claire et détaillée:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'optimize':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Optimise ce code pour améliorer les performances et la lisibilité:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'copywriting':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Rédige un texte de vente persuasif pour: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'seo':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Génère des recommandations SEO pour optimiser ce contenu:\n\n${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'ads':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Crée 3 variantes de publicité accrocheuse pour: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'social':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Crée un post engageant pour les réseaux sociaux sur: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'hashtags':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Génère 10 hashtags pertinents pour: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'business-plan':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Crée un résumé de business plan pour: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'contract':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Génère un modèle de contrat pour: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        case 'cgv':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Génère des CGV/CGU pour: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
          break;

        default:
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `${service.description[language]}. Requête: ${input}`,
            add_context_from_internet: false
          });
          setOutput(result);
      }
    } catch (error) {
      toast.error(language === 'fr' ? 'Une erreur est survenue' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceInterface = () => {
    // Services de génération d'images
    if (service.id === 'generate') {
      return (
        <>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'fr' ? 'Décrivez l\'image que vous souhaitez générer...' : 'Describe the image you want to generate...'}
            className="min-h-[100px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <Button 
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            {language === 'fr' ? 'Générer l\'image' : 'Generate image'}
          </Button>
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
              <img src={imageUrl} alt="Generated" className="w-full" />
            </div>
          )}
        </>
      );
    }

    // Services de traduction
    if (service.id === 'translate') {
      return (
        <>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="en">{language === 'fr' ? 'Anglais' : 'English'}</option>
            <option value="fr">{language === 'fr' ? 'Français' : 'French'}</option>
            <option value="es">{language === 'fr' ? 'Espagnol' : 'Spanish'}</option>
            <option value="de">{language === 'fr' ? 'Allemand' : 'German'}</option>
            <option value="it">{language === 'fr' ? 'Italien' : 'Italian'}</option>
          </select>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'fr' ? 'Texte à traduire...' : 'Text to translate...'}
            className="min-h-[120px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <Button 
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
            {language === 'fr' ? 'Traduire' : 'Translate'}
          </Button>
          {output && (
            <div className="rounded-xl p-4 border relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{output}</p>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      );
    }

    // Services de code
    if (['code-gen', 'debug', 'explain', 'optimize'].includes(service.id)) {
      return (
        <>
          {service.id === 'code-gen' && (
            <Input
              value={language2}
              onChange={(e) => setLanguage2(e.target.value)}
              placeholder="Langage (JavaScript, Python...)"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={service.id === 'code-gen' 
              ? (language === 'fr' ? 'Décrivez ce que le code doit faire...' : 'Describe what the code should do...')
              : (language === 'fr' ? 'Collez votre code ici...' : 'Paste your code here...')
            }
            className="min-h-[150px] font-mono text-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <Button 
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
            {language === 'fr' ? 'Lancer le service' : 'Run service'}
          </Button>
          {output && (
            <div className="rounded-xl p-4 border relative font-mono text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <pre className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{output}</pre>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      );
    }

    // Services de texte standard
    return (
      <>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === 'fr' ? 'Votre texte ici...' : 'Your text here...'}
          className="min-h-[150px]"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
        <Button 
          onClick={handleProcess}
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {language === 'fr' ? 'Lancer le service' : 'Run service'}
        </Button>
        {output && (
          <div className="rounded-xl p-4 border relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{output}</p>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {service.name[language]}
          </DialogTitle>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {service.description[language]}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {renderServiceInterface()}
        </div>
      </DialogContent>
    </Dialog>
  );
}