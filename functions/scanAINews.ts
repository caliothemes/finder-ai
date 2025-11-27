import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📰 Starting MEGA AI News scan...');

    // Récupérer les articles existants pour éviter les doublons
    const existingNews = await base44.asServiceRole.entities.AINews.list();
    const existingDiscoveries = await base44.asServiceRole.entities.AINewsDiscovery.list();
    
    const existingUrls = [
      ...existingNews.map(n => n.source_url?.toLowerCase()),
      ...existingDiscoveries.map(d => d.source_url?.toLowerCase())
    ].filter(Boolean);

    const seenUrls = new Set(existingUrls);
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const currentYear = new Date().getFullYear();

    // MEGA liste de requêtes pour ratisser large
    const newsQueries = [
      // === RECHERCHES GÉNÉRALES GOOGLE NEWS ===
      `artificial intelligence news ${today}`,
      `AI news today ${currentMonth} ${currentYear}`,
      `latest AI announcements ${currentYear}`,
      `breaking AI news`,
      `AI technology news this week`,
      `machine learning news ${currentMonth} ${currentYear}`,
      `generative AI news`,
      `ChatGPT news update`,
      `OpenAI announcement`,
      `Google AI Gemini news`,
      `Anthropic Claude news`,
      `Meta AI news`,
      `Microsoft Copilot news`,
      `AI startup news funding`,
      
      // === SITES TECH MAJEURS ===
      `site:techcrunch.com AI ${currentMonth} ${currentYear}`,
      `site:theverge.com artificial intelligence`,
      `site:wired.com AI news`,
      `site:arstechnica.com artificial intelligence`,
      `site:venturebeat.com AI machine learning`,
      `site:zdnet.com AI news`,
      `site:cnet.com artificial intelligence`,
      `site:engadget.com AI`,
      `site:gizmodo.com AI news`,
      `site:thenextweb.com AI`,
      `site:mashable.com AI`,
      `site:techradar.com AI news`,
      `site:tomsguide.com AI`,
      `site:pcmag.com AI news`,
      `site:digitaltrends.com AI`,
      
      // === BUSINESS & FINANCE ===
      `site:forbes.com artificial intelligence ${currentYear}`,
      `site:bloomberg.com AI technology`,
      `site:reuters.com artificial intelligence`,
      `site:wsj.com AI news`,
      `site:ft.com artificial intelligence`,
      `site:businessinsider.com AI`,
      `site:cnbc.com AI technology`,
      `site:fortune.com AI`,
      
      // === SITES IA SPÉCIALISÉS ===
      `site:artificialintelligence-news.com`,
      `site:aitrends.com`,
      `site:unite.ai`,
      `site:marktechpost.com`,
      `site:syncedreview.com`,
      `site:analyticsinsight.net AI`,
      `site:towardsdatascience.com AI news`,
      `site:kdnuggets.com AI news`,
      `site:dataconomy.com AI`,
      `site:aitimejournal.com`,
      `site:aibusiness.com`,
      `site:theaiedge.io`,
      
      // === BLOGS OFFICIELS ===
      `site:openai.com/blog`,
      `site:anthropic.com/news`,
      `site:deepmind.com/blog`,
      `site:ai.google/discover`,
      `site:ai.meta.com/blog`,
      `site:blogs.nvidia.com AI`,
      `site:aws.amazon.com/blogs machine-learning`,
      `site:cloud.google.com/blog AI`,
      `site:azure.microsoft.com/blog AI`,
      
      // === SITES FRANÇAIS ===
      `site:usine-digitale.fr intelligence artificielle`,
      `site:lemondeinformatique.fr IA`,
      `site:01net.com intelligence artificielle`,
      `site:journaldunet.com IA`,
      `site:frenchweb.fr intelligence artificielle`,
      `site:siecledigital.fr IA`,
      `site:blogdumoderateur.com IA`,
      `site:numerama.com intelligence artificielle`,
      `site:clubic.com IA`,
      `site:presse-citron.net intelligence artificielle`,
      `site:fredzone.org intelligence artificielle`,
      `intelligence artificielle actualité France ${currentMonth} ${currentYear}`,
      `IA actualité française`,
      
      // === REDDIT & COMMUNAUTÉS ===
      `site:reddit.com/r/artificial news`,
      `site:reddit.com/r/MachineLearning`,
      `site:reddit.com/r/ChatGPT news`,
      `site:reddit.com/r/OpenAI`,
      `site:reddit.com/r/LocalLLaMA news`,
      `site:news.ycombinator.com AI`,
      
      // === THÉMATIQUES SPÉCIFIQUES ===
      `AI image generation news Midjourney DALL-E Stable Diffusion`,
      `AI video generation Sora Runway Pika`,
      `AI music generation Suno Udio`,
      `AI voice cloning ElevenLabs`,
      `AI coding assistant Copilot Cursor`,
      `AI regulation law Europe US`,
      `AI ethics news`,
      `AI job impact news`,
      `AI healthcare medical news`,
      `AI autonomous vehicles self-driving`,
      `AI robotics news`,
      `AI chips GPU NVIDIA AMD Intel`,
      `large language model LLM news`,
      `AI agents autonomous`,
      `AI safety alignment news`,
      
      // === AUTRES LANGUES ===
      `KI Nachrichten Deutschland ${currentYear}`,
      `noticias inteligencia artificial ${currentYear}`,
      `intelligenza artificiale notizie Italia`,
      `AI nieuws Nederland`,
      
      // === RECHERCHES TEMPORELLES ===
      `AI news last 24 hours`,
      `AI announcements this week`,
      `AI product launch ${currentMonth}`,
      `new AI tool released today`,
      `AI company raises funding ${currentMonth} ${currentYear}`,
    ];

    // Mélanger et prendre 40 requêtes
    const shuffledQueries = newsQueries.sort(() => Math.random() - 0.5);
    const searchQueries = shuffledQueries.slice(0, 40);

    const allDiscoveries = [];

    for (const query of searchQueries) {
      console.log(`🔎 Scanning: ${query.substring(0, 60)}...`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `RECHERCHE D'ACTUALITÉS IA SUR INTERNET EN TEMPS RÉEL

REQUÊTE: "${query}"
DATE ACTUELLE: ${today}

MISSION CRITIQUE: Tu DOIS utiliser ta capacité de recherche internet pour trouver des VRAIS articles d'actualité sur l'IA.

INSTRUCTIONS:
1. RECHERCHE ACTIVE sur internet - utilise add_context_from_internet
2. Trouve 15-25 articles RÉELS publiés récemment (derniers 7 jours idéalement)
3. Vérifie que chaque URL est une URL D'ARTICLE (pas une homepage)
4. Récupère les informations EXACTES de chaque article

CRITÈRES DE SÉLECTION - L'article doit parler de:
- Intelligence artificielle, IA, AI
- Machine learning, deep learning
- ChatGPT, GPT-4, GPT-5, OpenAI
- Claude, Anthropic
- Gemini, Google AI, Bard
- Midjourney, DALL-E, Stable Diffusion
- LLM, modèles de langage
- Génération d'images/vidéos/musique par IA
- Startups IA, levées de fonds IA
- Régulation IA, éthique IA
- Robots, automatisation IA
- Tout ce qui mentionne "IA" ou "AI" ou "artificial intelligence"

FORMAT POUR CHAQUE ARTICLE:
{
  "title": "Titre EXACT de l'article",
  "summary": "Résumé en français de 2-3 phrases expliquant le contenu",
  "source_name": "Nom du site (ex: TechCrunch, The Verge, 01net)",
  "source_url": "URL DIRECTE de l'article (pas la homepage!)",
  "published_date": "YYYY-MM-DD",
  "tags": ["tag1", "tag2", "tag3"]
}

URLS INTERDITES - NE PAS RETOURNER:
- URLs de homepage (ex: techcrunch.com, theverge.com)
- URLs de catégories (ex: techcrunch.com/category/ai)
- URLs de recherche
- URLs sans article spécifique

EXEMPLES D'URLS VALIDES:
- techcrunch.com/2024/11/27/openai-launches-new-feature
- theverge.com/2024/11/26/123456/google-gemini-update
- 01net.com/actualites/chatgpt-nouvelle-fonctionnalite

IMPORTANT: Retourne UNIQUEMENT des articles RÉELS trouvés sur internet. Si tu ne trouves rien, retourne un tableau vide.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    source_name: { type: "string" },
                    source_url: { type: "string" },
                    published_date: { type: "string" },
                    tags: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "source_url", "source_name"]
                }
              }
            }
          }
        });

        if (response && response.articles) {
          console.log(`✅ Found ${response.articles.length} articles`);

          for (const article of response.articles) {
            if (!article.source_url || !article.title) continue;

            // Normaliser l'URL
            const normalizedUrl = article.source_url.toLowerCase();
            
            // Vérifier si existe déjà
            if (seenUrls.has(normalizedUrl)) continue;

            // Exclure les URLs de homepage ou catégories
            try {
              const urlObj = new URL(article.source_url);
              const path = urlObj.pathname;
              // Exclure si path trop court ou juste une catégorie
              if (path === '/' || path === '' || path.match(/^\/(category|tag|author|page|search|topics?)\/?$/i)) {
                continue;
              }
              // Exclure si le path ne contient qu'un segment simple
              if (path.split('/').filter(Boolean).length < 2 && !path.match(/\d{4}/)) {
                continue;
              }
            } catch (e) {
              continue;
            }

            // Extraire le favicon
            let logoUrl = '';
            try {
              const url = new URL(article.source_url);
              logoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
            } catch (e) {
              logoUrl = '';
            }

            allDiscoveries.push({
              title: article.title,
              summary: article.summary || '',
              source_name: article.source_name,
              source_url: article.source_url,
              source_logo_url: logoUrl,
              published_date: article.published_date || today,
              tags: article.tags || [],
              status: 'new'
            });

            seenUrls.add(normalizedUrl);
          }
        }
      } catch (error) {
        console.error(`Error scanning: ${error.message}`);
      }

      // Pause courte entre requêtes
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Dédupliquer par titre similaire
    const uniqueDiscoveries = [];
    const seenTitles = new Set();
    
    for (const discovery of allDiscoveries) {
      const normalizedTitle = discovery.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueDiscoveries.push(discovery);
      }
    }

    // Créer les découvertes
    if (uniqueDiscoveries.length > 0) {
      console.log(`📝 Creating ${uniqueDiscoveries.length} news discoveries...`);

      for (let i = 0; i < uniqueDiscoveries.length; i += 25) {
        const batch = uniqueDiscoveries.slice(i, i + 25);
        try {
          await base44.asServiceRole.entities.AINewsDiscovery.bulkCreate(batch);
        } catch (batchError) {
          console.error(`Batch error: ${batchError.message}`);
        }
      }
    }

    console.log('✅ MEGA AI News scan complete!');

    return Response.json({
      success: true,
      discovered: uniqueDiscoveries.length,
      queries_processed: searchQueries.length,
      message: `Scan terminé: ${uniqueDiscoveries.length} articles découverts sur ${searchQueries.length} sources`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});