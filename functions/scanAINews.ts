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

    const seenUrls = new Set(existingUrls);
    const today = new Date().toISOString().split('T')[0];

    // Requêtes simples et efficaces
    const newsQueries = [
      "OpenAI ChatGPT news today",
      "Google Gemini AI announcement",
      "Anthropic Claude update",
      "AI startup funding 2024",
      "artificial intelligence breakthrough",
      "new AI tool launched",
      "machine learning news",
      "generative AI update",
      "Midjourney Stable Diffusion news",
      "AI regulation Europe USA",
      "Meta AI Llama news",
      "Microsoft Copilot update",
      "AI video generation Sora",
      "AI music Suno Udio news",
      "robotics AI news",
      "autonomous AI agents",
      "intelligence artificielle actualité",
      "IA générative nouveautés",
      "ChatGPT mise à jour",
      "outils IA tendance"
    ];

    const allDiscoveries = [];

    // Scanner avec des requêtes groupées pour plus d'efficacité
    for (let i = 0; i < newsQueries.length; i += 4) {
      const batch = newsQueries.slice(i, i + 4);
      const combinedQuery = batch.join(' OR ');
      
      console.log(`🔎 Scanning batch ${Math.floor(i/4) + 1}...`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Find the latest AI news articles from the internet. Search for: ${combinedQuery}

TODAY'S DATE: ${today}

TASK: Search the internet and find 20-30 REAL news articles about artificial intelligence published in the last 7 days.

For EACH article found, provide:
- title: The exact article title
- summary: A 2-3 sentence summary in French
- source_name: The publication name (TechCrunch, The Verge, Wired, etc.)
- source_url: The DIRECT URL to the article (must be a full article URL, not a homepage)
- published_date: Publication date in YYYY-MM-DD format
- tags: 2-4 relevant tags

IMPORTANT RULES:
1. Only return REAL articles you found via internet search
2. URLs must be direct article links (e.g., techcrunch.com/2024/11/27/article-title)
3. Do NOT return homepage URLs or category pages
4. Include articles from various sources: tech news, AI blogs, mainstream media
5. Prioritize recent articles (last 48 hours if possible)

VALID SOURCES: TechCrunch, The Verge, Wired, VentureBeat, Ars Technica, ZDNet, CNET, Engadget, Forbes, Bloomberg, Reuters, BBC, CNN, 01net, L'Usine Digitale, Le Monde Informatique, Numerama, OpenAI Blog, Google AI Blog, Anthropic Blog, etc.`,
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

        if (response && response.articles && response.articles.length > 0) {
          console.log(`✅ Found ${response.articles.length} articles in batch`);

          for (const article of response.articles) {
            if (!article.source_url || !article.title) continue;
            if (article.source_url.length < 30) continue; // URL trop courte = probablement homepage

            const normalizedUrl = article.source_url.toLowerCase();
            
            // Skip si déjà vu
            if (seenUrls.has(normalizedUrl)) continue;

            // Vérifier que c'est une vraie URL d'article
            try {
              const urlObj = new URL(article.source_url);
              const path = urlObj.pathname;
              
              // Rejeter les homepages et pages de catégories
              if (path === '/' || path === '' || path.length < 10) continue;
              if (path.match(/^\/(category|tag|author|page|search|topics?|about|contact)\/?$/i)) continue;
              
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
        console.error(`Error in batch: ${error.message}`);
      }

      // Petite pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Dédupliquer par titre similaire
    const uniqueDiscoveries = [];
    const seenTitles = new Set();
    
    for (const discovery of allDiscoveries) {
      const normalizedTitle = discovery.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueDiscoveries.push(discovery);
      }
    }

    // Créer les découvertes
    if (uniqueDiscoveries.length > 0) {
      console.log(`📝 Creating ${uniqueDiscoveries.length} news discoveries...`);

      // Créer en petits batches
      for (let i = 0; i < uniqueDiscoveries.length; i += 10) {
        const batch = uniqueDiscoveries.slice(i, i + 10);
        try {
          await base44.asServiceRole.entities.AINewsDiscovery.bulkCreate(batch);
          console.log(`✅ Created batch ${Math.floor(i/10) + 1}`);
        } catch (batchError) {
          console.error(`Batch error: ${batchError.message}`);
          // Essayer un par un si le batch échoue
          for (const item of batch) {
            try {
              await base44.asServiceRole.entities.AINewsDiscovery.create(item);
            } catch (e) {
              console.error(`Single create error: ${e.message}`);
            }
          }
        }
      }
    }

    console.log('✅ AI News scan complete!');

    return Response.json({
      success: true,
      discovered: uniqueDiscoveries.length,
      message: `Scan terminé: ${uniqueDiscoveries.length} articles découverts`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});