import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📰 Starting AI News scan...');

    const today = new Date().toISOString().split('T')[0];

    // Récupérer les URLs existantes
    const existingNews = await base44.asServiceRole.entities.AINews.list();
    const existingDiscoveries = await base44.asServiceRole.entities.AINewsDiscovery.list();
    
    const existingUrls = new Set([
      ...existingNews.map(n => n.source_url?.toLowerCase()),
      ...existingDiscoveries.map(d => d.source_url?.toLowerCase())
    ].filter(Boolean));

    // Liste d'articles à créer manuellement basés sur des sources connues
    const knownSources = [
      {
        title: "The Top 10 AI Stories of 2024",
        summary: "IEEE Spectrum présente les 10 histoires les plus marquantes de l'IA en 2024, incluant la mort du prompt engineering et les problèmes de plagiat visuel de l'IA générative.",
        source_name: "IEEE Spectrum",
        source_url: "https://spectrum.ieee.org/top-ai-stories-2024",
        tags: ["AI", "2024", "tendances"]
      },
      {
        title: "How artificial intelligence impacted our lives in 2024 and what's next",
        summary: "PBS analyse comment l'intelligence artificielle a redéfini le paysage technologique en 2024 et ce qui nous attend pour 2025.",
        source_name: "PBS NewsHour",
        source_url: "https://www.pbs.org/newshour/show/how-artificial-intelligence-impacted-our-lives-in-2024-and-whats-next",
        tags: ["AI", "2024", "futur"]
      },
      {
        title: "In 2024, artificial intelligence was all about putting AI tools to work",
        summary: "Si 2023 était l'année de l'émerveillement, 2024 a été l'année où l'on a essayé de rendre l'IA vraiment utile.",
        source_name: "AP News",
        source_url: "https://apnews.com/article/ai-artificial-intelligence-0b6ab89193265c3f60f382bae9bbabc9",
        tags: ["AI", "productivité", "2024"]
      },
      {
        title: "The 2025 AI Index Report",
        summary: "Stanford HAI publie son rapport annuel sur l'état de l'intelligence artificielle, une ressource de référence pour comprendre l'évolution du domaine.",
        source_name: "Stanford HAI",
        source_url: "https://hai.stanford.edu/ai-index/2025-ai-index-report",
        tags: ["AI", "rapport", "Stanford"]
      },
      {
        title: "AI has an environmental problem. Here's what the world can do about it",
        summary: "Les centres de données qui hébergent les serveurs IA consomment énormément d'électricité et génèrent des déchets électroniques toxiques.",
        source_name: "UNEP",
        source_url: "https://www.unep.org/news-and-stories/story/ai-has-environmental-problem-heres-what-world-can-do-about",
        tags: ["AI", "environnement", "data centers"]
      },
      {
        title: "This AI combo could unlock human-level intelligence",
        summary: "Nature explore comment la combinaison de systèmes logiques traditionnels avec les réseaux neuronaux pourrait débloquer une intelligence de niveau humain.",
        source_name: "Nature",
        source_url: "https://www.nature.com/articles/d41586-025-03856-1",
        tags: ["AI", "AGI", "recherche"]
      }
    ];

    // Utiliser InvokeLLM pour chercher des actualités récentes
    console.log('🔎 Searching for recent AI news...');
    
    const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Recherche les dernières actualités sur l'intelligence artificielle. Date: ${today}.

Trouve des articles récents sur:
- OpenAI, ChatGPT, GPT-5
- Google Gemini
- Anthropic Claude  
- Microsoft Copilot
- Meta AI, Llama
- Startups IA, levées de fonds
- Nouveaux outils IA
- Régulation de l'IA

Pour chaque article trouvé, donne:
- title: titre exact de l'article
- summary: résumé en français (2 phrases max)
- source_name: nom du site source
- source_url: URL complète de l'article
- tags: 2-3 mots-clés

Trouve au moins 15 articles récents avec des URLs valides.`,
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
                tags: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Combiner les sources connues et les résultats de recherche
    let allArticles = [...knownSources];
    
    if (searchResult?.articles?.length > 0) {
      console.log(`✅ LLM found ${searchResult.articles.length} articles`);
      allArticles = [...allArticles, ...searchResult.articles];
    }

    // Créer les découvertes
    let created = 0;
    for (const article of allArticles) {
      if (!article.title || !article.source_url) continue;
      if (!article.source_url.startsWith('http')) continue;
      
      const normalizedUrl = article.source_url.toLowerCase();
      if (existingUrls.has(normalizedUrl)) {
        console.log(`⏭️ Skip (exists): ${article.title.substring(0, 30)}...`);
        continue;
      }

      // Extraire favicon
      let logoUrl = '';
      try {
        const url = new URL(article.source_url);
        logoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
      } catch (e) {
        continue;
      }

      try {
        await base44.asServiceRole.entities.AINewsDiscovery.create({
          title: article.title,
          summary: article.summary || '',
          source_name: article.source_name || 'Unknown',
          source_url: article.source_url,
          source_logo_url: logoUrl,
          published_date: today,
          tags: article.tags || [],
          status: 'new'
        });
        
        existingUrls.add(normalizedUrl);
        created++;
        console.log(`✅ Created: ${article.title.substring(0, 40)}...`);
      } catch (e) {
        console.error(`Failed: ${e.message}`);
      }
    }

    return Response.json({
      success: true,
      found: allArticles.length,
      created: created,
      message: `${created} nouveaux articles ajoutés`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});