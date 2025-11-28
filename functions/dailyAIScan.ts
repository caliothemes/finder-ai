import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('🔍 Starting AI scan with real web search...');

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

    // Requêtes de recherche variées
    const searchQueries = [
      "new AI tools 2024 2025",
      "best AI tools launched recently",
      "AI image generation tools",
      "AI video creation tools",
      "AI writing assistant tools",
      "AI coding assistant tools",
      "AI chatbot platforms",
      "AI productivity tools",
      "AI marketing tools",
      "AI voice generator tools",
      "AI music generator",
      "AI design tools",
      "free AI tools",
      "AI startup tools Product Hunt",
      "AI SaaS tools",
    ];

    // Mélanger et sélectionner quelques requêtes
    const shuffledQueries = searchQueries.sort(() => Math.random() - 0.5).slice(0, 8);

    const allDiscoveries = [];
    const seenUrls = new Set(allExistingUrls);

    // Exclusions - outils trop connus ou domaines génériques
    const excludedDomains = [
      'chatgpt.com', 'openai.com', 'claude.ai', 'anthropic.com', 
      'midjourney.com', 'google.com', 'microsoft.com', 'github.com',
      'youtube.com', 'twitter.com', 'facebook.com', 'linkedin.com',
      'reddit.com', 'wikipedia.org', 'medium.com', 'producthunt.com',
      'futurepedia.io', 'theresanaiforthat.com', 'topai.tools'
    ];

    for (const query of shuffledQueries) {
      console.log(`🔎 Searching: ${query}`);

      try {
        // Utiliser InvokeLLM avec recherche internet pour trouver des outils
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Tu es un expert en outils IA. Recherche sur internet: "${query}"

MISSION: Trouve des outils IA réels et récents (2024-2025).

RÈGLES STRICTES:
1. Retourne UNIQUEMENT des outils que tu trouves vraiment via ta recherche
2. EXCLURE les géants: ChatGPT, Claude, Midjourney, DALL-E, Copilot, Gemini, Bard
3. Retourne l'URL OFFICIELLE du site de l'outil (pas une URL d'annuaire)
4. Vérifie que l'URL est valide
5. Retourne entre 5 et 15 outils uniques

Pour chaque outil trouvé, donne:
- name: Le nom exact du produit
- website_url: L'URL officielle (ex: https://example.ai)
- description: Description en français (50-100 mots)
- tagline: Phrase d'accroche courte en français
- features: 3-5 fonctionnalités clés
- pricing: gratuit, freemium, payant, ou abonnement

IMPORTANT: Ne retourne que des outils réels trouvés via ta recherche. Si tu n'en trouves pas, retourne un tableau vide.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              tools: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    website_url: { type: "string" },
                    description: { type: "string" },
                    tagline: { type: "string" },
                    features: { type: "array", items: { type: "string" } },
                    pricing: { type: "string" }
                  },
                  required: ["name", "website_url"]
                }
              }
            }
          }
        });

        if (response && response.tools) {
          console.log(`✅ Found ${response.tools.length} tools for "${query}"`);
          
          for (const tool of response.tools) {
            if (!tool.website_url || !tool.name) continue;

            // Normaliser et valider l'URL
            let normalizedUrl;
            let hostname;
            try {
              const urlObj = new URL(tool.website_url);
              hostname = urlObj.hostname.replace(/^www\./, '');
              normalizedUrl = hostname + urlObj.pathname.replace(/\/$/, '');
            } catch {
              console.log(`⚠️ Invalid URL: ${tool.website_url}`);
              continue;
            }
            
            // Vérifier si domaine exclu
            if (excludedDomains.some(d => hostname.includes(d))) {
              console.log(`⏭️ Excluded domain: ${hostname}`);
              continue;
            }

            // Vérifier si existe déjà
            if (seenUrls.has(normalizedUrl)) {
              continue;
            }

            // Catégoriser automatiquement
            const suggestedCategories = [];
            const allText = `${tool.name} ${tool.description || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
            
            const categoryMappings = [
              { keywords: ['image', 'photo', 'picture', 'visual', 'art', 'design', 'logo', 'avatar'], slug: 'image-generation' },
              { keywords: ['video', 'film', 'animation', 'motion', 'clip'], slug: 'video' },
              { keywords: ['audio', 'music', 'sound', 'voice', 'speech', 'podcast', 'song'], slug: 'audio' },
              { keywords: ['chat', 'conversation', 'assistant', 'bot', 'gpt'], slug: 'chatbots' },
              { keywords: ['write', 'writing', 'text', 'content', 'copy', 'blog', 'article'], slug: 'writing' },
              { keywords: ['code', 'programming', 'developer', 'coding', 'software'], slug: 'code-assistant' },
              { keywords: ['productivity', 'workflow', 'automation', 'task', 'meeting'], slug: 'productivity' },
              { keywords: ['marketing', 'seo', 'ads', 'social media', 'email'], slug: 'marketing' },
              { keywords: ['education', 'learning', 'study', 'tutor', 'course'], slug: 'education' },
              { keywords: ['business', 'finance', 'sales', 'crm', 'analytics'], slug: 'business' },
            ];

            for (const mapping of categoryMappings) {
              if (mapping.keywords.some(kw => allText.includes(kw))) {
                const cat = categories.find(c => c.slug === mapping.slug);
                if (cat && !suggestedCategories.includes(cat.id)) {
                  suggestedCategories.push(cat.id);
                }
              }
            }

            // Favicon comme logo
            const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
            
            // Image de couverture via OpenGraph scraping
            const coverUrl = `https://opengraph.io/api/1.1/site/${encodeURIComponent(tool.website_url)}?accept_lang=auto&app_id=default`;

            allDiscoveries.push({
              name: tool.name,
              website_url: tool.website_url,
              description: tool.description || '',
              tagline: tool.tagline || '',
              features: tool.features || [],
              suggested_pricing: tool.pricing || 'freemium',
              suggested_categories: suggestedCategories,
              cover_image_url: '', // Sera rempli après
              logo_url: logoUrl,
              status: 'new',
              source: `Search: ${query}`,
              tags: [],
              _hostname: hostname // Pour récupérer l'image après
            });

            seenUrls.add(normalizedUrl);
            console.log(`✅ Added: ${tool.name}`);
          }
        }
      } catch (error) {
        console.error(`Error for query "${query}": ${error.message}`);
      }

      // Pause entre requêtes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Créer les découvertes
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} new discoveries...`);
      
      // Récupérer les images OpenGraph pour chaque découverte
      for (let i = 0; i < allDiscoveries.length; i++) {
        const discovery = allDiscoveries[i];
        
        try {
          // Essayer de récupérer l'image OpenGraph du site
          const ogResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(discovery.website_url)}&meta=true`);
          const ogData = await ogResponse.json();
          
          if (ogData?.data?.image?.url) {
            allDiscoveries[i].cover_image_url = ogData.data.image.url;
            console.log(`🖼️ OG Image found for: ${discovery.name}`);
          } else if (ogData?.data?.logo?.url) {
            // Utiliser le logo comme fallback
            allDiscoveries[i].cover_image_url = ogData.data.logo.url;
            console.log(`🖼️ Logo used for: ${discovery.name}`);
          } else {
            // Générer une image si aucune trouvée
            console.log(`⚠️ No OG image for ${discovery.name}, generating...`);
            const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
              prompt: `Professional modern banner for AI tool "${discovery.name}". ${discovery.tagline || 'AI technology'}. Abstract futuristic design, gradient purple pink blue, technology aesthetic, clean minimal, no text.`
            });
            if (imageResult?.url) {
              allDiscoveries[i].cover_image_url = imageResult.url;
            }
          }
        } catch (imgError) {
          console.log(`⚠️ Image fetch failed for ${discovery.name}: ${imgError.message}`);
        }
        
        // Nettoyer le champ temporaire
        delete allDiscoveries[i]._hostname;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Sauvegarder les découvertes
      for (const discovery of allDiscoveries) {
        try {
          await base44.asServiceRole.entities.AIServiceDiscovery.create(discovery);
          console.log(`💾 Saved: ${discovery.name}`);
        } catch (e) {
          console.error(`Save error: ${e.message}`);
        }
      }
    }

    console.log('✅ AI Scan complete!');
    
    return Response.json({
      success: true,
      discovered: allDiscoveries.length,
      queries_processed: shuffledQueries.length,
      message: `Scan terminé: ${allDiscoveries.length} nouveaux outils IA découverts`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});