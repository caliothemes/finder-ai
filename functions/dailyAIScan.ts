import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('🔍 Starting MEGA AI scan...');

    // Récupérer les services existants pour éviter les doublons
    const existingServices = await base44.asServiceRole.entities.AIService.list();
    const existingUrls = existingServices.map(s => 
      s.website_url?.toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')
    ).filter(Boolean);

    const existingDiscoveries = await base44.asServiceRole.entities.AIServiceDiscovery.list();
    const existingDiscoveryUrls = existingDiscoveries.map(d => 
      d.website_url?.toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')
    ).filter(Boolean);

    const allExistingUrls = [...new Set([...existingUrls, ...existingDiscoveryUrls])];
    const categories = await base44.asServiceRole.entities.Category.list();

    // ============================================
    // STRATÉGIE 1: ANNUAIRES IA MONDIAUX
    // ============================================
    const aiDirectories = [
      // Annuaires majeurs EN
      "site:futurepedia.io new AI tools 2024 2025",
      "site:theresanaiforthat.com AI tools list",
      "site:topai.tools AI directory",
      "site:aitoolhunt.com latest AI tools",
      "site:toolify.ai AI tools directory",
      "site:aitools.fyi complete list",
      "site:insidr.ai AI tools database",
      "site:aicollection.org AI tools",
      "site:supertools.therundown.ai AI directory",
      "site:gptstore.ai GPT apps directory",
      "site:aimodels.fyi AI models list",
      "site:easywithai.com AI tools",
      "site:faind.ai AI directory",
      "site:aivalley.ai tools list",
      "site:domore.ai AI tools",
      
      // AIXPLORIA - Annuaire FR/EN avec 8000+ outils
      "site:aixploria.com/en AI tools",
      "site:aixploria.com ultimate-list-ai",
      "site:aixploria.com last-ai new AI tools",
      "site:aixploria.com free-ai free tools",
      "site:aixploria.com categories-ai",
      "site:aixploria.com Image Generators AI",
      "site:aixploria.com Video Generators AI",
      "site:aixploria.com ChatBots AI",
      "site:aixploria.com Text Generators AI",
      "site:aixploria.com Music AI",
      "site:aixploria.com Voice Cloning AI",
      "site:aixploria.com Productivity AI",
      "site:aixploria.com Marketing AI",
      "site:aixploria.com Developer Tools AI",
      "site:aixploria.com Education AI",
      "site:aixploria.com Business AI",
      
      // Annuaires FR
      "site:ia-directory.fr outils IA",
      "site:aitools.fr annuaire IA français",
      "meilleurs outils intelligence artificielle français 2024 2025",
      "annuaire outils IA France liste complète",
      
      // Annuaires DE
      "KI-Tools Verzeichnis Deutschland 2024 2025",
      "beste KI Werkzeuge Liste komplett",
      "AI tools directory Germany Austria Switzerland",
      
      // Annuaires ES
      "directorio herramientas IA español 2024 2025",
      "mejores herramientas inteligencia artificial lista",
      "herramientas IA España Latinoamérica",
      
      // Annuaires IT
      "strumenti intelligenza artificiale Italia 2024",
      "directory AI tools italiano",
      
      // Annuaires PT
      "ferramentas IA Portugal Brasil 2024 2025",
      "diretório inteligência artificial lista",
      
      // Annuaires NL
      "AI tools directory Nederland België 2024",
      
      // Annuaires PL
      "narzędzia AI Polska 2024 lista",
      
      // Annuaires RU
      "каталог инструментов ИИ 2024 2025",
      "список нейросетей и AI сервисов",
      
      // Annuaires JP
      "AIツール一覧 日本 2024 2025",
      "人工知能ツールディレクトリ",
      
      // Annuaires KR
      "AI 도구 목록 한국 2024 2025",
      
      // Annuaires CN
      "AI工具大全 中国 2024 2025",
      "人工智能工具目录列表",
      
      // Annuaires AR
      "أدوات الذكاء الاصطناعي 2024 2025",
      
      // Annuaires IN
      "AI tools directory India 2024 2025 list",
    ];

    // ============================================
    // STRATÉGIE 2: SOURCES DE NOUVEAUTÉS
    // ============================================
    const newsSources = [
      // Product Hunt & lancements
      "site:producthunt.com AI artificial intelligence launched 2024 2025",
      "site:producthunt.com product of the day AI",
      "site:betalist.com AI startups beta",
      "site:startupbase.io AI tools startups",
      "site:crunchbase.com AI startups funding 2024 2025",
      
      // Tech news
      "site:techcrunch.com new AI tools launched 2024 2025",
      "site:theverge.com AI tools apps announced",
      "site:wired.com AI software tools new",
      "site:venturebeat.com AI tools startups 2024",
      "site:ycombinator.com/companies AI tools",
      
      // Reddit & communautés
      "site:reddit.com/r/artificial best AI tools 2024 2025",
      "site:reddit.com/r/ChatGPT alternatives tools",
      "site:reddit.com/r/midjourney alternatives AI image",
      "site:reddit.com/r/SideProject AI tools launched",
      "site:reddit.com/r/startups AI product launched",
      
      // Twitter/X trending
      "AI tools trending twitter 2024 2025 new launch",
      "new AI startup launched viral tool",
    ];

    // ============================================
    // STRATÉGIE 3: CATÉGORIES EXHAUSTIVES
    // ============================================
    const categorySearches = [
      // Génération d'images
      "AI image generation tools 2024 2025 complete list Midjourney DALL-E alternatives",
      "text to image AI generators all options",
      "AI art generators tools directory",
      "AI photo editing enhancement tools all",
      "AI logo generator brand design tools",
      "AI avatar creator tools list",
      "AI background remover tools",
      "AI image upscaler enhancer tools",
      
      // Vidéo
      "AI video generation tools 2024 2025 Runway Pika Luma alternatives",
      "text to video AI generators all",
      "AI video editing tools automatic",
      "AI animation tools 2D 3D",
      "AI lip sync deepfake tools",
      "AI video transcription subtitle tools",
      "AI short form video creator tools",
      
      // Audio & Voix
      "AI voice generator text to speech 2024 2025 all tools",
      "AI voice cloning tools ElevenLabs alternatives",
      "AI music generation Suno Udio alternatives all",
      "AI audio editing podcast tools",
      "AI transcription tools automatic",
      "AI noise removal audio tools",
      "AI sound effect generator tools",
      
      // Écriture & Contenu
      "AI writing assistant tools 2024 2025 all Jasper alternatives",
      "AI copywriting marketing tools",
      "AI blog content generator tools",
      "AI email writer tools",
      "AI grammar checker tools Grammarly alternatives",
      "AI story fiction writer tools",
      "AI academic research writing tools",
      "AI SEO content optimization tools",
      "AI social media post generator tools",
      
      // Code & Dev
      "AI coding assistant 2024 2025 Copilot Cursor alternatives all",
      "AI code generation tools",
      "AI debugging tools automatic",
      "AI code review tools",
      "AI no-code app builder tools all",
      "AI website builder tools",
      "AI API development tools",
      "AI SQL database query tools",
      
      // Chatbots & Assistants
      "AI chatbot platforms 2024 2025 all ChatGPT alternatives",
      "AI customer service chatbot tools",
      "AI personal assistant tools",
      "AI knowledge base chatbot tools",
      "custom GPT builders platforms all",
      "AI agent automation tools",
      
      // Productivité
      "AI productivity tools 2024 2025 complete list",
      "AI meeting notes transcription tools",
      "AI calendar scheduling assistant tools",
      "AI task management automation tools",
      "AI document processing tools",
      "AI spreadsheet automation tools",
      "AI workflow automation Zapier alternatives",
      "AI presentation generator Gamma alternatives all",
      
      // Business & Marketing
      "AI marketing tools 2024 2025 all",
      "AI sales automation tools",
      "AI lead generation tools",
      "AI CRM tools automatic",
      "AI analytics business intelligence tools",
      "AI market research tools",
      "AI competitive analysis tools",
      "AI pricing optimization tools",
      
      // Design & Créatif
      "AI design tools 2024 2025 Canva alternatives all",
      "AI UX UI design tools",
      "AI wireframe prototype tools",
      "AI 3D modeling tools",
      "AI interior design tools",
      "AI fashion design tools",
      "AI font generator tools",
      
      // Éducation
      "AI education learning tools 2024 2025 all",
      "AI tutoring tools personalized",
      "AI language learning tools",
      "AI quiz generator tools",
      "AI flashcard study tools",
      "AI course creator tools",
      
      // Santé & Bien-être
      "AI health wellness tools 2024 2025",
      "AI fitness workout generator tools",
      "AI nutrition diet planning tools",
      "AI mental health therapy tools",
      "AI medical diagnosis tools",
      
      // Finance
      "AI finance investment tools 2024 2025",
      "AI trading bot tools",
      "AI accounting bookkeeping tools",
      "AI expense tracking tools",
      "AI financial planning tools",
      
      // Autres niches
      "AI resume builder tools 2024 2025",
      "AI legal document tools",
      "AI real estate tools",
      "AI travel planning tools",
      "AI recipe meal planning tools",
      "AI gaming AI tools",
      "AI dating profile tools",
      "AI pet AI tools",
      "AI gardening tools",
      "AI car automotive tools",
    ];

    // ============================================
    // STRATÉGIE 4: DÉTECTION PAR MOTS-CLÉS
    // ============================================
    const keywordSearches = [
      // Termes techniques
      "GPT-4 powered tools applications 2024",
      "Claude AI Anthropic powered tools apps",
      "Gemini Google AI powered applications",
      "LLM based tools applications SaaS",
      "generative AI tools new 2024 2025",
      "foundation model powered apps",
      "transformer based AI tools",
      "diffusion model AI tools apps",
      
      // Suffixes populaires
      "*.ai new AI tools SaaS launched 2024 2025",
      "AI SaaS tools with .ai domain",
      "new .ai domain AI startups tools",
      
      // Patterns de noms
      "AI tool ending in -fy 2024",
      "AI tool ending in -ly 2024",
      "AI tool ending in -io 2024",
      "AI tool with -AI suffix 2024",
      "AI tool with Auto- prefix 2024",
      "AI tool with Smart- prefix 2024",
    ];

    // ============================================
    // STRATÉGIE 5: STARTUPS & FINANCEMENTS
    // ============================================
    const startupSearches = [
      "AI startups raised funding 2024 2025 seed series A",
      "YC Y Combinator AI startups 2024 2025 batch",
      "Techstars AI startups 2024",
      "AI unicorn startups list 2024 2025",
      "emerging AI companies tools 2024",
      "stealth AI startups launched 2024 2025",
      "bootstrap AI tools profitable 2024",
      "indie AI tools solo developers 2024",
    ];

    // ============================================
    // STRATÉGIE 6: SERVICES UTILISANT L'IA (pas créateurs d'IA)
    // ============================================
    const aiPoweredServices = [
      // Apps/Services propulsés par IA
      "apps powered by GPT-4 ChatGPT API 2024 2025",
      "services using OpenAI API applications",
      "products built with Claude Anthropic API",
      "apps using Gemini Google AI API",
      "businesses using AI automation 2024",
      "SaaS products powered by artificial intelligence",
      "startups leveraging LLM large language models",
      "companies using AI to enhance their product",
      
      // E-commerce & Retail avec IA
      "AI powered e-commerce platforms 2024",
      "online stores using AI recommendations",
      "AI shopping assistant apps",
      "AI product description generators for shops",
      "AI pricing optimization platforms",
      "AI inventory management tools",
      
      // Services clients avec IA
      "AI customer support platforms 2024 2025",
      "AI helpdesk chatbot services",
      "AI call center solutions",
      "AI email response automation services",
      
      // Marketing & Ads avec IA
      "AI advertising platforms 2024",
      "AI social media management tools",
      "AI influencer marketing platforms",
      "AI ad creative generation services",
      "AI audience targeting platforms",
      
      // Finance & Fintech avec IA
      "AI fintech apps 2024 2025",
      "AI investment advisor robo-advisor apps",
      "AI expense tracking budgeting apps",
      "AI fraud detection services",
      "AI credit scoring platforms",
      "AI accounting automation services",
      
      // Santé & Wellness avec IA
      "AI health apps diagnosis symptoms 2024",
      "AI fitness coaching apps",
      "AI mental health therapy apps",
      "AI nutrition meal planning apps",
      "AI sleep tracking analysis apps",
      "AI meditation mindfulness apps",
      
      // Éducation avec IA
      "AI tutoring platforms 2024 2025",
      "AI homework help apps",
      "AI language learning apps powered by AI",
      "AI test prep platforms",
      "AI personalized learning platforms",
      
      // Immobilier avec IA
      "AI real estate platforms 2024",
      "AI property valuation tools",
      "AI home design interior apps",
      "AI virtual staging services",
      
      // Juridique avec IA
      "AI legal tech platforms 2024",
      "AI contract review services",
      "AI legal document automation",
      "AI compliance monitoring tools",
      
      // RH & Recrutement avec IA
      "AI recruiting hiring platforms 2024",
      "AI resume screening tools",
      "AI interview scheduling platforms",
      "AI employee engagement tools",
      "AI performance review tools",
      
      // Voyage & Tourisme avec IA
      "AI travel planning apps 2024",
      "AI trip itinerary generators",
      "AI hotel booking recommendation apps",
      "AI flight price prediction apps",
      
      // Food & Restaurant avec IA
      "AI restaurant management platforms",
      "AI food delivery optimization",
      "AI recipe apps personalized",
      "AI wine recommendation apps",
      
      // Dating & Social avec IA
      "AI dating apps matching 2024",
      "AI social networking apps",
      "AI friend matching apps",
      
      // Gaming avec IA
      "AI powered games 2024 2025",
      "AI game development tools",
      "AI NPC character generators",
      
      // Autres niches avec IA
      "AI pet care apps 2024",
      "AI plant care gardening apps",
      "AI car maintenance apps",
      "AI fashion styling apps",
      "AI gift recommendation apps",
      "AI event planning apps",
      "AI weather prediction apps advanced",
      "AI sports analytics apps",
      "AI music recommendation apps",
      "AI podcast discovery apps",
      "AI news aggregator personalized apps",
    ];

    // Combiner toutes les requêtes
    const allSearchQueries = [
      ...aiDirectories,
      ...newsSources,
      ...categorySearches,
      ...keywordSearches,
      ...startupSearches,
      ...aiPoweredServices
    ];

    // Ajouter des requêtes dynamiques basées sur la date actuelle
    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const dynamicQueries = [
      `new AI tools launched ${currentMonth} ${currentYear}`,
      `AI startups ${currentMonth} ${currentYear} Product Hunt`,
      `trending AI apps ${currentMonth} ${currentYear}`,
      `latest AI tools released this week`,
      `AI tools going viral ${currentYear}`,
      `best new AI apps november december 2024 2025`,
      `AI tools ProductHunt upvoted this month`,
      `new ChatGPT alternatives ${currentYear}`,
      `new Midjourney alternatives ${currentYear}`,
      `AI tools launched on Twitter X trending`,
      `indie hackers AI tools launched recently`,
      `AI micro SaaS tools 2024 2025 new`,
      `AI chrome extensions new 2024 2025`,
      `AI mobile apps iOS Android new 2024 2025`,
      `AI Slack Discord bots new tools`,
      `AI Notion integrations tools new`,
      `AI Figma plugins new 2024`,
      `AI VS Code extensions new`,
      `free AI tools no signup 2024`,
      `open source AI tools GitHub trending`,
    ];

    const allQueriesWithDynamic = [...allSearchQueries, ...dynamicQueries];
    
    // Mélanger pour varier les sources
    const shuffledQueries = allQueriesWithDynamic.sort(() => Math.random() - 0.5);
    
    // Réduire le nombre de requêtes mais les rendre plus efficaces
    const searchQueries = shuffledQueries.slice(0, 30);

    const allDiscoveries = [];
    const seenUrls = new Set(allExistingUrls);

    // Scanner chaque source
    for (const query of searchQueries) {
      console.log(`🔎 Searching: ${query.substring(0, 60)}...`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `RECHERCHE WEB OBLIGATOIRE: "${query}"

DATE ACTUELLE: ${new Date().toISOString().split('T')[0]}

MISSION CRITIQUE: Tu DOIS effectuer une recherche web en temps réel pour trouver des outils IA.

IMPORTANT - 2 types de services recherchés:
1. CRÉATEURS D'IA: Outils qui créent/génèrent du contenu (génération images, vidéos, texte, code, etc.)
2. SERVICES UTILISANT L'IA: Apps/sites qui utilisent l'IA en backend (dating, fitness, e-commerce, santé, etc.)

INSTRUCTIONS STRICTES:
1. EFFECTUE une recherche internet MAINTENANT avec cette requête
2. NE RETOURNE QUE des outils que tu as RÉELLEMENT trouvés via ta recherche web
3. Vérifie que chaque URL est VALIDE et accessible
4. Retourne 10-50 outils RÉELS et UNIQUES
5. EXCLUS les très connus: ChatGPT, Claude, Midjourney, DALL-E, Copilot, Gemini
6. Privilégie les outils récents 2024-2025 et les alternatives moins connues
7. Inclure des outils de tous pays/langues

FORMAT DE RÉPONSE pour chaque outil:
- name: Nom exact du produit
- website_url: URL DIRECTE du site officiel de l'outil (PAS l'URL d'un annuaire comme topai.tools, futurepedia.io, etc.)
- description: 50-100 mots en français décrivant l'outil
- tagline: Phrase d'accroche courte en français
- features: Liste de 3-5 fonctionnalités principales
- pricing: "gratuit" / "freemium" / "payant" / "abonnement"
- country: Pays d'origine si connu
- language: Langue principale du site

URLS INTERDITES (retourner l'URL officielle de l'outil à la place):
- topai.tools/...
- futurepedia.io/...
- theresanaiforthat.com/...
- toolify.ai/...
- aitools.fyi/...
- producthunt.com/...
- alternativeto.net/...
- aixploria.com/... (retourner l'URL officielle de l'outil, pas celle d'aixploria)
Exemple: Si tu trouves "Notion AI" sur futurepedia, retourne "https://notion.so" pas "https://futurepedia.io/tool/notion-ai"

SOURCES À EXPLORER:
- Annuaires IA: Futurepedia, There's an AI, TopAI, Toolify, AITools.fyi, AIXPLORIA
- Lancements: Product Hunt, BetaList, Indie Hackers
- Tech news: TechCrunch, TheVerge, VentureBeat
- GitHub trending AI
- App stores AI sections

CATÉGORIES D'OUTILS:
- Génération: Image, Vidéo, Audio, Texte, Code, 3D
- Services: Marketing, Productivité, Education, Santé, Finance
- Niches: Legal, RH, Immobilier, E-commerce

RÈGLES ABSOLUES:
- RECHERCHE WEB OBLIGATOIRE - utilise ta capacité de recherche internet
- Retourne UNIQUEMENT des outils trouvés via recherche web réelle
- URLs valides et vérifiées uniquement
- Si rien trouvé, retourne tableau vide (PAS d'invention)
- EXCLURE: ChatGPT, Claude, Midjourney, DALL-E, Copilot, Gemini`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              services: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    website_url: { type: "string" },
                    description: { type: "string" },
                    tagline: { type: "string" },
                    features: { 
                      type: "array",
                      items: { type: "string" }
                    },
                    pricing: { 
                      type: "string",
                      enum: ["gratuit", "freemium", "payant", "abonnement"]
                    },
                    country: { type: "string" },
                    language: { type: "string" }
                  },
                  required: ["name", "website_url"]
                }
              }
            }
          }
        });

        if (response && response.services) {
          console.log(`✅ Found ${response.services.length} services`);
          
          for (const service of response.services) {
            if (!service.website_url || !service.name) continue;

            // Normaliser l'URL
            let normalizedUrl;
            try {
              const urlObj = new URL(service.website_url);
              normalizedUrl = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname.replace(/\/$/, '');
            } catch {
              continue;
            }
            
            // Vérifier si existe déjà
            if (seenUrls.has(normalizedUrl)) {
              continue;
            }

            // Catégoriser automatiquement
            const suggestedCategories = [];
            const desc = (service.description || '').toLowerCase();
            const name = service.name.toLowerCase();
            const allText = `${name} ${desc} ${(service.features || []).join(' ')}`.toLowerCase();
            
            // Mapping catégories
            const categoryMappings = [
              { keywords: ['image', 'photo', 'picture', 'visual', 'art', 'design', 'logo', 'avatar', 'illustration'], slug: 'image-generation' },
              { keywords: ['video', 'film', 'animation', 'motion', 'clip'], slug: 'video' },
              { keywords: ['audio', 'music', 'musique', 'sound', 'son', 'voice', 'voix', 'speech', 'podcast'], slug: 'audio' },
              { keywords: ['chat', 'conversation', 'assistant', 'bot', 'gpt'], slug: 'chatbots' },
              { keywords: ['write', 'writing', 'text', 'content', 'copy', 'blog', 'article', 'rédaction', 'écriture'], slug: 'writing' },
              { keywords: ['code', 'programming', 'developer', 'dev', 'coding', 'software'], slug: 'code-assistant' },
              { keywords: ['productivity', 'productivité', 'workflow', 'automation', 'task', 'calendar', 'meeting'], slug: 'productivity' },
              { keywords: ['marketing', 'seo', 'ads', 'social media', 'email', 'campaign'], slug: 'marketing' },
              { keywords: ['education', 'learning', 'study', 'tutor', 'course', 'quiz'], slug: 'education' },
              { keywords: ['business', 'finance', 'sales', 'crm', 'analytics', 'data'], slug: 'business' },
              { keywords: ['3d', 'modeling', 'render', 'cad', 'architecture'], slug: '3d' },
              { keywords: ['translation', 'translate', 'language', 'traduction'], slug: 'translation' },
              { keywords: ['research', 'recherche', 'academic', 'science', 'paper'], slug: 'research' },
            ];

            for (const mapping of categoryMappings) {
              if (mapping.keywords.some(kw => allText.includes(kw))) {
                const cat = categories.find(c => c.slug === mapping.slug);
                if (cat && !suggestedCategories.includes(cat.id)) {
                  suggestedCategories.push(cat.id);
                }
              }
            }

            // Extraire le logo via favicon - sinon logo FinderAI par défaut
            let logoUrl = '';
            try {
              const url = new URL(service.website_url);
              logoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
            } catch (error) {
              // Logo FinderAI par défaut
              logoUrl = 'https://finderai.base44.app/logo.svg';
            }

            allDiscoveries.push({
              name: service.name,
              website_url: service.website_url,
              description: service.description || '',
              tagline: service.tagline || '',
              features: service.features || [],
              suggested_pricing: service.pricing || 'freemium',
              suggested_categories: suggestedCategories,
              cover_image_url: '',
              logo_url: logoUrl,
              status: 'new',
              source: `Mega scan: ${query.substring(0, 50)}`,
              tags: [service.country, service.language].filter(Boolean)
            });

            seenUrls.add(normalizedUrl);
          }
        }
      } catch (error) {
        console.error(`Error scanning: ${error.message}`);
      }

      // Pause entre requêtes
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Créer les découvertes en batch avec images
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} new discoveries with images...`);
      
      // Générer les images AVANT de créer les découvertes
      for (let i = 0; i < allDiscoveries.length; i++) {
        const discovery = allDiscoveries[i];
        
        // Générer une image pour chaque découverte
        try {
          const imagePrompt = `Professional modern banner for AI tool called "${discovery.name}". ${discovery.tagline || discovery.description?.substring(0, 100) || 'AI technology tool'}. Abstract futuristic design, gradient colors purple pink blue, neural network patterns, technology aesthetic, clean minimal, no text, no logos, high quality digital art.`;
          
          const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
            prompt: imagePrompt
          });
          
          if (imageResult && imageResult.url) {
            allDiscoveries[i].cover_image_url = imageResult.url;
            console.log(`✅ Image generated: ${discovery.name}`);
          }
        } catch (imgError) {
          console.log(`⚠️ Image gen failed for ${discovery.name}: ${imgError.message}`);
          // Utiliser une image placeholder gradient
          allDiscoveries[i].cover_image_url = '';
        }
        
        // Petite pause entre les générations d'images (éviter rate limit)
        if (i % 5 === 4) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Maintenant créer les découvertes avec les images
      for (let i = 0; i < allDiscoveries.length; i += 25) {
        const batch = allDiscoveries.slice(i, i + 25);
        
        try {
          await base44.asServiceRole.entities.AIServiceDiscovery.bulkCreate(batch);
          console.log(`✅ Batch ${Math.floor(i/25) + 1} created (${batch.length} items)`);
        } catch (batchError) {
          console.error(`Batch error: ${batchError.message}`);
          // Essayer un par un en cas d'erreur batch
          for (const item of batch) {
            try {
              await base44.asServiceRole.entities.AIServiceDiscovery.create(item);
            } catch (e) {
              console.log(`Skip: ${item.name}`);
            }
          }
        }
      }
    }

    console.log('✅ MEGA Scan complete!');
    
    return Response.json({
      success: true,
      discovered: allDiscoveries.length,
      queries_processed: searchQueries.length,
      total_discoveries: existingDiscoveries.length + allDiscoveries.length,
      message: `MEGA Scan completed: ${allDiscoveries.length} new AI services discovered from ${searchQueries.length} sources`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});