import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('📰 Starting AI News scan...');

    const today = new Date().toISOString().split('T')[0];
    const allDiscoveries = [];

    // Une seule requête large et explicite
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant de recherche d'actualités. Utilise internet pour trouver les dernières actualités sur l'intelligence artificielle.

DATE: ${today}

MISSION: Trouve 30 articles d'actualité récents sur l'IA publiés cette semaine.

Sujets à rechercher:
- ChatGPT, GPT-4, GPT-5, OpenAI
- Claude, Anthropic
- Gemini, Google AI
- Midjourney, DALL-E, Stable Diffusion
- Sora, génération vidéo IA
- Startups IA, levées de fonds
- Régulation IA, lois
- Nouveaux outils IA
- Actualités tech IA en général

Pour chaque article, donne:
- title: titre exact
- summary: résumé en français (2 phrases)
- source_name: nom du site (ex: TechCrunch)
- source_url: URL complète de l'article
- published_date: date au format YYYY-MM-DD
- tags: 2-3 mots-clés

Retourne UNIQUEMENT des articles RÉELS avec des URLs valides.`,
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

    console.log('LLM Response:', JSON.stringify(response));

    if (response && response.articles) {
      for (const article of response.articles) {
        if (!article.source_url || !article.title) continue;

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
          source_name: article.source_name || 'Unknown',
          source_url: article.source_url,
          source_logo_url: logoUrl,
          published_date: article.published_date || today,
          tags: article.tags || [],
          status: 'new'
        });
      }
    }

    // Créer les découvertes
    let created = 0;
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} discoveries...`);
      
      for (const discovery of allDiscoveries) {
        try {
          await base44.asServiceRole.entities.AINewsDiscovery.create(discovery);
          created++;
          console.log(`✅ Created: ${discovery.title.substring(0, 50)}`);
        } catch (e) {
          console.error(`Error creating: ${e.message}`);
        }
      }
    }

    return Response.json({
      success: true,
      found: allDiscoveries.length,
      created: created,
      message: `${created} articles créés`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});