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

    // Requêtes de recherche pour l'actualité IA
    const newsQueries = [
      "artificial intelligence news today",
      "AI latest announcements 2024 2025",
      "OpenAI news updates",
      "Google AI Gemini news",
      "AI startup funding news",
      "machine learning breakthrough news",
      "generative AI news updates",
      "AI regulation policy news",
    ];

    const shuffledQueries = newsQueries.sort(() => Math.random() - 0.5).slice(0, 5);
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
          prompt: `Tu es un journaliste tech spécialisé en IA. Recherche les dernières actualités: "${query}"

MISSION: Trouve 3-5 articles d'actualité IA récents.

RÈGLES:
1. Retourne UNIQUEMENT des articles réels trouvés via ta recherche
2. Sources fiables: TechCrunch, The Verge, Wired, VentureBeat, Reuters, Bloomberg, etc.
3. URL doit pointer vers l'article original
4. Retourne 3-5 articles MAX

Pour chaque article:
- title: Titre en anglais
- title_fr: Titre en français  
- summary: Résumé détaillé en français (5-8 phrases, couvre les points clés, chiffres, implications)
- summary_en: Summary in English (5-8 sentences)
- content: Article complet en français (4-6 paragraphes développant le sujet en détail)
- content_en: Full article in English (4-6 paragraphs)
- source_name: Nom source
- source_url: URL complète
- tags: 2-3 tags

IMPORTANT: Ne retourne que des articles réels avec du contenu substantiel.`,
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

      await new Promise(resolve => setTimeout(resolve, 2000));
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