import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('🔍 Starting AI scan...');

    // Récupérer les services existants pour éviter les doublons
    const existingServices = await base44.asServiceRole.entities.AIService.list();
    const existingUrls = existingServices.map(s => 
      s.website_url?.toLowerCase().replace(/\/$/, '')
    ).filter(Boolean);

    const existingDiscoveries = await base44.asServiceRole.entities.AIServiceDiscovery.list();
    const existingDiscoveryUrls = existingDiscoveries.map(d => 
      d.website_url?.toLowerCase().replace(/\/$/, '')
    ).filter(Boolean);

    const allExistingUrls = [...new Set([...existingUrls, ...existingDiscoveryUrls])];

    // Sources de recherche pour ratisser large - focus sur les 10 premières seulement pour test
    const searchQueries = [
      "Top 50 AI image generation tools 2025: Midjourney, DALL-E, Stable Diffusion alternatives",
      "Best AI video editing software: Runway ML, Descript, Pictory, InVideo, Synthesia",
      "AI writing assistants: Jasper, Copy.ai, Writesonic, Rytr, ChatGPT alternatives",
      "AI coding tools: GitHub Copilot, Tabnine, Codeium, Replit Ghostwriter",
      "AI chatbots and virtual assistants: Claude, Perplexity, Character.AI, Replika",
      "AI design tools: Canva AI, Uizard, Galileo AI, Looka logo maker",
      "AI voice generators: ElevenLabs, Play.ht, Murf, Resemble AI",
      "AI productivity tools: Notion AI, ClickUp AI, Otter.ai transcription",
      "AI marketing tools: Jasper Marketing, Copy.ai, Surfer SEO",
      "AI data analytics: Tableau AI, Power BI AI, DataRobot"
    ];

    const allDiscoveries = [];
    const categories = await base44.asServiceRole.entities.Category.list();

    // Scanner chaque source
    for (const query of searchQueries) {
      console.log(`🔎 Searching: ${query}`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are an AI service discovery bot. Search the web for "${query}".
          
Find and extract 30-50 real AI services/tools that exist right now.

For each service, provide:
- name: Full service name
- website_url: Official website URL (must be real and accessible)
- description: What the service does (2-3 sentences)
- tagline: Short catchy description (10 words max)
- features: Array of 3-5 key features
- pricing: One of: "gratuit", "freemium", "payant", "abonnement"

IMPORTANT:
- Only include services that have an actual website
- Verify URLs are real (use .com, .ai, .io, .app domains)
- No concept services or ideas, only real launched products
- Include both popular and lesser-known services
- Focus on services from the last 3 years
- Diversify: don't just list chatbots, include various AI categories`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              services: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    website_url: { type: "string" },
                    description: { type: "string" },
                    tagline: { type: "string" },
                    features: { 
                      type: "array",
                      items: { type: "string" }
                    },
                    pricing: { 
                      type: "string",
                      enum: ["gratuit", "freemium", "payant", "abonnement"]
                    }
                  },
                  required: ["name", "website_url"]
                }
              }
            }
          }
        });

        if (response && response.services) {
          console.log(`✅ Found ${response.services.length} services for: ${query}`);
          
          // Filtrer et ajouter les découvertes
          for (const service of response.services) {
            if (!service.website_url || !service.name) continue;

            const normalizedUrl = service.website_url.toLowerCase().replace(/\/$/, '');
            
            // Vérifier si existe déjà
            if (allExistingUrls.includes(normalizedUrl)) {
              continue;
            }

            // Catégoriser automatiquement
            const suggestedCategories = [];
            const desc = (service.description || '').toLowerCase();
            const name = service.name.toLowerCase();
            
            if (desc.includes('image') || desc.includes('photo') || desc.includes('design') || desc.includes('visual')) {
              const imageCat = categories.find(c => c.slug === 'image-generation');
              if (imageCat) suggestedCategories.push(imageCat.id);
            }
            if (desc.includes('video') || desc.includes('film')) {
              const videoCat = categories.find(c => c.slug === 'video');
              if (videoCat) suggestedCategories.push(videoCat.id);
            }
            if (desc.includes('chat') || desc.includes('conversation') || desc.includes('assistant')) {
              const chatCat = categories.find(c => c.slug === 'chatbots');
              if (chatCat) suggestedCategories.push(chatCat.id);
            }
            if (desc.includes('write') || desc.includes('writing') || desc.includes('content') || desc.includes('text')) {
              const writeCat = categories.find(c => c.slug === 'writing');
              if (writeCat) suggestedCategories.push(writeCat.id);
            }
            if (desc.includes('code') || desc.includes('programming') || desc.includes('developer')) {
              const codeCat = categories.find(c => c.slug === 'code-assistant');
              if (codeCat) suggestedCategories.push(codeCat.id);
            }

            // Générer une image de couverture avec l'IA
            let coverImageUrl = '';
            try {
              const imagePrompt = `Professional, modern, tech-focused cover image for ${service.name}, an AI tool for ${service.tagline || service.description?.slice(0, 100)}. Abstract, gradient, futuristic style with purple and pink tones. No text.`;
              const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: imagePrompt
              });
              coverImageUrl = imageResult.url;
            } catch (error) {
              console.log(`Could not generate image for ${service.name}`);
            }

            allDiscoveries.push({
              name: service.name,
              website_url: service.website_url,
              description: service.description || '',
              tagline: service.tagline || '',
              features: service.features || [],
              suggested_pricing: service.pricing || 'freemium',
              suggested_categories: suggestedCategories,
              cover_image_url: coverImageUrl,
              logo_url: '', // Logo sera ajouté manuellement si nécessaire
              status: 'new',
              source: `Auto scan: ${query}`
            });

            // Ajouter à la liste des URLs existantes pour éviter doublons dans ce scan
            allExistingUrls.push(normalizedUrl);
          }
        }
      } catch (error) {
        console.error(`Error scanning ${query}:`, error.message);
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Créer les découvertes en batch
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} new discoveries...`);
      
      // Créer par batch de 50
      for (let i = 0; i < allDiscoveries.length; i += 50) {
        const batch = allDiscoveries.slice(i, i + 50);
        await base44.asServiceRole.entities.AIServiceDiscovery.bulkCreate(batch);
      }
    }

    console.log('✅ Scan complete!');
    
    return Response.json({
      success: true,
      discovered: allDiscoveries.length,
      total_discoveries: existingDiscoveries.length + allDiscoveries.length,
      message: `Scan completed: ${allDiscoveries.length} new AI services discovered`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});