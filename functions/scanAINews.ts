import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📰 Starting AI News scan with web search...');

    const today = new Date().toISOString().split('T')[0];

    // Récupérer les URLs existantes
    const existingNews = await base44.asServiceRole.entities.AINews.list();
    const existingDiscoveries = await base44.asServiceRole.entities.AINewsDiscovery.list();
    
    const existingUrls = new Set([
      ...existingNews.map(n => n.source_url?.toLowerCase()),
      ...existingDiscoveries.map(d => d.source_url?.toLowerCase())
    ].filter(Boolean));

    // Requêtes de recherche pour l'actualité IA - plus variées et précises
    const newsQueries = [
      "OpenAI ChatGPT news this week",
      "Google Gemini AI announcement",
      "Anthropic Claude AI update",
      "Microsoft Copilot AI news",
      "Meta AI Llama news",
      "AI startup funding round 2024",
      "artificial intelligence breakthrough research",
      "generative AI tools launch",
      "AI regulation law Europe USA",
      "machine learning new model release",
    ];

    // Utiliser toutes les requêtes pour maximiser les résultats
    const shuffledQueries = newsQueries.sort(() => Math.random() - 0.5);
    const allArticles = [];
    const seenUrls = new Set([...existingUrls]);

    // Domaines de news fiables
    const trustedDomains = [
      'techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com',
      'venturebeat.com', 'thenextweb.com', 'engadget.com', 'zdnet.com',
      'reuters.com', 'bbc.com', 'cnn.com', 'nytimes.com', 'wsj.com',
      'bloomberg.com', 'forbes.com', 'businessinsider.com',
      'nature.com', 'science.org', 'ieee.org', 'mit.edu', 'stanford.edu',
      'openai.com', 'anthropic.com', 'deepmind.com', 'ai.meta.com'
    ];

    for (const query of shuffledQueries) {
      console.log(`🔎 Searching news: ${query}`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Search for recent AI news about: "${query}"

Find 2-3 REAL news articles from the past month.

For each article provide:
- title: Original English title
- title_fr: French translation of title
- summary: French summary (3-4 sentences)
- summary_en: English summary (3-4 sentences)  
- content: Detailed French article (3-4 paragraphs)
- content_en: Detailed English article (3-4 paragraphs)
- source_name: Source name (TechCrunch, The Verge, etc.)
- source_url: Full article URL
- tags: 2-3 relevant tags

Only return real articles with valid URLs.`,
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
                    title_fr: { type: "string" },
                    summary: { type: "string" },
                    summary_en: { type: "string" },
                    content: { type: "string" },
                    content_en: { type: "string" },
                    source_name: { type: "string" },
                    source_url: { type: "string" },
                    tags: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        });

        if (response && response.articles) {
          console.log(`✅ Found ${response.articles.length} articles`);
          
          for (const article of response.articles) {
            if (!article.source_url || !article.title) continue;

            const normalizedUrl = article.source_url.toLowerCase();
            
            // Vérifier si existe déjà
            if (seenUrls.has(normalizedUrl)) {
              continue;
            }

            // Extraire le hostname
            let hostname = '';
            let logoUrl = '';
            try {
              const urlObj = new URL(article.source_url);
              hostname = urlObj.hostname.replace(/^www\./, '');
              logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
            } catch {
              continue;
            }

            allArticles.push({
              title: article.title_fr || article.title,
              title_en: article.title,
              summary: article.summary || '',
              summary_en: article.summary_en || '',
              content: article.content || '',
              content_en: article.content_en || '',
              source_name: article.source_name,
              source_url: article.source_url,
              source_logo_url: logoUrl,
              cover_image_url: '', // Sera rempli après
              published_date: today,
              tags: article.tags || [],
              status: 'new'
            });

            seenUrls.add(normalizedUrl);
            console.log(`✅ Added: ${article.title.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.error(`Error for query "${query}": ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Récupérer les images de couverture pour chaque article
    console.log(`🖼️ Fetching cover images for ${allArticles.length} articles...`);
    for (let i = 0; i < allArticles.length; i++) {
      const article = allArticles[i];
      
      try {
        // Utiliser Microlink pour récupérer l'image OpenGraph
        const ogResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(article.source_url)}&meta=true`);
        const ogData = await ogResponse.json();
        
        if (ogData?.data?.image?.url) {
          allArticles[i].cover_image_url = ogData.data.image.url;
          console.log(`🖼️ Cover found for: ${article.title.substring(0, 30)}...`);
        } else if (ogData?.data?.logo?.url) {
          allArticles[i].cover_image_url = ogData.data.logo.url;
          console.log(`🖼️ Logo used for: ${article.title.substring(0, 30)}...`);
        }
      } catch (imgError) {
        console.log(`⚠️ No image for: ${article.title.substring(0, 30)}...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Sauvegarder les découvertes
    let created = 0;
    for (const article of allArticles) {
      try {
        await base44.asServiceRole.entities.AINewsDiscovery.create(article);
        created++;
        console.log(`💾 Saved: ${article.title.substring(0, 40)}...`);
      } catch (e) {
        console.error(`Save error: ${e.message}`);
      }
    }

    console.log(`📰 Scan complete: ${created} articles created`);

    return Response.json({
      success: true,
      total: allArticles.length,
      created: created,
      message: `${created} nouveaux articles ajoutés aux découvertes`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});