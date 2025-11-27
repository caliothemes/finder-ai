import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📰 Starting AI News scan...');

    // Récupérer les articles existants pour éviter les doublons
    const existingNews = await base44.asServiceRole.entities.AINews.list();
    const existingDiscoveries = await base44.asServiceRole.entities.AINewsDiscovery.list();
    
    const existingUrls = [
      ...existingNews.map(n => n.source_url?.toLowerCase()),
      ...existingDiscoveries.map(d => d.source_url?.toLowerCase())
    ].filter(Boolean);

    // Sources de news IA à scanner
    const newsQueries = [
      // Sites tech majeurs
      "site:techcrunch.com artificial intelligence news " + new Date().getFullYear(),
      "site:theverge.com AI news latest",
      "site:wired.com artificial intelligence",
      "site:venturebeat.com AI machine learning news",
      "site:arstechnica.com AI news",
      "site:thenextweb.com artificial intelligence",
      "site:zdnet.com AI news",
      "site:cnet.com artificial intelligence",
      "site:engadget.com AI news",
      "site:gizmodo.com artificial intelligence",
      
      // Sites IA spécialisés
      "site:artificialintelligence-news.com",
      "site:aitrends.com news",
      "site:unite.ai news",
      "site:marktechpost.com AI",
      "site:syncedreview.com AI news",
      "site:analyticsinsight.net artificial intelligence",
      "site:towardsdatascience.com AI news",
      "site:machinelearningmastery.com news",
      
      // Business & Finance AI
      "site:forbes.com artificial intelligence",
      "site:bloomberg.com AI technology",
      "site:reuters.com artificial intelligence",
      "site:ft.com AI technology news",
      "site:businessinsider.com AI news",
      
      // Research & Academia
      "site:arxiv.org machine learning paper",
      "site:openai.com blog",
      "site:anthropic.com news",
      "site:deepmind.com blog",
      "site:ai.google blog",
      "site:ai.meta.com blog",
      
      // Français
      "site:usine-digitale.fr intelligence artificielle",
      "site:lemondeinformatique.fr IA actualité",
      "site:01net.com intelligence artificielle",
      "site:journaldunet.com IA actualité",
      "site:frenchweb.fr intelligence artificielle",
      "site:siecledigital.fr IA",
      
      // Recherches générales récentes
      "artificial intelligence news today " + new Date().toISOString().split('T')[0],
      "AI breakthrough announcement " + new Date().getFullYear(),
      "ChatGPT GPT-4 Claude news update",
      "Midjourney DALL-E Stable Diffusion news",
      "AI startup funding news " + new Date().getFullYear(),
      "new AI model released",
      "AI regulation law news",
      "AI ethics news",
      "generative AI news today",
      "large language model news LLM",
      "AI video generation news Sora Runway",
      "AI music generation news Suno Udio",
    ];

    // Mélanger et limiter
    const shuffledQueries = newsQueries.sort(() => Math.random() - 0.5);
    const searchQueries = shuffledQueries.slice(0, 25);

    const allDiscoveries = [];
    const seenUrls = new Set(existingUrls);

    for (const query of searchQueries) {
      console.log(`🔎 Scanning: ${query.substring(0, 50)}...`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `RECHERCHE D'ACTUALITÉS IA SUR INTERNET: "${query}"

DATE: ${new Date().toISOString().split('T')[0]}

MISSION: Trouver les articles d'actualité les plus récents sur l'intelligence artificielle.

INSTRUCTIONS:
1. Recherche sur internet les articles récents (dernières 48h-7 jours idéalement)
2. Pour chaque article, récupère les informations EXACTES
3. Retourne 10-20 articles différents
4. UNIQUEMENT des articles RÉELS avec des URLs VALIDES
5. Privilégier les actualités importantes: nouveaux modèles, annonces, financements, régulations

FORMAT pour chaque article:
- title: Titre EXACT de l'article (en français si possible, sinon garder l'original)
- summary: Résumé en français de 2-3 phrases
- source_name: Nom du site (ex: "TechCrunch", "The Verge", "01net")
- source_url: URL DIRECTE de l'article (PAS la homepage)
- published_date: Date de publication (format YYYY-MM-DD)
- tags: 2-4 tags pertinents

SOURCES PRIORITAIRES:
- TechCrunch, The Verge, Wired, VentureBeat, Ars Technica
- Forbes, Bloomberg, Reuters
- OpenAI Blog, Anthropic, Google AI, Meta AI
- Sites français: L'Usine Digitale, 01net, Le Monde Informatique

NE PAS INCLURE:
- Articles de plus de 2 semaines
- URLs de homepage ou de catégories
- Articles sponsorisés ou publicités
- Contenu dupliqué`,
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

            // Exclure les URLs de homepage
            if (normalizedUrl.match(/\.(com|fr|io|ai|org|net)\/?$/)) continue;

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
              published_date: article.published_date || new Date().toISOString().split('T')[0],
              tags: article.tags || [],
              status: 'new'
            });

            seenUrls.add(normalizedUrl);
          }
        }
      } catch (error) {
        console.error(`Error scanning: ${error.message}`);
      }

      // Pause entre requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Créer les découvertes
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} news discoveries...`);

      for (let i = 0; i < allDiscoveries.length; i += 20) {
        const batch = allDiscoveries.slice(i, i + 20);
        try {
          await base44.asServiceRole.entities.AINewsDiscovery.bulkCreate(batch);
        } catch (batchError) {
          console.error(`Batch error: ${batchError.message}`);
        }
      }
    }

    console.log('✅ AI News scan complete!');

    return Response.json({
      success: true,
      discovered: allDiscoveries.length,
      queries_processed: searchQueries.length,
      message: `Scan terminé: ${allDiscoveries.length} articles découverts`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});