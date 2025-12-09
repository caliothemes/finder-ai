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
  const [user, setUser] = useState(null);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Exemples de prompts par service
  const getExamplePrompts = () => {
    const examples = {
      'generate': {
        fr: ['Un chat astronaute dans l\'espace', 'Paysage futuriste avec des gratte-ciels', 'Portrait d\'une femme style art déco'],
        en: ['An astronaut cat in space', 'Futuristic cityscape with skyscrapers', 'Woman portrait in art deco style']
      },
      'create-logo': {
        fr: ['TechVision', 'Green Earth Solutions', 'Pixel Studio'],
        en: ['TechVision', 'Green Earth Solutions', 'Pixel Studio']
      },
      'create-story': {
        fr: ['Soldes -50% ce weekend', 'Citation motivante du jour', 'Nouveau produit disponible'],
        en: ['50% off this weekend', 'Motivational quote of the day', 'New product available']
      },
      'create-thumbnail': {
        fr: ['Comment gagner de l\'argent en ligne', 'Top 10 des astuces iPhone', 'Recette de gâteau au chocolat'],
        en: ['How to make money online', 'Top 10 iPhone tips', 'Chocolate cake recipe']
      },
      'create-poster': {
        fr: ['Concert de jazz le 15 mars', 'Festival d\'été 2025', 'Soirée Halloween'],
        en: ['Jazz concert on March 15', 'Summer festival 2025', 'Halloween party']
      },
      'product-photo': {
        fr: ['Bouteille de parfum luxe', 'Montre connectée noire', 'Casque audio sans fil'],
        en: ['Luxury perfume bottle', 'Black smartwatch', 'Wireless headphones']
      },
      'grammar': {
        fr: ['Je suis allé au magasin hier et j\'ai acheter des pommes', 'Il faut que je vien te voir demain', 'C\'est article est très intéressant'],
        en: ['I go to the store yesterday and buy apples', 'He don\'t knows the answer', 'Their going to the beach']
      },
      'translate': {
        fr: ['Bonjour, comment allez-vous ?', 'Je voudrais réserver une table', 'Où se trouve la gare ?'],
        en: ['Hello, how are you?', 'I would like to book a table', 'Where is the train station?']
      },
      'summarize': {
        fr: ['[Collez un long article ici]', '[Résumez ce document]', '[Votre texte long]'],
        en: ['[Paste a long article here]', '[Summarize this document]', '[Your long text]']
      },
      'paraphrase': {
        fr: ['L\'intelligence artificielle révolutionne notre société', 'Ce projet nécessite une attention particulière', 'Les résultats sont très encourageants'],
        en: ['Artificial intelligence is transforming society', 'This project requires special attention', 'The results are very encouraging']
      },
      'write': {
        fr: ['Article sur les bienfaits du sport', 'Email de relance client', 'Description de produit e-commerce'],
        en: ['Article about sports benefits', 'Customer follow-up email', 'E-commerce product description']
      },
      'code-gen': {
        fr: ['Fonction de tri de tableau', 'API REST avec authentification', 'Formulaire de contact avec validation'],
        en: ['Array sorting function', 'REST API with authentication', 'Contact form with validation']
      },
      'debug': {
        fr: ['[Collez votre code avec bug]', 'function add(a, b) { return a - b }', '[Code à debugger]'],
        en: ['[Paste your buggy code]', 'function add(a, b) { return a - b }', '[Code to debug]']
      },
      'explain': {
        fr: ['[Code complexe à expliquer]', 'const result = arr.map(x => x * 2)', '[Algorithme à comprendre]'],
        en: ['[Complex code to explain]', 'const result = arr.map(x => x * 2)', '[Algorithm to understand]']
      },
      'optimize': {
        fr: ['[Code lent à optimiser]', 'for loop imbriqués', '[Code redondant]'],
        en: ['[Slow code to optimize]', 'Nested for loops', '[Redundant code]']
      },
      'copywriting': {
        fr: ['Formation en ligne de marketing digital', 'Logiciel de gestion de projet', 'Service de coaching personnel'],
        en: ['Online digital marketing course', 'Project management software', 'Personal coaching service']
      },
      'seo': {
        fr: ['[Votre contenu web]', 'Article de blog sur le fitness', '[Page produit e-commerce]'],
        en: ['[Your web content]', 'Fitness blog article', '[E-commerce product page]']
      },
      'ads': {
        fr: ['Nouveau smartphone innovant', 'Formation Excel en ligne', 'Restaurant italien authentique'],
        en: ['Innovative new smartphone', 'Online Excel training', 'Authentic Italian restaurant']
      },
      'social': {
        fr: ['Lancement de notre nouveau produit', 'Tips pour être productif', 'Partage d\'expérience client'],
        en: ['Launching our new product', 'Productivity tips', 'Customer success story']
      },
      'hashtags': {
        fr: ['Post sur le fitness et la motivation', 'Recette de cuisine healthy', 'Voyage en Asie'],
        en: ['Fitness motivation post', 'Healthy cooking recipe', 'Asia travel']
      },
      'business-plan': {
        fr: ['Application de livraison de repas', 'Plateforme de freelancing', 'Boutique en ligne de vêtements'],
        en: ['Meal delivery app', 'Freelancing platform', 'Online clothing store']
      },
      'contract': {
        fr: ['Contrat de prestation de services', 'Accord de confidentialité', 'Contrat de location'],
        en: ['Service agreement', 'Non-disclosure agreement', 'Rental contract']
      },
      'cgv': {
        fr: ['Boutique en ligne de produits artisanaux', 'Plateforme SaaS B2B', 'Service de consulting'],
        en: ['Online artisan products store', 'B2B SaaS platform', 'Consulting service']
      },
      'find-lawyer': {
        fr: ['Paris - Droit du travail', 'Lyon - Droit immobilier', 'Marseille - Droit de la famille'],
        en: ['New York - Labor law', 'Los Angeles - Real estate law', 'Chicago - Family law']
      },
      'legal-advice': {
        fr: ['Quels sont mes droits en cas de licenciement ?', 'Comment protéger mon idée de startup ?', 'Que faire en cas de litige avec un voisin ?'],
        en: ['What are my rights if I\'m fired?', 'How to protect my startup idea?', 'What to do in case of dispute with neighbor?']
      }
    };
    return examples[service.id] || { fr: [], en: [] };
  };

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

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

    // Check user credits
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const freeGensUsed = user.free_generations_used || 0;
    const credits = user.credits || 0;

    if (freeGensUsed >= 10 && credits <= 0) {
      toast.error(language === 'fr' 
        ? 'Vous n\'avez plus de crédits. Achetez-en sur la page Tarifs.' 
        : 'No credits remaining. Buy more on Pricing page.');
      return;
    }

    setLoading(true);
    setOutput('');
    setImageUrl('');

    try {
      let result;
      let resultUrl = '';
      
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
          resultUrl = imgResult.url;
          break;

        case 'create-logo':
          const logoResult = await base44.integrations.Core.GenerateImage({
            prompt: `Professional logo design for a company called "${input}". Modern, clean, minimalist style. Vector-like, simple shapes, memorable. High quality logo on white background.`
          });
          setImageUrl(logoResult.url);
          resultUrl = logoResult.url;
          break;

        case 'create-story':
          const storyResult = await base44.integrations.Core.GenerateImage({
            prompt: `Instagram story design about: ${input}. Vertical format 9:16, vibrant colors, modern aesthetic, eye-catching, social media ready. High quality, professional design.`
          });
          setImageUrl(storyResult.url);
          resultUrl = storyResult.url;
          break;

        case 'create-thumbnail':
          const thumbResult = await base44.integrations.Core.GenerateImage({
            prompt: `YouTube thumbnail for video about: ${input}. Bold text, vibrant colors, high contrast, attention-grabbing, 16:9 format. Professional quality, click-worthy design.`
          });
          setImageUrl(thumbResult.url);
          resultUrl = thumbResult.url;
          break;

        case 'create-poster':
          const posterResult = await base44.integrations.Core.GenerateImage({
            prompt: `Event poster design for: ${input}. Eye-catching, professional, modern layout, vibrant colors, clear typography. High quality poster design.`
          });
          setImageUrl(posterResult.url);
          resultUrl = posterResult.url;
          break;

        case 'product-photo':
          const productResult = await base44.integrations.Core.GenerateImage({
            prompt: `Professional product photography of: ${input}. Clean white background, studio lighting, high quality, commercial photography style, detailed and sharp.`
          });
          setImageUrl(productResult.url);
          resultUrl = productResult.url;
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

        case 'find-lawyer':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Recherche des avocats spécialisés selon ces critères: ${input}. 
            Fournis une liste de 3-5 avocats avec:
            - Nom du cabinet ou de l'avocat
            - Spécialité juridique
            - Localisation
            - Coordonnées (téléphone, email, site web si disponibles)
            - Bref résumé de leurs compétences
            
            Format la réponse de manière claire et structurée.`,
            add_context_from_internet: true
          });
          setOutput(result);
          break;

        case 'legal-advice':
          result = await base44.integrations.Core.InvokeLLM({
            prompt: `Question juridique: ${input}
            
            Fournis une réponse claire et détaillée en expliquant:
            - Les aspects juridiques pertinents
            - Les droits et obligations
            - Les démarches possibles
            - IMPORTANT: Précise que ceci est une information générale et qu'il est recommandé de consulter un avocat pour un cas spécifique.`,
            add_context_from_internet: true
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

      // Save to history and deduct credits
      const creditsUsed = freeGensUsed >= 10 ? 1 : 0;
      
      await base44.entities.AIToolGeneration.create({
        user_email: user.email,
        service_id: service.id,
        service_name: service.name[language],
        input: input,
        output: result || '',
        output_url: resultUrl,
        credits_used: creditsUsed
      });

      // Update user credits
      if (freeGensUsed < 10) {
        await base44.auth.updateMe({ free_generations_used: freeGensUsed + 1 });
      } else {
        await base44.auth.updateMe({ credits: credits - 1 });
      }

      toast.success(language === 'fr' ? 'Génération réussie !' : 'Generation successful!');
    } catch (error) {
      toast.error(language === 'fr' ? 'Une erreur est survenue' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceInterface = () => {
    const examplePrompts = getExamplePrompts();
    const examples = examplePrompts[language] || [];

    // Services de génération d'images (tous les services image)
    if (['generate', 'create-logo', 'create-story', 'create-thumbnail', 'create-poster', 'product-photo'].includes(service.id)) {
      let placeholder = language === 'fr' ? 'Décrivez ce que vous voulez créer...' : 'Describe what you want to create...';
      let buttonText = language === 'fr' ? 'Générer' : 'Generate';
      
      if (service.id === 'create-logo') {
        placeholder = language === 'fr' ? 'Nom de votre marque ou entreprise...' : 'Your brand or company name...';
        buttonText = language === 'fr' ? 'Créer le logo' : 'Create logo';
      } else if (service.id === 'create-story') {
        placeholder = language === 'fr' ? 'Sujet de votre story (ex: promotion, citation inspirante...)' : 'Story topic (e.g: promotion, inspiring quote...)';
        buttonText = language === 'fr' ? 'Créer la story' : 'Create story';
      } else if (service.id === 'create-thumbnail') {
        placeholder = language === 'fr' ? 'Sujet de votre vidéo YouTube...' : 'Your YouTube video topic...';
        buttonText = language === 'fr' ? 'Créer la miniature' : 'Create thumbnail';
      } else if (service.id === 'create-poster') {
        placeholder = language === 'fr' ? 'Décrivez votre événement ou affiche...' : 'Describe your event or poster...';
        buttonText = language === 'fr' ? 'Créer l\'affiche' : 'Create poster';
      } else if (service.id === 'product-photo') {
        placeholder = language === 'fr' ? 'Décrivez votre produit...' : 'Describe your product...';
        buttonText = language === 'fr' ? 'Générer la photo' : 'Generate photo';
      }

      return (
        <>
          {examples.length > 0 && !input && (
            <div className="mb-3">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                💡 {language === 'fr' ? 'Essayez ces exemples :' : 'Try these examples:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="px-3 py-1.5 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <Button 
            onClick={handleProcess}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            {buttonText}
          </Button>
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
                {language === 'fr' ? '🎨 Génération en cours... (5-10 secondes)' : '🎨 Generating... (5-10 seconds)'}
              </p>
            </div>
          )}
          {imageUrl && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                <img src={imageUrl} alt="Generated" className="w-full" />
              </div>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = 'generated-image.png';
                  link.click();
                }}
                variant="outline"
                className="w-full"
              >
                {language === 'fr' ? '⬇️ Télécharger l\'image' : '⬇️ Download image'}
              </Button>
            </div>
          )}
        </>
      );
    }

    // Services de traduction
    if (service.id === 'translate') {
      return (
        <>
          {examples.length > 0 && !input && (
            <div className="mb-3">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                💡 {language === 'fr' ? 'Essayez ces exemples :' : 'Try these examples:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="px-3 py-1.5 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          {examples.length > 0 && !input && (
            <div className="mb-3">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                💡 {language === 'fr' ? 'Essayez ces exemples :' : 'Try these examples:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="px-3 py-1.5 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
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

    // Service de recherche d'avocats
    if (service.id === 'find-lawyer') {
      return (
        <>
          {examples.length > 0 && !input && (
            <div className="mb-3">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                💡 {language === 'fr' ? 'Essayez ces exemples :' : 'Try these examples:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const parts = example.split(' - ');
                      setInput(parts[0]);
                      if (parts[1]) setLanguage2(parts[1]);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'fr' ? 'Ville ou région...' : 'City or region...'}
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            <Input
              value={language2}
              onChange={(e) => setLanguage2(e.target.value)}
              placeholder={language === 'fr' ? 'Spécialité (droit du travail, immobilier, famille...)' : 'Specialty (labor law, real estate, family...)'}
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <Button 
            onClick={() => {
              const query = `${input} ${language2}`;
              setInput(query);
              handleProcess();
            }}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            {language === 'fr' ? '🔍 Rechercher des avocats' : '🔍 Search lawyers'}
          </Button>
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
                {language === 'fr' ? '⚖️ Recherche en cours sur le web...' : '⚖️ Searching the web...'}
              </p>
            </div>
          )}
          {output && (
            <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{output}</p>
            </div>
          )}
        </>
      );
    }

    // Services de texte standard
    return (
      <>
        {examples.length > 0 && !input && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              💡 {language === 'fr' ? 'Essayez ces exemples :' : 'Try these examples:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example)}
                  className="px-3 py-1.5 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
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