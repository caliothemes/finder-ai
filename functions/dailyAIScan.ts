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

    // Sources de recherche pour ratisser large
    const searchQueries = [
      "list of new AI image generation tools launched in 2024-2025 with websites",
      "best AI video editing software products with URLs and pricing",
      "popular AI writing tools and content generators website list",
      "AI coding assistants and code completion tools 2025",
      "trending AI chatbot platforms and conversational AI services",
      "AI design and UI/UX tools with official websites",
      "AI voice generation and text-to-speech services",
      "AI productivity and automation tools directory",
      "AI SEO and marketing automation platforms",
      "AI data analysis and business intelligence tools"
    ];

    const allDiscoveries = [];
    const categories = await base44.asServiceRole.entities.Category.list();

    // Scanner chaque source
    for (const query of searchQueries) {
      console.log(`🔎 Searching: ${query}`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Tu es un expert en recherche d'outils IA. Cherche sur le web des outils IA sur: "${query}"

TÂCHE: Trouve 15-20 outils IA RÉELS avec ces informations:

Pour CHAQUE outil:
- name: Nom exact (ex: "ChatGPT", "Midjourney")
- website_url: URL complète (ex: "https://openai.com/chatgpt")
- description: Ce que fait l'outil en détail (100-150 mots, en français)
- tagline: Phrase d'accroche courte (français, max 60 caractères)
- features: Liste de 4-5 fonctionnalités clés (en français)
- pricing: "gratuit", "freemium", "payant" ou "abonnement"

EXEMPLES CONCRETS À INCLURE:
- ChatGPT (https://chat.openai.com)
- Midjourney (https://midjourney.com)
- Claude (https://claude.ai)
- Jasper (https://jasper.ai)
- Copy.ai (https://copy.ai)
- Runway (https://runwayml.com)
- ElevenLabs (https://elevenlabs.io)
- Synthesia (https://synthesia.io)
- Notion AI (https://notion.so)

RÈGLES STRICTES:
1. Cherche de VRAIS outils qui existent maintenant
2. Vérifie que les URLs sont correctes
3. Mélange outils connus ET nouveaux
4. Varie les catégories (image, texte, vidéo, code, etc.)
5. Descriptions en français, complètes et détaillées
6. Retourne minimum 15 outils différents

Ne JAMAIS inventer. Utilise la recherche web pour trouver des outils réels.`,
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

            // Extraire le domaine pour récupérer le favicon
            let logoUrl = '';
            try {
              const url = new URL(service.website_url);
              logoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
            } catch (error) {
              console.log(`Invalid URL for ${service.name}`);
            }

            allDiscoveries.push({
              name: service.name,
              website_url: service.website_url,
              description: service.description || '',
              tagline: service.tagline || '',
              features: service.features || [],
              suggested_pricing: service.pricing || 'freemium',
              suggested_categories: suggestedCategories,
              cover_image_url: '',
              logo_url: logoUrl,
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

    // Créer les découvertes en batch et générer les images en parallèle
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} new discoveries...`);
      
      // Créer par batch de 20 pour éviter timeout
      for (let i = 0; i < allDiscoveries.length; i += 20) {
        const batch = allDiscoveries.slice(i, i + 20);
        
        // Créer les discoveries
        const createdDiscoveries = await base44.asServiceRole.entities.AIServiceDiscovery.bulkCreate(batch);
        
        // Générer les images en parallèle pour ce batch
        const imagePromises = createdDiscoveries.map(async (discovery) => {
          try {
            const imagePrompt = `Professional, modern, tech-focused cover image for ${discovery.name}, an AI tool. Abstract, gradient, futuristic style with purple and pink tones. No text, no words.`;
            const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
              prompt: imagePrompt
            });
            
            // Mettre à jour la discovery avec l'image
            await base44.asServiceRole.entities.AIServiceDiscovery.update(discovery.id, {
              cover_image_url: imageResult.url
            });
            
            console.log(`✅ Image generated for ${discovery.name}`);
          } catch (error) {
            console.log(`❌ Could not generate image for ${discovery.name}:`, error.message);
          }
        });
        
        // Attendre que toutes les images du batch soient générées
        await Promise.all(imagePromises);
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