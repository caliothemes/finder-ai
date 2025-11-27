import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📰 Starting AI News scan with web search...');

    const today = new Date().toISOString().split('T')[0];
    const allDiscoveries = [];

    // Sources d'actualités IA connues à scanner
    const newsSources = [
      { query: "site:techcrunch.com artificial intelligence", name: "TechCrunch" },
      { query: "site:theverge.com AI artificial intelligence", name: "The Verge" },
      { query: "site:wired.com artificial intelligence AI", name: "Wired" },
      { query: "site:venturebeat.com AI machine learning", name: "VentureBeat" },
      { query: "site:arstechnica.com AI artificial intelligence", name: "Ars Technica" },
      { query: "site:zdnet.com artificial intelligence", name: "ZDNet" },
      { query: "site:engadget.com AI", name: "Engadget" },
      { query: "site:01net.com intelligence artificielle", name: "01net" },
      { query: "site:numerama.com intelligence artificielle", name: "Numerama" },
      { query: "site:siecledigital.fr intelligence artificielle", name: "Siècle Digital" },
      { query: "OpenAI ChatGPT GPT-4 news 2024", name: "OpenAI News" },
      { query: "Google Gemini Bard AI news 2024", name: "Google AI News" },
      { query: "Anthropic Claude AI news 2024", name: "Anthropic News" },
      { query: "Midjourney Stable Diffusion DALL-E news 2024", name: "AI Image News" },
      { query: "AI startup funding raised 2024", name: "AI Startups" }
    ];

    // Scanner chaque source
    for (const source of newsSources) {
      console.log(`🔎 Searching: ${source.name}...`);

      try {
        // Utiliser InvokeLLM avec recherche internet activée
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Search the web for: "${source.query}"

Find 5-10 recent news articles (from the last 7 days) and extract:
- title: exact article headline
- summary: 2 sentence summary in French  
- source_name: publication name
- source_url: full article URL (must be a complete URL starting with https://)
- published_date: date in YYYY-MM-DD format (estimate if not exact)
- tags: 2-3 keywords

Return ONLY real articles with valid URLs. No homepages, only article pages.`,
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
                  }
                }
              }
            }
          }
        });

        if (result?.articles?.length > 0) {
          console.log(`✅ Found ${result.articles.length} articles from ${source.name}`);
          
          for (const article of result.articles) {
            if (!article.title || !article.source_url) continue;
            if (!article.source_url.startsWith('http')) continue;
            
            // Extraire favicon
            let logoUrl = '';
            try {
              const url = new URL(article.source_url);
              logoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
            } catch (e) {
              continue;
            }

            allDiscoveries.push({
              title: article.title,
              summary: article.summary || '',
              source_name: article.source_name || source.name,
              source_url: article.source_url,
              source_logo_url: logoUrl,
              published_date: article.published_date || today,
              tags: article.tags || [],
              status: 'new'
            });
          }
        }
      } catch (error) {
        console.error(`Error with ${source.name}: ${error.message}`);
      }

      // Pause courte
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Dédupliquer par URL
    const uniqueUrls = new Set();
    const uniqueDiscoveries = allDiscoveries.filter(d => {
      const url = d.source_url.toLowerCase();
      if (uniqueUrls.has(url)) return false;
      uniqueUrls.add(url);
      return true;
    });

    console.log(`📊 Total unique articles: ${uniqueDiscoveries.length}`);

    // Vérifier les doublons avec la base
    const existingNews = await base44.asServiceRole.entities.AINews.list();
    const existingDiscoveries = await base44.asServiceRole.entities.AINewsDiscovery.list();
    
    const existingUrls = new Set([
      ...existingNews.map(n => n.source_url?.toLowerCase()),
      ...existingDiscoveries.map(d => d.source_url?.toLowerCase())
    ].filter(Boolean));

    const newDiscoveries = uniqueDiscoveries.filter(d => 
      !existingUrls.has(d.source_url.toLowerCase())
    );

    console.log(`📝 New articles to create: ${newDiscoveries.length}`);

    // Créer les découvertes une par une
    let created = 0;
    for (const discovery of newDiscoveries) {
      try {
        await base44.asServiceRole.entities.AINewsDiscovery.create(discovery);
        created++;
        console.log(`✅ Created: ${discovery.title.substring(0, 40)}...`);
      } catch (e) {
        console.error(`Failed: ${e.message}`);
      }
    }

    return Response.json({
      success: true,
      scanned: newsSources.length,
      found: uniqueDiscoveries.length,
      new: newDiscoveries.length,
      created: created,
      message: `${created} nouveaux articles créés sur ${uniqueDiscoveries.length} trouvés`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});