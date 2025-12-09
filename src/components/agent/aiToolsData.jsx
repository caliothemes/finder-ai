// Configuration des catégories et services IA
export const aiToolsCategories = [
  {
    id: 'image',
    slug: 'image',
    name: { fr: 'Image & Design', en: 'Image & Design' },
    icon: 'Image',
    color: 'from-purple-500 to-pink-500',
    services: [
      {
        id: 'remove-bg',
        name: { fr: 'Supprimer l\'arrière-plan', en: 'Remove Background' },
        description: { 
          fr: 'Retirez automatiquement l\'arrière-plan de vos images en un clic', 
          en: 'Automatically remove image backgrounds with one click' 
        },
        icon: 'Wand2',
        prompt: { fr: 'Quels sont les meilleurs outils pour supprimer l\'arrière-plan d\'une image ?', en: 'What are the best tools to remove image backgrounds?' }
      },
      {
        id: 'generate',
        name: { fr: 'Générer image IA', en: 'Generate AI Image' },
        description: { 
          fr: 'Créez des images uniques à partir de descriptions textuelles', 
          en: 'Create unique images from text descriptions' 
        },
        icon: 'Palette',
        prompt: { fr: 'Quels sont les meilleurs générateurs d\'images par IA ?', en: 'What are the best AI image generators?' }
      },
      {
        id: 'create-logo',
        name: { fr: 'Créer un logo', en: 'Create Logo' },
        description: { 
          fr: 'Générez un logo professionnel pour votre marque avec l\'IA', 
          en: 'Generate a professional logo for your brand with AI' 
        },
        icon: 'CircleDot',
        prompt: { fr: 'Générateurs de logos IA', en: 'AI logo generators' }
      },
      {
        id: 'create-story',
        name: { fr: 'Créer une story', en: 'Create Story' },
        description: { 
          fr: 'Générez des visuels parfaits pour vos stories Instagram et réseaux sociaux', 
          en: 'Generate perfect visuals for your Instagram stories and social media' 
        },
        icon: 'Smartphone',
        prompt: { fr: 'Outils pour créer des stories Instagram', en: 'Tools to create Instagram stories' }
      },
      {
        id: 'create-thumbnail',
        name: { fr: 'Créer miniature YouTube', en: 'Create YouTube Thumbnail' },
        description: { 
          fr: 'Générez des miniatures accrocheuses pour vos vidéos YouTube', 
          en: 'Generate eye-catching thumbnails for your YouTube videos' 
        },
        icon: 'Monitor',
        prompt: { fr: 'Créateurs de miniatures YouTube', en: 'YouTube thumbnail creators' }
      },
      {
        id: 'create-poster',
        name: { fr: 'Créer une affiche', en: 'Create Poster' },
        description: { 
          fr: 'Générez des affiches et flyers professionnels pour vos événements', 
          en: 'Generate professional posters and flyers for your events' 
        },
        icon: 'FileImage',
        prompt: { fr: 'Générateurs d\'affiches IA', en: 'AI poster generators' }
      },
      {
        id: 'product-photo',
        name: { fr: 'Photo produit IA', en: 'AI Product Photo' },
        description: { 
          fr: 'Créez des photos produits professionnelles avec différents arrière-plans', 
          en: 'Create professional product photos with different backgrounds' 
        },
        icon: 'ShoppingBag',
        prompt: { fr: 'Générateurs de photos produits IA', en: 'AI product photo generators' }
      }
    ]
  },
  {
    id: 'text',
    slug: 'text',
    name: { fr: 'Texte & Rédaction', en: 'Text & Writing' },
    icon: 'FileText',
    color: 'from-green-500 to-emerald-500',
    services: [
      {
        id: 'grammar',
        name: { fr: 'Correcteur orthographe', en: 'Grammar Checker' },
        description: { 
          fr: 'Corrigez vos fautes d\'orthographe et de grammaire instantanément', 
          en: 'Fix spelling and grammar mistakes instantly' 
        },
        icon: 'CheckCircle',
        prompt: { fr: 'Recommande-moi les meilleurs correcteurs orthographiques IA', en: 'Recommend the best AI grammar checkers' }
      },
      {
        id: 'translate',
        name: { fr: 'Traduction automatique', en: 'Auto Translation' },
        description: { 
          fr: 'Traduisez vos textes dans plus de 100 langues avec précision', 
          en: 'Translate texts in 100+ languages accurately' 
        },
        icon: 'Languages',
        prompt: { fr: 'Quels sont les meilleurs outils de traduction IA ?', en: 'What are the best AI translation tools?' }
      },
      {
        id: 'summarize',
        name: { fr: 'Résumer un texte', en: 'Summarize Text' },
        description: { 
          fr: 'Générez des résumés concis de longs documents', 
          en: 'Generate concise summaries of long documents' 
        },
        icon: 'FileText',
        prompt: { fr: 'Outils IA pour résumer des textes et documents', en: 'AI tools to summarize texts and documents' }
      },
      {
        id: 'paraphrase',
        name: { fr: 'Reformuler du texte', en: 'Paraphrase Text' },
        description: { 
          fr: 'Reformulez vos textes tout en gardant le sens original', 
          en: 'Rephrase texts while keeping original meaning' 
        },
        icon: 'RefreshCw',
        prompt: { fr: 'Quels outils pour reformuler et paraphraser du texte ?', en: 'Which tools to rephrase and paraphrase text?' }
      },
      {
        id: 'write',
        name: { fr: 'Rédaction assistée', en: 'AI Writing' },
        description: { 
          fr: 'Rédigez des articles, emails et contenus avec l\'aide de l\'IA', 
          en: 'Write articles, emails and content with AI assistance' 
        },
        icon: 'PenTool',
        prompt: { fr: 'Recommande-moi des assistants de rédaction IA', en: 'Recommend AI writing assistants' }
      },
      {
        id: 'detect-ai',
        name: { fr: 'Détecter texte IA', en: 'Detect AI Text' },
        description: { 
          fr: 'Identifiez si un texte a été généré par une IA', 
          en: 'Identify if text was AI-generated' 
        },
        icon: 'Search',
        prompt: { fr: 'Outils pour détecter du contenu généré par IA', en: 'Tools to detect AI-generated content' }
      }
    ]
  },
  {
    id: 'legal',
    slug: 'legal',
    name: { fr: 'Juridique & Legal', en: 'Legal & Law' },
    icon: 'Scale',
    color: 'from-blue-500 to-cyan-500',
    services: [
      {
        id: 'contract',
        name: { fr: 'Générer contrat', en: 'Generate Contract' },
        description: { 
          fr: 'Créez des contrats juridiques personnalisés rapidement', 
          en: 'Create custom legal contracts quickly' 
        },
        icon: 'FileCheck',
        prompt: { fr: 'Outils IA pour générer des contrats juridiques', en: 'AI tools to generate legal contracts' }
      },
      {
        id: 'analyze-doc',
        name: { fr: 'Analyser document', en: 'Analyze Document' },
        description: { 
          fr: 'Analysez et comprenez des documents juridiques complexes', 
          en: 'Analyze and understand complex legal documents' 
        },
        icon: 'FileSearch',
        prompt: { fr: 'Recommande des outils pour analyser des documents juridiques', en: 'Recommend tools to analyze legal documents' }
      },
      {
        id: 'legal-advice',
        name: { fr: 'Conseil juridique', en: 'Legal Advice' },
        description: { 
          fr: 'Obtenez des réponses à vos questions juridiques de base', 
          en: 'Get answers to basic legal questions' 
        },
        icon: 'MessageCircle',
        prompt: { fr: 'Assistants IA pour conseils juridiques', en: 'AI assistants for legal advice' }
      },
      {
        id: 'cgv',
        name: { fr: 'CGV / CGU', en: 'Terms & Conditions' },
        description: { 
          fr: 'Générez vos conditions générales de vente et d\'utilisation', 
          en: 'Generate terms and conditions for your business' 
        },
        icon: 'FileText',
        prompt: { fr: 'Outils pour créer des CGV et CGU', en: 'Tools to create terms and conditions' }
      },
      {
        id: 'privacy',
        name: { fr: 'Politique RGPD', en: 'Privacy Policy' },
        description: { 
          fr: 'Créez une politique de confidentialité conforme au RGPD', 
          en: 'Create GDPR-compliant privacy policy' 
        },
        icon: 'Shield',
        prompt: { fr: 'Générateurs de politique de confidentialité RGPD', en: 'GDPR privacy policy generators' }
      }
    ]
  },
  {
    id: 'code',
    slug: 'code',
    name: { fr: 'Code & Développement', en: 'Code & Development' },
    icon: 'Code',
    color: 'from-orange-500 to-red-500',
    services: [
      {
        id: 'code-gen',
        name: { fr: 'Générer du code', en: 'Generate Code' },
        description: { 
          fr: 'Générez du code dans n\'importe quel langage de programmation', 
          en: 'Generate code in any programming language' 
        },
        icon: 'Code',
        prompt: { fr: 'Meilleurs outils IA pour générer du code', en: 'Best AI tools to generate code' }
      },
      {
        id: 'debug',
        name: { fr: 'Débugger le code', en: 'Debug Code' },
        description: { 
          fr: 'Trouvez et corrigez les bugs dans votre code rapidement', 
          en: 'Find and fix bugs in your code quickly' 
        },
        icon: 'Bug',
        prompt: { fr: 'Outils IA pour débugger du code', en: 'AI tools to debug code' }
      },
      {
        id: 'explain',
        name: { fr: 'Expliquer le code', en: 'Explain Code' },
        description: { 
          fr: 'Comprenez n\'importe quel code avec des explications claires', 
          en: 'Understand any code with clear explanations' 
        },
        icon: 'MessageSquare',
        prompt: { fr: 'Assistants IA pour expliquer du code', en: 'AI assistants to explain code' }
      },
      {
        id: 'convert',
        name: { fr: 'Convertir langage', en: 'Convert Language' },
        description: { 
          fr: 'Convertissez votre code d\'un langage à un autre', 
          en: 'Convert code from one language to another' 
        },
        icon: 'RefreshCw',
        prompt: { fr: 'Outils pour convertir du code entre langages', en: 'Tools to convert code between languages' }
      },
      {
        id: 'optimize',
        name: { fr: 'Optimiser le code', en: 'Optimize Code' },
        description: { 
          fr: 'Améliorez les performances et la qualité de votre code', 
          en: 'Improve code performance and quality' 
        },
        icon: 'Zap',
        prompt: { fr: 'Outils IA pour optimiser du code', en: 'AI tools to optimize code' }
      },
      {
        id: 'tests',
        name: { fr: 'Générer tests', en: 'Generate Tests' },
        description: { 
          fr: 'Créez des tests unitaires automatiquement pour votre code', 
          en: 'Create unit tests automatically for your code' 
        },
        icon: 'CheckSquare',
        prompt: { fr: 'Générateurs de tests unitaires IA', en: 'AI unit test generators' }
      }
    ]
  },
  {
    id: 'marketing',
    slug: 'marketing',
    name: { fr: 'Marketing & SEO', en: 'Marketing & SEO' },
    icon: 'TrendingUp',
    color: 'from-pink-500 to-rose-500',
    services: [
      {
        id: 'seo',
        name: { fr: 'Optimiser SEO', en: 'SEO Optimizer' },
        description: { 
          fr: 'Améliorez le référencement de votre site web', 
          en: 'Improve your website SEO ranking' 
        },
        icon: 'Search',
        prompt: { fr: 'Outils IA pour optimiser le SEO', en: 'AI tools to optimize SEO' }
      },
      {
        id: 'ads',
        name: { fr: 'Créer publicités', en: 'Create Ads' },
        description: { 
          fr: 'Générez des publicités accrocheuses pour vos campagnes', 
          en: 'Generate catchy ads for your campaigns' 
        },
        icon: 'Target',
        prompt: { fr: 'Générateurs de publicités IA', en: 'AI ad generators' }
      },
      {
        id: 'email',
        name: { fr: 'Email marketing', en: 'Email Marketing' },
        description: { 
          fr: 'Créez des campagnes email professionnelles', 
          en: 'Create professional email campaigns' 
        },
        icon: 'Mail',
        prompt: { fr: 'Outils email marketing avec IA', en: 'Email marketing tools with AI' }
      },
      {
        id: 'social',
        name: { fr: 'Posts réseaux sociaux', en: 'Social Media Posts' },
        description: { 
          fr: 'Générez du contenu engageant pour les réseaux sociaux', 
          en: 'Generate engaging social media content' 
        },
        icon: 'Share2',
        prompt: { fr: 'Outils IA pour créer du contenu social media', en: 'AI tools to create social media content' }
      },
      {
        id: 'copywriting',
        name: { fr: 'Copywriting', en: 'Copywriting' },
        description: { 
          fr: 'Rédigez des textes de vente persuasifs', 
          en: 'Write persuasive sales copy' 
        },
        icon: 'PenTool',
        prompt: { fr: 'Assistants de copywriting IA', en: 'AI copywriting assistants' }
      },
      {
        id: 'hashtags',
        name: { fr: 'Générateur hashtags', en: 'Hashtag Generator' },
        description: { 
          fr: 'Trouvez les meilleurs hashtags pour vos posts', 
          en: 'Find the best hashtags for your posts' 
        },
        icon: 'Hash',
        prompt: { fr: 'Générateurs de hashtags IA', en: 'AI hashtag generators' }
      }
    ]
  },
  {
    id: 'business',
    slug: 'business',
    name: { fr: 'Business & Finance', en: 'Business & Finance' },
    icon: 'Briefcase',
    color: 'from-indigo-500 to-purple-500',
    services: [
      {
        id: 'business-plan',
        name: { fr: 'Business plan', en: 'Business Plan' },
        description: { 
          fr: 'Créez un business plan professionnel en quelques minutes', 
          en: 'Create a professional business plan in minutes' 
        },
        icon: 'FileText',
        prompt: { fr: 'Générateurs de business plan IA', en: 'AI business plan generators' }
      },
      {
        id: 'pitch',
        name: { fr: 'Pitch deck', en: 'Pitch Deck' },
        description: { 
          fr: 'Générez une présentation convaincante pour investisseurs', 
          en: 'Generate convincing investor presentation' 
        },
        icon: 'Presentation',
        prompt: { fr: 'Outils pour créer un pitch deck', en: 'Tools to create pitch deck' }
      },
      {
        id: 'market',
        name: { fr: 'Analyse de marché', en: 'Market Analysis' },
        description: { 
          fr: 'Analysez votre marché et la concurrence', 
          en: 'Analyze your market and competition' 
        },
        icon: 'BarChart',
        prompt: { fr: 'Outils d\'analyse de marché IA', en: 'AI market analysis tools' }
      },
      {
        id: 'financial',
        name: { fr: 'Prévisions financières', en: 'Financial Forecast' },
        description: { 
          fr: 'Créez des prévisions financières détaillées', 
          en: 'Create detailed financial forecasts' 
        },
        icon: 'TrendingUp',
        prompt: { fr: 'Outils de prévisions financières', en: 'Financial forecasting tools' }
      },
      {
        id: 'invoice',
        name: { fr: 'Générer factures', en: 'Generate Invoices' },
        description: { 
          fr: 'Créez des factures professionnelles rapidement', 
          en: 'Create professional invoices quickly' 
        },
        icon: 'Receipt',
        prompt: { fr: 'Générateurs de factures', en: 'Invoice generators' }
      }
    ]
  },
  {
    id: 'education',
    slug: 'education',
    name: { fr: 'Éducation & Formation', en: 'Education & Training' },
    icon: 'GraduationCap',
    color: 'from-yellow-500 to-amber-500',
    services: [
      {
        id: 'quiz',
        name: { fr: 'Créer quiz', en: 'Create Quiz' },
        description: { 
          fr: 'Générez des quiz interactifs pour vos formations', 
          en: 'Generate interactive quizzes for training' 
        },
        icon: 'HelpCircle',
        prompt: { fr: 'Générateurs de quiz IA', en: 'AI quiz generators' }
      },
      {
        id: 'flashcards',
        name: { fr: 'Cartes mémoire', en: 'Flashcards' },
        description: { 
          fr: 'Créez des flashcards pour faciliter l\'apprentissage', 
          en: 'Create flashcards to ease learning' 
        },
        icon: 'Layers',
        prompt: { fr: 'Générateurs de flashcards IA', en: 'AI flashcard generators' }
      },
      {
        id: 'lesson',
        name: { fr: 'Plans de cours', en: 'Lesson Plans' },
        description: { 
          fr: 'Générez des plans de cours structurés', 
          en: 'Generate structured lesson plans' 
        },
        icon: 'BookOpen',
        prompt: { fr: 'Outils pour créer des plans de cours', en: 'Tools to create lesson plans' }
      },
      {
        id: 'tutor',
        name: { fr: 'Tuteur personnel', en: 'Personal Tutor' },
        description: { 
          fr: 'Obtenez de l\'aide personnalisée pour vos études', 
          en: 'Get personalized help for your studies' 
        },
        icon: 'Users',
        prompt: { fr: 'Tuteurs IA pour l\'apprentissage', en: 'AI tutors for learning' }
      },
      {
        id: 'language',
        name: { fr: 'Apprendre langue', en: 'Learn Language' },
        description: { 
          fr: 'Apprenez une nouvelle langue avec l\'IA', 
          en: 'Learn a new language with AI' 
        },
        icon: 'Languages',
        prompt: { fr: 'Applications d\'apprentissage de langues IA', en: 'AI language learning apps' }
      }
    ]
  },
  {
    id: 'video',
    slug: 'video',
    name: { fr: 'Vidéo & Audio', en: 'Video & Audio' },
    icon: 'Video',
    color: 'from-red-500 to-pink-500',
    services: [
      {
        id: 'video-gen',
        name: { fr: 'Générer vidéo', en: 'Generate Video' },
        description: { 
          fr: 'Créez des vidéos à partir de texte ou d\'images', 
          en: 'Create videos from text or images' 
        },
        icon: 'Video',
        prompt: { fr: 'Générateurs de vidéos IA', en: 'AI video generators' }
      },
      {
        id: 'subtitles',
        name: { fr: 'Sous-titres auto', en: 'Auto Subtitles' },
        description: { 
          fr: 'Générez des sous-titres automatiquement pour vos vidéos', 
          en: 'Generate subtitles automatically for videos' 
        },
        icon: 'Captions',
        prompt: { fr: 'Outils de sous-titrage automatique', en: 'Auto subtitling tools' }
      },
      {
        id: 'voice',
        name: { fr: 'Voix de synthèse', en: 'Text to Speech' },
        description: { 
          fr: 'Convertissez du texte en voix réaliste', 
          en: 'Convert text to realistic voice' 
        },
        icon: 'Mic',
        prompt: { fr: 'Générateurs de voix IA (text-to-speech)', en: 'AI voice generators (text-to-speech)' }
      },
      {
        id: 'transcribe',
        name: { fr: 'Transcrire audio', en: 'Transcribe Audio' },
        description: { 
          fr: 'Convertissez l\'audio en texte précisément', 
          en: 'Convert audio to text accurately' 
        },
        icon: 'FileText',
        prompt: { fr: 'Outils de transcription audio', en: 'Audio transcription tools' }
      },
      {
        id: 'music',
        name: { fr: 'Générer musique', en: 'Generate Music' },
        description: { 
          fr: 'Créez de la musique originale avec l\'IA', 
          en: 'Create original music with AI' 
        },
        icon: 'Music',
        prompt: { fr: 'Générateurs de musique IA', en: 'AI music generators' }
      },
      {
        id: 'edit-video',
        name: { fr: 'Éditer vidéo', en: 'Edit Video' },
        description: { 
          fr: 'Éditez vos vidéos avec des outils IA intelligents', 
          en: 'Edit videos with smart AI tools' 
        },
        icon: 'Film',
        prompt: { fr: 'Éditeurs vidéo avec IA', en: 'Video editors with AI' }
      }
    ]
  }
];