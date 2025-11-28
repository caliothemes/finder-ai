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

MISSION: Trouve des articles d'actualité IA récents (dernières semaines/mois).

RÈGLES:
1. Retourne UNIQUEMENT des articles réels trouvés via ta recherche
2. Privilégie les sources fiables: TechCrunch, The Verge, Wired, VentureBeat, Reuters, Bloomberg, etc.
3. L'URL doit pointer vers l'article original (pas un agrégateur)
4. Articles de moins de 3 mois idéalement
5. Retourne 5 à 10 articles

Pour chaque article:
- title: Titre de l'article (en anglais original)
- title_fr: Titre traduit en français
- summary: Résumé en français (2-3 phrases)
- source_name: Nom de la source (ex: TechCrunch)
- source_url: URL complète de l'article
- tags: 2-4 tags pertinents

IMPORTANT: Ne retourne que des articles réels. Si tu n'en trouves pas, retourne un tableau vide.`,
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
              summary_en: '',
              source_name: article.source_name,
              source_url: article.source_url,
              source_logo_url: logoUrl,
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